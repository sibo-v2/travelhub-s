export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
}

export const geocodingService = {
  async geocodePlace(placeName: string, cityName: string): Promise<GeocodingResult | null> {
    try {
      const query = `${placeName}, ${cityName}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  async batchGeocode(places: Array<{ name: string; city: string }>): Promise<GeocodingResult[]> {
    const results: GeocodingResult[] = [];

    for (const place of places) {
      const result = await geocodingService.geocodePlace(place.name, place.city);
      if (result) {
        results.push(result);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  },
};
