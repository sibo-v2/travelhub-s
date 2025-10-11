import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Flight = Database['public']['Tables']['flights']['Row'];
type Destination = Database['public']['Tables']['destinations']['Row'];
type TransportationBooking = Database['public']['Tables']['transportation_bookings']['Row'];

export interface SearchFilters {
  query: string;
  category: 'all' | 'flights' | 'destinations' | 'transportation';
  priceRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  rating?: number;
  origin?: string;
  destination?: string;
  flightClass?: string;
  destinationCategory?: string;
  sortBy?: 'price' | 'rating' | 'duration' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  flights: Flight[];
  destinations: Destination[];
  transportation: TransportationBooking[];
  totalResults: number;
}

export class SearchService {
  static async performSearch(filters: SearchFilters, userId?: string): Promise<SearchResults> {
    const results: SearchResults = {
      flights: [],
      destinations: [],
      transportation: [],
      totalResults: 0,
    };

    if (filters.category === 'all' || filters.category === 'flights') {
      results.flights = await this.searchFlights(filters);
    }

    if (filters.category === 'all' || filters.category === 'destinations') {
      results.destinations = await this.searchDestinations(filters);
    }

    if (filters.category === 'all' || filters.category === 'transportation') {
      results.transportation = await this.searchTransportation(filters);
    }

    results.totalResults = results.flights.length + results.destinations.length + results.transportation.length;

    if (userId && filters.query) {
      await this.recordSearchHistory(userId, filters, results.totalResults);
    }

    return results;
  }

  private static async searchFlights(filters: SearchFilters): Promise<Flight[]> {
    let query = supabase.from('flights').select('*');

    if (filters.query) {
      query = query.or(`origin.ilike.%${filters.query}%,destination.ilike.%${filters.query}%,airline.ilike.%${filters.query}%`);
    }

    if (filters.origin) {
      query = query.ilike('origin', `%${filters.origin}%`);
    }

    if (filters.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }

    if (filters.flightClass && filters.flightClass !== 'all') {
      query = query.eq('class_type', filters.flightClass);
    }

    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange.min).lte('price', filters.priceRange.max);
    }

    if (filters.dateRange?.start) {
      query = query.gte('departure_time', filters.dateRange.start);
    }

    if (filters.dateRange?.end) {
      query = query.lte('departure_time', filters.dateRange.end);
    }

    if (filters.sortBy === 'price') {
      query = query.order('price', { ascending: filters.sortOrder === 'asc' });
    } else if (filters.sortBy === 'duration') {
      query = query.order('duration_minutes', { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('departure_time', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching flights:', error);
      return [];
    }

    return data || [];
  }

  private static async searchDestinations(filters: SearchFilters): Promise<Destination[]> {
    let query = supabase.from('destinations').select('*');

    if (filters.query) {
      query = query.or(`city.ilike.%${filters.query}%,country.ilike.%${filters.query}%,name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters.destinationCategory && filters.destinationCategory !== 'all') {
      query = query.eq('category', filters.destinationCategory);
    }

    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.sortBy === 'rating') {
      query = query.order('rating', { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('rating', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching destinations:', error);
      return [];
    }

    return data || [];
  }

  private static async searchTransportation(filters: SearchFilters): Promise<TransportationBooking[]> {
    let query = supabase.from('transportation_bookings').select('*');

    if (filters.query) {
      query = query.or(`origin.ilike.%${filters.query}%,destination.ilike.%${filters.query}%`);
    }

    if (filters.origin) {
      query = query.ilike('origin', `%${filters.origin}%`);
    }

    if (filters.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }

    if (filters.priceRange) {
      query = query.gte('total_price', filters.priceRange.min).lte('total_price', filters.priceRange.max);
    }

    if (filters.sortBy === 'price') {
      query = query.order('total_price', { ascending: filters.sortOrder === 'asc' });
    } else if (filters.sortBy === 'duration') {
      query = query.order('duration_minutes', { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching transportation:', error);
      return [];
    }

    return data || [];
  }

  private static async recordSearchHistory(userId: string, filters: SearchFilters, resultsCount: number): Promise<void> {
    await supabase.from('search_history').insert({
      user_id: userId,
      search_query: filters.query,
      search_type: filters.category,
      filters: {
        priceRange: filters.priceRange,
        dateRange: filters.dateRange,
        rating: filters.rating,
        origin: filters.origin,
        destination: filters.destination,
        flightClass: filters.flightClass,
        destinationCategory: filters.destinationCategory,
      },
      results_count: resultsCount,
    });
  }

  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const suggestions = new Set<string>();

    const { data: flights } = await supabase
      .from('flights')
      .select('origin, destination')
      .or(`origin.ilike.%${query}%,destination.ilike.%${query}%`)
      .limit(limit);

    flights?.forEach(flight => {
      if (flight.origin.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(flight.origin);
      }
      if (flight.destination.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(flight.destination);
      }
    });

    const { data: destinations } = await supabase
      .from('destinations')
      .select('city, country')
      .or(`city.ilike.%${query}%,country.ilike.%${query}%`)
      .limit(limit);

    destinations?.forEach(dest => {
      if (dest.city.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(dest.city);
      }
      if (dest.country.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(dest.country);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  static async getRecentSearches(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }

    return data || [];
  }

  static async toggleFavorite(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('user_favorites').insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
      });
      return true;
    }
  }

  static async isFavorite(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();

    return !!data;
  }

  static async saveSearch(userId: string, name: string, filters: SearchFilters): Promise<void> {
    await supabase.from('saved_searches').insert({
      user_id: userId,
      name,
      search_query: filters.query,
      search_type: filters.category,
      filters: {
        priceRange: filters.priceRange,
        dateRange: filters.dateRange,
        rating: filters.rating,
        origin: filters.origin,
        destination: filters.destination,
        flightClass: filters.flightClass,
        destinationCategory: filters.destinationCategory,
      },
    });
  }

  static async getSavedSearches(userId: string) {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }

    return data || [];
  }
}
