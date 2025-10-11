/*
  # Create Itinerary System Tables

  ## Overview
  Creates tables for the comprehensive itinerary planning system.

  ## New Tables
  
  ### 1. `trip_days`
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips.id)
  - `date` (date)
  - `day_number` (integer)
  - `subheading` (text, nullable)
  - `total_distance` (numeric)
  - `total_duration` (integer)
  - `created_at` (timestamptz)

  ### 2. `trip_places`
  - `id` (uuid, primary key)
  - `trip_day_id` (uuid, references trip_days.id)
  - `position` (integer)
  - `name` (text)
  - `category` (text)
  - `description` (text)
  - `image_url` (text)
  - `hours` (text)
  - `cost` (numeric)
  - `notes` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `address` (text)
  - `rating` (numeric)
  - `website` (text)
  - `duration` (integer)
  - `visited` (boolean)
  - `distance_to_next` (numeric)
  - `time_to_next` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own trip data through trips table ownership
*/

CREATE TABLE IF NOT EXISTS trip_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  day_number integer NOT NULL,
  subheading text,
  total_distance numeric DEFAULT 0,
  total_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id uuid REFERENCES trip_days(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  category text DEFAULT 'attraction',
  description text,
  image_url text,
  hours text,
  cost numeric DEFAULT 0,
  notes text,
  latitude numeric,
  longitude numeric,
  address text,
  rating numeric,
  website text,
  duration integer DEFAULT 60,
  visited boolean DEFAULT false,
  distance_to_next numeric DEFAULT 0,
  time_to_next integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_places_trip_day_id ON trip_places(trip_day_id);
CREATE INDEX IF NOT EXISTS idx_trip_places_position ON trip_places(trip_day_id, position);

ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trip days through trips"
  ON trip_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trip days"
  ON trip_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update trip days"
  ON trip_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trip days"
  ON trip_days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view trip places"
  ON trip_places FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_days
      JOIN trips ON trips.id = trip_days.trip_id
      WHERE trip_days.id = trip_places.trip_day_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trip places"
  ON trip_places FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_days
      JOIN trips ON trips.id = trip_days.trip_id
      WHERE trip_days.id = trip_places.trip_day_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update trip places"
  ON trip_places FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_days
      JOIN trips ON trips.id = trip_days.trip_id
      WHERE trip_days.id = trip_places.trip_day_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_days
      JOIN trips ON trips.id = trip_days.trip_id
      WHERE trip_days.id = trip_places.trip_day_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trip places"
  ON trip_places FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_days
      JOIN trips ON trips.id = trip_days.trip_id
      WHERE trip_days.id = trip_places.trip_day_id
      AND trips.user_id = auth.uid()
    )
  );
