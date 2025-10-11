import { supabase } from '../lib/supabase';

export interface UserTrip {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  totalCost: number;
  travelers: number;
  tripData: any;
  bookings: TripBooking[];
  createdAt: string;
  updatedAt: string;
}

export interface TripBooking {
  id: string;
  tripId: string;
  type: 'flight' | 'hotel' | 'activity';
  name: string;
  bookingReference?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  cost: number;
  date: string;
  details: any;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'place' | 'activity' | 'hotel' | 'restaurant';
  itemId: string;
  itemName: string;
  itemData: any;
  notes?: string;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  tripReminders: boolean;
  marketingEmails: boolean;
  currency: string;
  language: string;
  timezone: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

class DashboardService {
  async getUserTrips(userId: string, status?: 'upcoming' | 'completed'): Promise<{
    success: boolean;
    trips?: UserTrip[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from('user_trips')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: status === 'upcoming' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const trips: UserTrip[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        destination: item.destination,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        totalCost: item.total_cost,
        travelers: item.travelers,
        tripData: item.trip_data,
        bookings: item.bookings || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return { success: true, trips };
    } catch (error) {
      console.error('Error fetching user trips:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
      };
    }
  }

  async getSavedItems(userId: string): Promise<{
    success: boolean;
    items?: SavedItem[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: SavedItem[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        itemType: item.item_type,
        itemId: item.item_id,
        itemName: item.item_name,
        itemData: item.item_data,
        notes: item.notes,
        createdAt: item.created_at,
      }));

      return { success: true, items };
    } catch (error) {
      console.error('Error fetching saved items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved items',
      };
    }
  }

  async removeSavedItem(userId: string, itemId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', userId)
        .eq('id', itemId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing saved item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item',
      };
    }
  }

  async getUserPreferences(userId: string): Promise<{
    success: boolean;
    preferences?: UserPreferences;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          success: true,
          preferences: {
            userId,
            emailNotifications: true,
            pushNotifications: true,
            tripReminders: true,
            marketingEmails: false,
            currency: 'USD',
            language: 'en',
            timezone: 'America/New_York',
          },
        };
      }

      const preferences: UserPreferences = {
        userId: data.user_id,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        tripReminders: data.trip_reminders,
        marketingEmails: data.marketing_emails,
        currency: data.currency,
        language: data.language,
        timezone: data.timezone,
      };

      return { success: true, preferences };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch preferences',
      };
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: userId,
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          trip_reminders: preferences.tripReminders,
          marketing_emails: preferences.marketingEmails,
          currency: preferences.currency,
          language: preferences.language,
          timezone: preferences.timezone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      };
    }
  }

  async getPaymentMethods(userId: string): Promise<{
    success: boolean;
    methods?: PaymentMethod[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      const methods: PaymentMethod[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        last4: item.last4,
        brand: item.brand,
        expiryMonth: item.expiry_month,
        expiryYear: item.expiry_year,
        isDefault: item.is_default,
        createdAt: item.created_at,
      }));

      return { success: true, methods };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
      };
    }
  }

  calculateCountdown(startDate: string): {
    days: number;
    hours: number;
    minutes: number;
    isPast: boolean;
  } {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isPast: false };
  }

  async searchTrips(
    userId: string,
    searchQuery: string,
    filters?: {
      status?: string[];
      minCost?: number;
      maxCost?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ success: boolean; trips?: UserTrip[]; error?: string }> {
    try {
      let query = supabase
        .from('user_trips')
        .select('*')
        .eq('user_id', userId);

      if (searchQuery) {
        query = query.ilike('destination', `%${searchQuery}%`);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.minCost !== undefined) {
        query = query.gte('total_cost', filters.minCost);
      }

      if (filters?.maxCost !== undefined) {
        query = query.lte('total_cost', filters.maxCost);
      }

      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      const { data, error } = await query.order('start_date', { ascending: false });

      if (error) throw error;

      const trips: UserTrip[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        destination: item.destination,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        totalCost: item.total_cost,
        travelers: item.travelers,
        tripData: item.trip_data,
        bookings: item.bookings || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return { success: true, trips };
    } catch (error) {
      console.error('Error searching trips:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search trips',
      };
    }
  }
}

export const dashboardService = new DashboardService();
