/*
  # Create Trip Hotels Junction Table

  ## Overview
  This migration creates the trip_hotels junction table to link users' trips with their saved/bookmarked hotels.

  ## 1. New Tables
    
    ### `trip_hotels`
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, foreign key) - Reference to auth.users
    - `hotel_id` (uuid, foreign key) - Reference to hotels table
    - `booking_status` (text) - Status: saved, booked, cancelled
    - `created_at` (timestamptz) - When hotel was added to trip
    - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on trip_hotels table
    - Users can only view and manage their own hotel trip entries
    - Authenticated users can create, read, update, and delete their own entries

  ## 3. Important Notes
    - Allows users to save hotels to their trip for later reference
    - Integrates with existing My Trip functionality
*/

-- Create trip_hotels table
CREATE TABLE IF NOT EXISTS trip_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  booking_status text DEFAULT 'saved' CHECK (booking_status IN ('saved', 'booked', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trip_hotels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own trip hotels"
  ON trip_hotels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add hotels to their trip"
  ON trip_hotels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip hotels"
  ON trip_hotels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip hotels"
  ON trip_hotels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
