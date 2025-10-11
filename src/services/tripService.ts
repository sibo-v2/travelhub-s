import { supabase } from '../lib/supabase';

export class TripService {
  static async addFlightToTrip(userId: string, flightId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('trip_flights')
      .select('id')
      .eq('user_id', userId)
      .eq('flight_id', flightId)
      .maybeSingle();

    if (existing) {
      return false;
    }

    const { error } = await supabase.from('trip_flights').insert({
      user_id: userId,
      flight_id: flightId,
      booking_status: 'saved',
    });

    return !error;
  }

  static async addDestinationToTrip(userId: string, destinationId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('trip_destinations')
      .select('id')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .maybeSingle();

    if (existing) {
      return false;
    }

    const { error } = await supabase.from('trip_destinations').insert({
      user_id: userId,
      destination_id: destinationId,
      priority: 'want_to_see',
    });

    return !error;
  }

  static async addTransportationToTrip(userId: string, transportationId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('trip_transportation')
      .select('id')
      .eq('user_id', userId)
      .eq('transportation_booking_id', transportationId)
      .maybeSingle();

    if (existing) {
      return false;
    }

    const { error } = await supabase.from('trip_transportation').insert({
      user_id: userId,
      transportation_booking_id: transportationId,
      booking_status: 'saved',
    });

    return !error;
  }

  static async addHotelToTrip(userId: string, hotelId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('trip_hotels')
      .select('id')
      .eq('user_id', userId)
      .eq('hotel_id', hotelId)
      .maybeSingle();

    if (existing) {
      return false;
    }

    const { error } = await supabase.from('trip_hotels').insert({
      user_id: userId,
      hotel_id: hotelId,
      booking_status: 'saved',
    });

    return !error;
  }

  static async getLatestFlightDestination(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('trip_flights')
      .select('flights(destination)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && data.flights && typeof data.flights === 'object' && 'destination' in data.flights) {
      return data.flights.destination as string;
    }

    return null;
  }
}
