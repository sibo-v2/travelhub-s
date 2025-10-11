/*
  # Saved Places System

  Creates table for storing user-saved places from discovery feature.

  ## Table Created

  ### saved_places
  Stores places that users have added to their trips
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `trip_id` (text) - Associated trip identifier
  - `place_id` (text) - External place ID from Google/Yelp
  - `place_name` (text) - Name of the place
  - `place_category` (text) - Category (restaurant, attraction, etc.)
  - `place_data` (jsonb) - Complete place information
  - `created_at` (timestamptz) - When place was saved

  ## Security
  - Row Level Security (RLS) enabled
  - Users can only access their own saved places
  - Policies for SELECT, INSERT, and DELETE operations

  ## Indexes
  - Fast lookups by user_id and trip_id
  - Optimized for checking if place is already saved
*/

-- Create saved_places table
CREATE TABLE IF NOT EXISTS saved_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id text NOT NULL,
  place_id text NOT NULL,
  place_name text NOT NULL,
  place_category text NOT NULL,
  place_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_trip_id ON saved_places(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place_id ON saved_places(place_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_user_trip ON saved_places(user_id, trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_created_at ON saved_places(created_at DESC);

-- Create unique constraint to prevent duplicate saves
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_places_unique
  ON saved_places(user_id, trip_id, place_id);

-- Enable Row Level Security
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_places

-- Users can view their own saved places
CREATE POLICY "Users can view own saved places"
  ON saved_places
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can save places to their trips
CREATE POLICY "Users can save places"
  ON saved_places
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own saved places
CREATE POLICY "Users can remove saved places"
  ON saved_places
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
