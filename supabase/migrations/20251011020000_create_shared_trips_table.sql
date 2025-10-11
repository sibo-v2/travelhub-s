/*
  # Trip Sharing System

  Creates tables and functions for sharing trips with unique shareable links.

  ## Table Created

  ### shared_trips
  Stores shared trip information with privacy controls
  - `id` (uuid, primary key) - Unique identifier
  - `share_id` (text, unique) - Public-facing share identifier (10 chars)
  - `user_id` (uuid, foreign key) - References auth.users (trip owner)
  - `trip_plan_id` (text) - Reference to the trip plan
  - `trip_data` (jsonb) - Complete trip plan data
  - `privacy_level` (text) - Privacy setting: public, private, friends-only
  - `title` (text) - Trip title for sharing
  - `description` (text, nullable) - Optional custom message
  - `view_count` (integer) - Number of times the trip has been viewed
  - `created_at` (timestamptz) - Share creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Functions

  ### increment_trip_views
  Safely increments the view count for a shared trip

  ## Security
  - Row Level Security (RLS) enabled
  - Public read access for public trips
  - Owner can manage their own shared trips
  - Privacy-aware policies

  ## Indexes
  - Fast lookups by share_id (unique)
  - User's shared trips
  - Public trips discovery
*/

-- Create shared_trips table
CREATE TABLE IF NOT EXISTS shared_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_plan_id text NOT NULL,
  trip_data jsonb NOT NULL,
  privacy_level text NOT NULL CHECK (privacy_level IN ('public', 'private', 'friends-only')),
  title text NOT NULL,
  description text,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_trips_share_id ON shared_trips(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_trips_user_id ON shared_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_trips_privacy ON shared_trips(privacy_level);
CREATE INDEX IF NOT EXISTS idx_shared_trips_created_at ON shared_trips(created_at DESC);

-- Enable Row Level Security
ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_trips

-- Anyone can view public trips
CREATE POLICY "Anyone can view public trips"
  ON shared_trips
  FOR SELECT
  USING (privacy_level = 'public');

-- Authenticated users can view their own trips regardless of privacy
CREATE POLICY "Users can view own shared trips"
  ON shared_trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create shared trips
CREATE POLICY "Users can create shared trips"
  ON shared_trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shared trips
CREATE POLICY "Users can update own shared trips"
  ON shared_trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shared trips
CREATE POLICY "Users can delete own shared trips"
  ON shared_trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_trip_views(share_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_trips
  SET view_count = view_count + 1
  WHERE shared_trips.share_id = increment_trip_views.share_id;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_shared_trips_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_shared_trips_updated_at_trigger
      BEFORE UPDATE ON shared_trips
      FOR EACH ROW
      EXECUTE FUNCTION update_shared_trips_updated_at();
  END IF;
END $$;
