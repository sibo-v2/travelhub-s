/*
  # My Trip System Schema

  ## Overview
  Creates comprehensive trip management system to track user's planned travel
  including booked flights, saved destinations, and transportation bookings.

  ## New Tables

  ### user_trips
  Main trip container for organizing travel plans
  - `id` (uuid, primary key) - Unique trip ID
  - `user_id` (uuid, foreign key to auth.users) - Trip owner
  - `trip_name` (text) - User-defined trip name
  - `destination` (text) - Primary destination
  - `start_date` (date) - Trip start date
  - `end_date` (date) - Trip end date
  - `status` (text) - planning, confirmed, completed, cancelled
  - `notes` (text) - Trip notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### trip_flights
  Flights added to user's trip
  - `id` (uuid, primary key) - Unique record ID
  - `user_id` (uuid, foreign key to auth.users) - User ID
  - `trip_id` (uuid, foreign key to user_trips) - Associated trip (nullable)
  - `flight_id` (uuid, foreign key to flights) - The flight
  - `booking_status` (text) - saved, confirmed, cancelled
  - `booking_reference` (text) - Booking confirmation code
  - `notes` (text) - User notes
  - `added_at` (timestamptz) - When added to trip
  - `updated_at` (timestamptz) - Last update

  ### trip_destinations
  Destinations/attractions added to trip
  - `id` (uuid, primary key) - Unique record ID
  - `user_id` (uuid, foreign key to auth.users) - User ID
  - `trip_id` (uuid, foreign key to user_trips) - Associated trip (nullable)
  - `destination_id` (uuid, foreign key to destinations) - The destination
  - `visit_date` (date) - Planned visit date (nullable)
  - `priority` (text) - must_see, want_to_see, maybe
  - `notes` (text) - User notes
  - `added_at` (timestamptz) - When added
  - `updated_at` (timestamptz) - Last update

  ### trip_transportation
  Transportation bookings added to trip
  - `id` (uuid, primary key) - Unique record ID
  - `user_id` (uuid, foreign key to auth.users) - User ID
  - `trip_id` (uuid, foreign key to user_trips) - Associated trip (nullable)
  - `transportation_booking_id` (uuid, foreign key to transportation_bookings) - The booking
  - `booking_status` (text) - saved, confirmed, cancelled
  - `notes` (text) - User notes
  - `added_at` (timestamptz) - When added
  - `updated_at` (timestamptz) - Last update

  ## Security
  - Enable RLS on all tables
  - Users can only access their own trip data
  - Authenticated users only

  ## Indexes
  - Index on user_id for fast user queries
  - Index on trip_id for trip-based queries
  - Index on added_at for chronological sorting

  ## Notes
  - Trip ID is nullable to support items not yet assigned to specific trip
  - Users can create multiple trips
  - Items can be moved between trips
  - Status tracking enables workflow management
*/

CREATE TABLE IF NOT EXISTS user_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_name text NOT NULL,
  destination text NOT NULL,
  start_date date,
  end_date date,
  status text DEFAULT 'planning',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES user_trips(id) ON DELETE SET NULL,
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  booking_status text DEFAULT 'saved',
  booking_reference text DEFAULT '',
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flight_id)
);

CREATE TABLE IF NOT EXISTS trip_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES user_trips(id) ON DELETE SET NULL,
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  visit_date date,
  priority text DEFAULT 'want_to_see',
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

CREATE TABLE IF NOT EXISTS trip_transportation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES user_trips(id) ON DELETE SET NULL,
  transportation_booking_id uuid NOT NULL REFERENCES transportation_bookings(id) ON DELETE CASCADE,
  booking_status text DEFAULT 'saved',
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, transportation_booking_id)
);

ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_transportation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own trips"
  ON user_trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON user_trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON user_trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON user_trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own trip flights"
  ON trip_flights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trip flights"
  ON trip_flights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip flights"
  ON trip_flights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip flights"
  ON trip_flights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own trip destinations"
  ON trip_destinations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trip destinations"
  ON trip_destinations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip destinations"
  ON trip_destinations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip destinations"
  ON trip_destinations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own trip transportation"
  ON trip_transportation FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trip transportation"
  ON trip_transportation FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip transportation"
  ON trip_transportation FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip transportation"
  ON trip_transportation FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON user_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trips_start_date ON user_trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trip_flights_user_id ON trip_flights(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_flights_trip_id ON trip_flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_destinations_user_id ON trip_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_destinations_trip_id ON trip_destinations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_transportation_user_id ON trip_transportation(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_transportation_trip_id ON trip_transportation(trip_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_trips_updated_at'
  ) THEN
    CREATE TRIGGER set_user_trips_updated_at
      BEFORE UPDATE ON user_trips
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_trip_flights_updated_at'
  ) THEN
    CREATE TRIGGER set_trip_flights_updated_at
      BEFORE UPDATE ON trip_flights
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_trip_destinations_updated_at'
  ) THEN
    CREATE TRIGGER set_trip_destinations_updated_at
      BEFORE UPDATE ON trip_destinations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_trip_transportation_updated_at'
  ) THEN
    CREATE TRIGGER set_trip_transportation_updated_at
      BEFORE UPDATE ON trip_transportation
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
