export interface FlightSearchParams {
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  origin: string;
  destination: string;
  departureDate: Date | null;
  returnDate?: Date | null;
  multiCityLegs?: any[];
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  stopCities?: string[];
  price: number;
  cabinClass: string;
  availableSeats: number;
  layoverDuration?: number;
}

export interface FlightFilters {
  priceRange: [number, number];
  airlines: string[];
  departureTime: string[];
  stops: number[];
}

export type SortOption = 'cheapest' | 'fastest' | 'best';

export class FlightResultsService {
  private static n8nWebhookUrl = 'https://your-n8n-instance/webhook/flight-search';

  static async searchFlights(
    searchParams: FlightSearchParams,
    page: number = 1,
    filters?: Partial<FlightFilters>,
    sortBy: SortOption = 'best'
  ): Promise<{ results: FlightResult[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchParams,
          page,
          filters,
          sortBy,
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight results');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching flights:', error);
      return this.getMockFlightResults(searchParams, page, filters, sortBy);
    }
  }

  private static getMockFlightResults(
    searchParams: FlightSearchParams,
    page: number,
    filters?: Partial<FlightFilters>,
    sortBy: SortOption = 'best'
  ): { results: FlightResult[]; total: number; page: number; totalPages: number } {
    const airlines = [
      { name: 'United Airlines', code: 'UA' },
      { name: 'Delta Air Lines', code: 'DL' },
      { name: 'American Airlines', code: 'AA' },
      { name: 'Emirates', code: 'EK' },
      { name: 'British Airways', code: 'BA' },
      { name: 'Lufthansa', code: 'LH' },
      { name: 'Air France', code: 'AF' },
      { name: 'Singapore Airlines', code: 'SQ' },
    ];

    const allResults: FlightResult[] = [];

    for (let i = 0; i < 87; i++) {
      const airline = airlines[i % airlines.length];
      const stops = [0, 0, 0, 1, 1, 2][Math.floor(Math.random() * 6)];
      const baseDuration = 360 + Math.floor(Math.random() * 600);
      const duration = baseDuration + (stops * 120);
      const basePrice = 300 + Math.floor(Math.random() * 1200);
      const stopCities = stops === 1 ? ['London'] : stops === 2 ? ['Dubai', 'Singapore'] : [];

      const departureHour = 6 + Math.floor(Math.random() * 18);
      const departureDate = searchParams.departureDate || new Date();
      const departure = new Date(departureDate);
      departure.setHours(departureHour, Math.floor(Math.random() * 60));

      const arrival = new Date(departure.getTime() + duration * 60000);

      allResults.push({
        id: `flight-${i + 1}`,
        airline: airline.name,
        flightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 9000)}`,
        origin: searchParams.origin.split('(')[0].trim(),
        destination: searchParams.destination.split('(')[0].trim(),
        departureTime: departure.toISOString(),
        arrivalTime: arrival.toISOString(),
        duration,
        stops,
        stopCities,
        price: basePrice + (stops * 50),
        cabinClass: searchParams.cabinClass,
        availableSeats: 5 + Math.floor(Math.random() * 20),
        layoverDuration: stops > 0 ? 60 + Math.floor(Math.random() * 180) : undefined,
      });
    }

    let filteredResults = [...allResults];

    if (filters?.priceRange) {
      filteredResults = filteredResults.filter(
        (flight) => flight.price >= filters.priceRange![0] && flight.price <= filters.priceRange![1]
      );
    }

    if (filters?.airlines && filters.airlines.length > 0) {
      filteredResults = filteredResults.filter((flight) =>
        filters.airlines!.includes(flight.airline)
      );
    }

    if (filters?.stops && filters.stops.length > 0) {
      filteredResults = filteredResults.filter((flight) => filters.stops!.includes(flight.stops));
    }

    if (filters?.departureTime && filters.departureTime.length > 0) {
      filteredResults = filteredResults.filter((flight) => {
        const hour = new Date(flight.departureTime).getHours();
        return filters.departureTime!.some((timeRange) => {
          if (timeRange === 'morning' && hour >= 6 && hour < 12) return true;
          if (timeRange === 'afternoon' && hour >= 12 && hour < 18) return true;
          if (timeRange === 'evening' && hour >= 18 && hour < 24) return true;
          if (timeRange === 'night' && (hour >= 0 && hour < 6)) return true;
          return false;
        });
      });
    }

    switch (sortBy) {
      case 'cheapest':
        filteredResults.sort((a, b) => a.price - b.price);
        break;
      case 'fastest':
        filteredResults.sort((a, b) => a.duration - b.duration);
        break;
      case 'best':
        filteredResults.sort((a, b) => {
          const scoreA = (1000 / a.price) * (1000 / a.duration) * (a.stops === 0 ? 2 : 1);
          const scoreB = (1000 / b.price) * (1000 / b.duration) * (b.stops === 0 ? 2 : 1);
          return scoreB - scoreA;
        });
        break;
    }

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      total: filteredResults.length,
      page,
      totalPages: Math.ceil(filteredResults.length / 20),
    };
  }

  static getAvailableAirlines(results: FlightResult[]): string[] {
    const airlines = new Set<string>();
    results.forEach((flight) => airlines.add(flight.airline));
    return Array.from(airlines).sort();
  }

  static getPriceRange(results: FlightResult[]): [number, number] {
    if (results.length === 0) return [0, 2000];
    const prices = results.map((f) => f.price);
    return [Math.min(...prices), Math.max(...prices)];
  }

  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  static formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  static formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
