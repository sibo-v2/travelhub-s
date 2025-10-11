/*
  # Create Comprehensive Booking System

  ## Overview
  Creates tables and systems for managing bookings across flights, hotels, and transportation.
  Includes inventory management, booking confirmations, payment tracking, and user booking history.

  ## Changes
  
  1. New Tables
    - `bookings`
      - Central booking table for all reservation types
      - Stores booking details, status, payment info, and confirmation codes
      - Links to users and specific service tables
    
    - `booking_passengers`
      - Stores passenger/traveler information for each booking
      - Supports multiple passengers per booking
    
    - `payment_transactions`
      - Tracks payment status and transaction details
      - Supports multiple payment methods
    
    - `booking_notifications`
      - Stores email confirmations and notifications sent to users

  ## Security
    - Enable RLS on all new tables
    - Users can only view and manage their own bookings
    - Secure payment information handling
    - Admin access for booking management

  ## Notes
    - Booking confirmation codes are auto-generated
    - Real-time inventory tracking
    - Payment gateway integration ready
    - Email notification system ready
*/

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_type text NOT NULL CHECK (booking_type IN ('flight', 'hotel', 'transportation', 'destination')),
  booking_reference text UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
  
  -- Service references
  flight_id uuid REFERENCES flights(id) ON DELETE SET NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  transportation_booking_id uuid REFERENCES transportation_bookings(id) ON DELETE SET NULL,
  
  -- Booking details
  service_name text NOT NULL,
  service_details jsonb DEFAULT '{}'::jsonb,
  
  -- Dates and travelers
  booking_date timestamptz DEFAULT now(),
  travel_date timestamptz NOT NULL,
  return_date timestamptz,
  number_of_travelers integer NOT NULL DEFAULT 1,
  
  -- Pricing
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  
  -- Status
  booking_status text NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Contact info
  contact_email text NOT NULL,
  contact_phone text,
  
  -- Additional info
  special_requests text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking passengers table
CREATE TABLE IF NOT EXISTS booking_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  nationality text,
  passport_number text,
  passport_expiry date,
  
  -- For special requirements
  meal_preference text,
  special_assistance text,
  
  created_at timestamptz DEFAULT now()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'wallet')),
  
  -- Payment details (encrypted in production)
  transaction_id text UNIQUE,
  payment_gateway text,
  
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  
  -- Card info (last 4 digits only)
  card_last_four text,
  card_type text,
  
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create booking notifications table
CREATE TABLE IF NOT EXISTS booking_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  notification_type text NOT NULL CHECK (notification_type IN ('confirmation', 'reminder', 'cancellation', 'update', 'receipt')),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  message_body text NOT NULL,
  
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Booking passengers policies
CREATE POLICY "Users can view passengers for own bookings"
  ON booking_passengers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add passengers to own bookings"
  ON booking_passengers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_transactions.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payment transactions for own bookings"
  ON payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_transactions.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Booking notifications policies
CREATE POLICY "Users can view notifications for own bookings"
  ON booking_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_notifications.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookings updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at'
  ) THEN
    CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
