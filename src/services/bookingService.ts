import { supabase } from '../lib/supabase';

export interface BookingDetails {
  bookingType: 'flight' | 'hotel' | 'transportation' | 'destination';
  serviceName: string;
  serviceDetails: any;
  travelDate: string;
  returnDate?: string;
  numberOfTravelers: number;
  totalAmount: number;
  contactEmail: string;
  contactPhone?: string;
  specialRequests?: string;
  flightId?: string;
  destinationId?: string;
  transportationBookingId?: string;
}

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  mealPreference?: string;
  specialAssistance?: string;
}

export interface PaymentDetails {
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'wallet';
  cardLastFour?: string;
  cardType?: string;
}

export const bookingService = {
  async createBooking(
    userId: string,
    bookingDetails: BookingDetails,
    passengers: PassengerDetails[],
    paymentDetails: PaymentDetails
  ) {
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          booking_type: bookingDetails.bookingType,
          flight_id: bookingDetails.flightId,
          destination_id: bookingDetails.destinationId,
          transportation_booking_id: bookingDetails.transportationBookingId,
          service_name: bookingDetails.serviceName,
          service_details: bookingDetails.serviceDetails,
          travel_date: bookingDetails.travelDate,
          return_date: bookingDetails.returnDate,
          number_of_travelers: bookingDetails.numberOfTravelers,
          total_amount: bookingDetails.totalAmount,
          contact_email: bookingDetails.contactEmail,
          contact_phone: bookingDetails.contactPhone,
          special_requests: bookingDetails.specialRequests,
          payment_status: 'processing',
          booking_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      if (passengers.length > 0) {
        const passengerInserts = passengers.map((passenger) => ({
          booking_id: booking.id,
          first_name: passenger.firstName,
          last_name: passenger.lastName,
          date_of_birth: passenger.dateOfBirth,
          gender: passenger.gender,
          nationality: passenger.nationality,
          passport_number: passenger.passportNumber,
          passport_expiry: passenger.passportExpiry,
          meal_preference: passenger.mealPreference,
          special_assistance: passenger.specialAssistance,
        }));

        const { error: passengersError } = await supabase
          .from('booking_passengers')
          .insert(passengerInserts);

        if (passengersError) throw passengersError;
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          booking_id: booking.id,
          amount: paymentDetails.amount,
          payment_method: paymentDetails.paymentMethod,
          card_last_four: paymentDetails.cardLastFour,
          card_type: paymentDetails.cardType,
          status: 'processing',
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          payment_gateway: 'stripe',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await supabase
        .from('payment_transactions')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('id', payment.id);

      await supabase
        .from('bookings')
        .update({ payment_status: 'completed', booking_status: 'confirmed' })
        .eq('id', booking.id);

      await supabase.from('booking_notifications').insert({
        booking_id: booking.id,
        notification_type: 'confirmation',
        recipient_email: bookingDetails.contactEmail,
        subject: `Booking Confirmation - ${booking.booking_reference}`,
        message_body: `Your booking has been confirmed! Reference: ${booking.booking_reference}`,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      return { success: true, booking, payment };
    } catch (error) {
      console.error('Booking error:', error);
      return { success: false, error };
    }
  },

  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_passengers (*),
        payment_transactions (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBookingByReference(userId: string, bookingReference: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_passengers (*),
        payment_transactions (*),
        booking_notifications (*)
      `)
      .eq('user_id', userId)
      .eq('booking_reference', bookingReference)
      .single();

    if (error) throw error;
    return data;
  },

  async cancelBooking(userId: string, bookingId: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userId);

    if (error) throw error;

    await supabase.from('booking_notifications').insert({
      booking_id: bookingId,
      notification_type: 'cancellation',
      recipient_email: '',
      subject: 'Booking Cancellation Confirmation',
      message_body: 'Your booking has been cancelled.',
      status: 'pending',
    });

    return { success: true };
  },

  async updateBooking(userId: string, bookingId: string, updates: Partial<BookingDetails>) {
    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};
