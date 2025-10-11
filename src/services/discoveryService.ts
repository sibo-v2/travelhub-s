import { supabase } from '../lib/supabase';

export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'attraction'
  | 'museum'
  | 'park'
  | 'shopping'
  | 'entertainment';

export type PriceLevel = 1 | 2 | 3 | 4;

export interface PlaceImage {
  url: string;
  attribution?: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  rating: number;
  reviewCount: number;
  priceLevel: PriceLevel;
  images: PlaceImage[];
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  isOpen?: boolean;
  tags: string[];
  source: 'google' | 'yelp';
}

export interface DiscoveryFilters {
  category?: PlaceCategory[];
  priceLevel?: PriceLevel[];
  minRating?: number;
  maxDistance?: number;
  isOpen?: boolean;
}

export type SortBy = 'popularity' | 'rating' | 'distance' | 'price_low' | 'price_high';

class DiscoveryService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_PLACES_WEBHOOK || '';
  }

  async discoverPlaces(
    location: string,
    filters?: DiscoveryFilters,
    sortBy: SortBy = 'popularity',
    limit: number = 20
  ): Promise<{ success: boolean; places?: Place[]; error?: string }> {
    try {
      if (!this.webhookUrl || this.webhookUrl.includes('your-n8n-instance')) {
        return this.getMockPlaces(location, filters, sortBy, limit);
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          filters,
          sortBy,
          limit,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();

      return {
        success: true,
        places: data.places,
      };
    } catch (error) {
      console.error('Error discovering places:', error);
      return this.getMockPlaces(location, filters, sortBy, limit);
    }
  }

  private getMockPlaces(
    location: string,
    filters?: DiscoveryFilters,
    sortBy: SortBy = 'popularity',
    limit: number = 20
  ): { success: boolean; places: Place[] } {
    const mockPlaces: Place[] = [
      {
        id: 'place-1',
        name: 'Le Petit Bistro',
        category: 'restaurant',
        description: 'Authentic French cuisine in an intimate setting with seasonal menu',
        rating: 4.8,
        reviewCount: 342,
        priceLevel: 3,
        images: [
          { url: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: '123 Main Street, Paris, France',
        phone: '+33 1 42 36 54 44',
        website: 'https://example.com',
        hours: 'Mon-Sat: 12:00 PM - 10:00 PM',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        distance: 0.5,
        isOpen: true,
        tags: ['French', 'Fine Dining', 'Romantic', 'Wine Bar'],
        source: 'google',
      },
      {
        id: 'place-2',
        name: 'Urban Coffee House',
        category: 'cafe',
        description: 'Specialty coffee and artisan pastries in a cozy atmosphere',
        rating: 4.6,
        reviewCount: 128,
        priceLevel: 2,
        images: [
          { url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/1833399/pexels-photo-1833399.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: '456 Oak Avenue, Paris, France',
        phone: '+33 1 43 26 48 23',
        hours: 'Daily: 7:00 AM - 6:00 PM',
        coordinates: { lat: 48.8606, lng: 2.3376 },
        distance: 1.2,
        isOpen: true,
        tags: ['Coffee', 'Breakfast', 'WiFi', 'Pastries'],
        source: 'yelp',
      },
      {
        id: 'place-3',
        name: 'Eiffel Tower',
        category: 'attraction',
        description: 'Iconic iron lattice tower and symbol of Paris with panoramic city views',
        rating: 4.9,
        reviewCount: 8942,
        priceLevel: 2,
        images: [
          { url: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: 'Champ de Mars, 5 Avenue Anatole France, Paris',
        hours: 'Daily: 9:30 AM - 11:45 PM',
        coordinates: { lat: 48.8584, lng: 2.2945 },
        distance: 2.1,
        isOpen: true,
        tags: ['Landmark', 'Views', 'Photography', 'Must-See'],
        source: 'google',
      },
      {
        id: 'place-4',
        name: 'Louvre Museum',
        category: 'museum',
        description: "World's largest art museum featuring the Mona Lisa and Venus de Milo",
        rating: 4.7,
        reviewCount: 15230,
        priceLevel: 2,
        images: [
          { url: 'https://images.pexels.com/photos/2675268/pexels-photo-2675268.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: 'Rue de Rivoli, Paris, France',
        hours: 'Wed-Mon: 9:00 AM - 6:00 PM',
        coordinates: { lat: 48.8606, lng: 2.3376 },
        distance: 1.8,
        isOpen: false,
        tags: ['Art', 'History', 'Culture', 'Indoor'],
        source: 'google',
      },
      {
        id: 'place-5',
        name: 'The Jazz Club',
        category: 'bar',
        description: 'Live jazz performances nightly in an intimate underground venue',
        rating: 4.5,
        reviewCount: 267,
        priceLevel: 3,
        images: [
          { url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: '789 Rue de la Paix, Paris, France',
        phone: '+33 1 44 55 66 77',
        hours: 'Tue-Sun: 8:00 PM - 2:00 AM',
        coordinates: { lat: 48.8698, lng: 2.3318 },
        distance: 0.8,
        isOpen: false,
        tags: ['Live Music', 'Jazz', 'Cocktails', 'Nightlife'],
        source: 'yelp',
      },
      {
        id: 'place-6',
        name: 'Luxembourg Gardens',
        category: 'park',
        description: 'Beautiful public garden with fountains, statues, and Luxembourg Palace',
        rating: 4.8,
        reviewCount: 3421,
        priceLevel: 1,
        images: [
          { url: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: 'Rue de Médicis, Paris, France',
        hours: 'Daily: 7:30 AM - Dusk',
        coordinates: { lat: 48.8462, lng: 2.3372 },
        distance: 1.5,
        isOpen: true,
        tags: ['Gardens', 'Outdoor', 'Free', 'Relaxation'],
        source: 'google',
      },
      {
        id: 'place-7',
        name: 'Marché Saint-Germain',
        category: 'shopping',
        description: 'Historic covered market with fresh produce, artisan goods, and cafes',
        rating: 4.4,
        reviewCount: 186,
        priceLevel: 2,
        images: [
          { url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: '4 Rue Lobineau, Paris, France',
        hours: 'Tue-Sat: 8:00 AM - 8:00 PM, Sun: 8:00 AM - 2:00 PM',
        coordinates: { lat: 48.8534, lng: 2.3348 },
        distance: 0.9,
        isOpen: true,
        tags: ['Shopping', 'Food Market', 'Local', 'Souvenirs'],
        source: 'yelp',
      },
      {
        id: 'place-8',
        name: 'Sushi Master',
        category: 'restaurant',
        description: 'Contemporary Japanese restaurant with omakase experience',
        rating: 4.7,
        reviewCount: 445,
        priceLevel: 4,
        images: [
          { url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800' },
          { url: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800' },
        ],
        address: '321 Avenue Montaigne, Paris, France',
        phone: '+33 1 55 66 77 88',
        hours: 'Mon-Sat: 6:00 PM - 11:00 PM',
        coordinates: { lat: 48.8656, lng: 2.3087 },
        distance: 2.3,
        isOpen: false,
        tags: ['Japanese', 'Sushi', 'Fine Dining', 'Chef\'s Table'],
        source: 'google',
      },
    ];

    let filteredPlaces = [...mockPlaces];

    if (filters) {
      if (filters.category && filters.category.length > 0) {
        filteredPlaces = filteredPlaces.filter((p) =>
          filters.category!.includes(p.category)
        );
      }

      if (filters.priceLevel && filters.priceLevel.length > 0) {
        filteredPlaces = filteredPlaces.filter((p) =>
          filters.priceLevel!.includes(p.priceLevel)
        );
      }

      if (filters.minRating) {
        filteredPlaces = filteredPlaces.filter((p) => p.rating >= filters.minRating!);
      }

      if (filters.maxDistance) {
        filteredPlaces = filteredPlaces.filter(
          (p) => !p.distance || p.distance <= filters.maxDistance!
        );
      }

      if (filters.isOpen !== undefined) {
        filteredPlaces = filteredPlaces.filter((p) => p.isOpen === filters.isOpen);
      }
    }

    switch (sortBy) {
      case 'rating':
        filteredPlaces.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filteredPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'price_low':
        filteredPlaces.sort((a, b) => a.priceLevel - b.priceLevel);
        break;
      case 'price_high':
        filteredPlaces.sort((a, b) => b.priceLevel - a.priceLevel);
        break;
      case 'popularity':
      default:
        filteredPlaces.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return {
      success: true,
      places: filteredPlaces.slice(0, limit),
    };
  }

  async addPlaceToTrip(
    userId: string,
    tripId: string,
    place: Place
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('saved_places').insert({
        user_id: userId,
        trip_id: tripId,
        place_id: place.id,
        place_name: place.name,
        place_category: place.category,
        place_data: place,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error adding place to trip:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add place to trip',
      };
    }
  }

  async getSavedPlaces(
    userId: string,
    tripId?: string
  ): Promise<{ success: boolean; places?: Place[]; error?: string }> {
    try {
      let query = supabase
        .from('saved_places')
        .select('*')
        .eq('user_id', userId);

      if (tripId) {
        query = query.eq('trip_id', tripId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const places = (data || []).map((item) => item.place_data as Place);

      return { success: true, places };
    } catch (error) {
      console.error('Error fetching saved places:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved places',
      };
    }
  }

  async removePlaceFromTrip(
    userId: string,
    placeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_places')
        .delete()
        .eq('user_id', userId)
        .eq('place_id', placeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing place from trip:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove place',
      };
    }
  }
}

export const discoveryService = new DiscoveryService();
