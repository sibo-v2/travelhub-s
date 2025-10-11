import { supabase } from '../lib/supabase';

interface HotelBookingData {
  user_id: string;
  hotel_id: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  room_type: string;
  total_price: number;
  status: string;
}

export const hotelService = {
  async createHotelBooking(bookingData: HotelBookingData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hotel_bookings')
        .insert([bookingData]);

      if (error) {
        console.error('Error creating hotel booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createHotelBooking:', error);
      return false;
    }
  },

  async getUserHotelBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('hotel_bookings')
        .select(`
          *,
          hotels (
            id,
            name,
            location,
            address,
            rating,
            price_per_night,
            image_url,
            amenities
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hotel bookings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserHotelBookings:', error);
      return [];
    }
  },

  async cancelHotelBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hotel_bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling hotel booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelHotelBooking:', error);
      return false;
    }
  },

  async deleteHotelBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hotel_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting hotel booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteHotelBooking:', error);
      return false;
    }
  }
};
