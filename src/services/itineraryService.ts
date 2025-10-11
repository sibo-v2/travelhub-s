import { supabase } from '../lib/supabase';

export interface TripPlace {
  id: string;
  trip_day_id: string;
  position: number;
  name: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'activity' | 'transportation';
  description?: string;
  image_url?: string;
  hours?: string;
  cost: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  rating?: number;
  website?: string;
  duration: number;
  visited: boolean;
  distance_to_next: number;
  time_to_next: number;
  created_at?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
  subheading?: string;
  total_distance: number;
  total_duration: number;
  created_at?: string;
  places?: TripPlace[];
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_type: 'budget' | 'time' | 'combination';
  budget?: {
    total: number;
    spent: number;
    currency: string;
    byCategory?: Record<string, number>;
  };
  created_at?: string;
  updated_at?: string;
  days?: TripDay[];
}

export const itineraryService = {
  async createTrip(userId: string, tripData: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        name: tripData.name,
        destination: tripData.destination,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        traveler_type: tripData.traveler_type,
        budget: tripData.budget || {
          total: 5000,
          spent: 0,
          currency: 'USD',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      return null;
    }

    const startDate = new Date(tripData.start_date);
    const endDate = new Date(tripData.end_date);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days = [];
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      days.push({
        trip_id: data.id,
        date: currentDate.toISOString().split('T')[0],
        day_number: i + 1,
        total_distance: 0,
        total_duration: 0,
      });
    }

    await supabase.from('trip_days').insert(days);

    return data;
  },

  async getTrip(tripId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error || !data) {
      console.error('Error fetching trip:', error);
      return null;
    }

    return data;
  },

  async getUserTrips(userId: string): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user trips:', error);
      return [];
    }

    return data || [];
  },

  async getTripWithDays(tripId: string): Promise<Trip | null> {
    const trip = await this.getTrip(tripId);
    if (!trip) return null;

    const { data: days } = await supabase
      .from('trip_days')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true });

    if (days) {
      const daysWithPlaces = await Promise.all(
        days.map(async (day) => {
          const { data: places } = await supabase
            .from('trip_places')
            .select('*')
            .eq('trip_day_id', day.id)
            .order('position', { ascending: true });

          return { ...day, places: places || [] };
        })
      );

      trip.days = daysWithPlaces;
    }

    return trip;
  },

  async addPlaceToDay(place: Omit<TripPlace, 'id' | 'created_at'>): Promise<TripPlace | null> {
    const { data, error } = await supabase
      .from('trip_places')
      .insert(place)
      .select()
      .single();

    if (error) {
      console.error('Error adding place:', error);
      return null;
    }

    await this.updateDayStats(place.trip_day_id);

    return data;
  },

  async updatePlace(placeId: string, updates: Partial<TripPlace>): Promise<boolean> {
    const { error } = await supabase
      .from('trip_places')
      .update(updates)
      .eq('id', placeId);

    if (error) {
      console.error('Error updating place:', error);
      return false;
    }

    return true;
  },

  async removePlace(placeId: string, dayId: string): Promise<boolean> {
    const { error } = await supabase
      .from('trip_places')
      .delete()
      .eq('id', placeId);

    if (error) {
      console.error('Error removing place:', error);
      return false;
    }

    await this.reorderPlaces(dayId);
    await this.updateDayStats(dayId);

    return true;
  },

  async reorderPlaces(dayId: string): Promise<boolean> {
    const { data: places } = await supabase
      .from('trip_places')
      .select('id')
      .eq('trip_day_id', dayId)
      .order('position', { ascending: true });

    if (!places) return false;

    for (let i = 0; i < places.length; i++) {
      await supabase
        .from('trip_places')
        .update({ position: i })
        .eq('id', places[i].id);
    }

    return true;
  },

  async updateDayStats(dayId: string): Promise<void> {
    const { data: places } = await supabase
      .from('trip_places')
      .select('distance_to_next, time_to_next')
      .eq('trip_day_id', dayId);

    if (!places) return;

    const totalDistance = places.reduce((sum, p) => sum + (p.distance_to_next || 0), 0);
    const totalDuration = places.reduce((sum, p) => sum + (p.time_to_next || 0), 0);

    await supabase
      .from('trip_days')
      .update({
        total_distance: totalDistance,
        total_duration: totalDuration,
      })
      .eq('id', dayId);
  },

  async createSampleTokyoTrip(userId: string): Promise<Trip | null> {
    const trip = await this.createTrip(userId, {
      name: 'Trip to Japan',
      destination: 'Tokyo, Japan',
      start_date: '2025-10-10',
      end_date: '2025-10-12',
      traveler_type: 'combination',
      total_budget: 5000,
      currency: 'USD',
    });

    if (!trip) return null;

    const { data: days } = await supabase
      .from('trip_days')
      .select('*')
      .eq('trip_id', trip.id)
      .order('day_number', { ascending: true });

    if (!days || days.length === 0) return trip;

    const day1Places = [
      {
        trip_day_id: days[0].id,
        position: 0,
        name: 'Tokyo Disneyland',
        category: 'attraction' as const,
        description: 'Tokyo offshoot of the iconic theme park known for its rides, live shows & costumed characters.',
        image_url: 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg?auto=compress&cs=tinysrgb&w=800',
        hours: 'Open 8AM–10PM',
        cost: 0,
        notes: '',
        latitude: 35.6329,
        longitude: 139.8804,
        address: '1-1 Maihama, Urayasu, Chiba 279-0031, Japan',
        rating: 4.5,
        website: 'https://www.tokyodisneyresort.jp/en/tdl/',
        duration: 240,
        visited: false,
        distance_to_next: 0.25,
        time_to_next: 5,
      },
      {
        trip_day_id: days[0].id,
        position: 1,
        name: 'Tokyo Disney Resort',
        category: 'hotel' as const,
        description: 'Official Disney resort hotels with magical themed rooms and amenities.',
        image_url: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=800',
        hours: 'Open 24 hours',
        cost: 1000,
        notes: 'Add notes, links, etc. here',
        latitude: 35.6351,
        longitude: 139.8822,
        address: 'Tokyo Disney Resort, Maihama, Urayasu, Chiba',
        rating: 4.7,
        website: 'https://www.tokyodisneyresort.jp/en/hotel/',
        duration: 60,
        visited: false,
        distance_to_next: 1.7,
        time_to_next: 32,
      },
      {
        trip_day_id: days[0].id,
        position: 2,
        name: 'Tokyo DisneySea',
        category: 'attraction' as const,
        description: 'From the web: Part of the Disney resort, this large park has 7 themed ports of call with rides, shows & dining.',
        image_url: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
        hours: 'Open 8AM–10PM',
        cost: 0,
        notes: '',
        latitude: 35.6267,
        longitude: 139.8886,
        address: '1-13 Maihama, Urayasu, Chiba 279-0031, Japan',
        rating: 4.6,
        website: 'https://www.tokyodisneyresort.jp/en/tds/',
        duration: 300,
        visited: false,
        distance_to_next: 0,
        time_to_next: 0,
      },
    ];

    for (const place of day1Places) {
      await supabase.from('trip_places').insert(place);
    }

    await this.updateDayStats(days[0].id);

    return trip;
  },
};
