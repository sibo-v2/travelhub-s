export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string
          airline: string
          flight_number: string
          origin: string
          destination: string
          departure_time: string
          arrival_time: string
          class_type: 'Economy' | 'Business' | 'First'
          price: number
          available_seats: number
          duration_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          airline: string
          flight_number: string
          origin: string
          destination: string
          departure_time: string
          arrival_time: string
          class_type: 'Economy' | 'Business' | 'First'
          price: number
          available_seats?: number
          duration_minutes: number
          created_at?: string
        }
        Update: {
          id?: string
          airline?: string
          flight_number?: string
          origin?: string
          destination?: string
          departure_time?: string
          arrival_time?: string
          class_type?: 'Economy' | 'Business' | 'First'
          price?: number
          available_seats?: number
          duration_minutes?: number
          created_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          city: string
          country: string
          name: string
          description: string
          category: 'attraction' | 'landmark' | 'event' | 'restaurant' | 'museum' | 'park'
          image_url: string
          rating: number
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          city: string
          country: string
          name: string
          description: string
          category: 'attraction' | 'landmark' | 'event' | 'restaurant' | 'museum' | 'park'
          image_url?: string
          rating?: number
          address?: string
          created_at?: string
        }
        Update: {
          id?: string
          city?: string
          country?: string
          name?: string
          description?: string
          category?: 'attraction' | 'landmark' | 'event' | 'restaurant' | 'museum' | 'park'
          image_url?: string
          rating?: number
          address?: string
          created_at?: string
        }
      }
      transportation_bookings: {
        Row: {
          id: string
          service_type: 'standard' | 'premium' | 'shared'
          origin: string
          destination: string
          distance_km: number
          duration_minutes: number
          base_price: number
          total_price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_time: string
          created_at: string
        }
        Insert: {
          id?: string
          service_type: 'standard' | 'premium' | 'shared'
          origin: string
          destination: string
          distance_km: number
          duration_minutes: number
          base_price: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          service_type?: 'standard' | 'premium' | 'shared'
          origin?: string
          destination?: string
          distance_km?: number
          duration_minutes?: number
          base_price?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_time?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string | null
          search_query: string
          search_type: string
          filters: Json
          results_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          search_query: string
          search_type?: string
          filters?: Json
          results_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          search_query?: string
          search_type?: string
          filters?: Json
          results_count?: number
          created_at?: string
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          search_query: string
          search_type: string
          filters: Json
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          search_query: string
          search_type?: string
          filters?: Json
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          search_query?: string
          search_type?: string
          filters?: Json
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          notes?: string
          created_at?: string
        }
      }
      search_preferences: {
        Row: {
          user_id: string
          preferred_airports: string[]
          preferred_destinations: string[]
          budget_range: Json
          travel_style: string
          interests: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferred_airports?: string[]
          preferred_destinations?: string[]
          budget_range?: Json
          travel_style?: string
          interests?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferred_airports?: string[]
          preferred_destinations?: string[]
          budget_range?: Json
          travel_style?: string
          interests?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

      user_trips: {
        Row: {
          id: string
          user_id: string
          trip_name: string
          destination: string
          start_date: string | null
          end_date: string | null
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_name: string
          destination: string
          start_date?: string | null
          end_date?: string | null
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_name?: string
          destination?: string
          start_date?: string | null
          end_date?: string | null
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      trip_flights: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          flight_id: string
          booking_status: string
          booking_reference: string
          notes: string
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          flight_id: string
          booking_status?: string
          booking_reference?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          flight_id?: string
          booking_status?: string
          booking_reference?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
      }
      trip_destinations: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          destination_id: string
          visit_date: string | null
          priority: string
          notes: string
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          destination_id: string
          visit_date?: string | null
          priority?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          destination_id?: string
          visit_date?: string | null
          priority?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
      }
      trip_transportation: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          transportation_booking_id: string
          booking_status: string
          notes: string
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          transportation_booking_id: string
          booking_status?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          transportation_booking_id?: string
          booking_status?: string
          notes?: string
          added_at?: string
          updated_at?: string
        }
      }
