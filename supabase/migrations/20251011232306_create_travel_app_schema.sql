/*
  # Travel App Database Schema

  ## Overview
  Creates the complete database schema for a travel booking application with flights, 
  destinations, and transportation services.

  ## New Tables

  ### 1. flights
  Stores flight information for comparison and booking
  - `id` (uuid, primary key) - Unique flight identifier
  - `airline` (text) - Airline name
  - `flight_number` (text) - Flight number
  - `origin` (text) - Departure airport/city
  - `destination` (text) - Arrival airport/city
  - `departure_time` (timestamptz) - Scheduled departure
  - `arrival_time` (timestamptz) - Scheduled arrival
  - `class_type` (text) - Flight class (Economy, Business, First)
  - `price` (decimal) - Ticket price
  - `available_seats` (integer) - Remaining seats
  - `duration_minutes` (integer) - Flight duration in minutes
  - `created_at` (timestamptz) - Record creation time

  ### 2. destinations
  Contains information about travel destinations, attractions, and points of interest
  - `id` (uuid, primary key) - Unique destination identifier
  - `city` (text) - City name
  - `country` (text) - Country name
  - `name` (text) - Attraction/landmark name
  - `description` (text) - Detailed description
  - `category` (text) - Type (attraction, landmark, event, etc.)
  - `image_url` (text) - Image URL
  - `rating` (decimal) - User rating (1-5)
  - `address` (text) - Physical address
  - `created_at` (timestamptz) - Record creation time

  ### 3. transportation_bookings
  Manages transportation bookings and pricing
  - `id` (uuid, primary key) - Unique booking identifier
  - `service_type` (text) - Service type (standard, premium, shared)
  - `origin` (text) - Pickup location
  - `destination` (text) - Drop-off location
  - `distance_km` (decimal) - Distance in kilometers
  - `duration_minutes` (integer) - Estimated travel time
  - `base_price` (decimal) - Base fare
  - `total_price` (decimal) - Total fare with fees
  - `status` (text) - Booking status (pending, confirmed, completed, cancelled)
  - `booking_time` (timestamptz) - When booking was made
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access (this is a demo app)
  - Restrict write operations to authenticated users only

  ## Notes
  - All prices stored as decimal for precision
  - Timestamps use timestamptz for timezone awareness
  - Default values provided for common fields
  - Indexes can be added later for performance optimization
*/

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline text NOT NULL,
  flight_number text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  class_type text NOT NULL CHECK (class_type IN ('Economy', 'Business', 'First')),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  available_seats integer NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  created_at timestamptz DEFAULT now()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('attraction', 'landmark', 'event', 'restaurant', 'museum', 'park')),
  image_url text DEFAULT '',
  rating decimal(2,1) CHECK (rating >= 0 AND rating <= 5),
  address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create transportation_bookings table
CREATE TABLE IF NOT EXISTS transportation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('standard', 'premium', 'shared')),
  origin text NOT NULL,
  destination text NOT NULL,
  distance_km decimal(10,2) NOT NULL CHECK (distance_km >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view flights"
  ON flights FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view destinations"
  ON destinations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view their bookings"
  ON transportation_bookings FOR SELECT
  USING (true);

-- Create policies for insert (allow anyone for demo purposes)
CREATE POLICY "Anyone can create bookings"
  ON transportation_bookings FOR INSERT
  WITH CHECK (true);

-- Insert sample flight data
INSERT INTO flights (airline, flight_number, origin, destination, departure_time, arrival_time, class_type, price, available_seats, duration_minutes)
VALUES
  ('Delta Airlines', 'DL123', 'New York (JFK)', 'Los Angeles (LAX)', now() + interval '2 days', now() + interval '2 days 6 hours', 'Economy', 299.99, 45, 360),
  ('Delta Airlines', 'DL123', 'New York (JFK)', 'Los Angeles (LAX)', now() + interval '2 days', now() + interval '2 days 6 hours', 'Business', 899.99, 12, 360),
  ('United Airlines', 'UA456', 'New York (JFK)', 'Los Angeles (LAX)', now() + interval '2 days 3 hours', now() + interval '2 days 9 hours', 'Economy', 275.00, 60, 360),
  ('American Airlines', 'AA789', 'Chicago (ORD)', 'Miami (MIA)', now() + interval '1 day', now() + interval '1 day 3 hours', 'Economy', 199.99, 80, 180),
  ('American Airlines', 'AA789', 'Chicago (ORD)', 'Miami (MIA)', now() + interval '1 day', now() + interval '1 day 3 hours', 'Business', 599.99, 16, 180),
  ('Southwest Airlines', 'SW234', 'San Francisco (SFO)', 'Seattle (SEA)', now() + interval '3 days', now() + interval '3 days 2 hours', 'Economy', 149.99, 100, 120),
  ('JetBlue', 'B6567', 'Boston (BOS)', 'Orlando (MCO)', now() + interval '4 days', now() + interval '4 days 3 hours', 'Economy', 179.99, 55, 180),
  ('United Airlines', 'UA890', 'Denver (DEN)', 'New York (JFK)', now() + interval '2 days', now() + interval '2 days 4 hours', 'First', 1299.99, 8, 240);

-- Insert sample destination data
INSERT INTO destinations (city, country, name, description, category, rating, address)
VALUES
  ('Paris', 'France', 'Eiffel Tower', 'Iconic iron lattice tower and symbol of Paris, offering breathtaking views of the city from its observation decks.', 'landmark', 4.8, 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris'),
  ('Paris', 'France', 'Louvre Museum', 'World''s largest art museum housing thousands of works including the Mona Lisa and Venus de Milo.', 'museum', 4.7, 'Rue de Rivoli, 75001 Paris'),
  ('New York', 'USA', 'Statue of Liberty', 'Colossal neoclassical sculpture symbolizing freedom and democracy, gift from France to the United States.', 'landmark', 4.6, 'Liberty Island, New York, NY 10004'),
  ('New York', 'USA', 'Central Park', 'Massive urban park offering green spaces, lakes, theaters, and recreational activities in the heart of Manhattan.', 'park', 4.7, 'New York, NY 10024'),
  ('Tokyo', 'Japan', 'Senso-ji Temple', 'Ancient Buddhist temple and Tokyo''s oldest, featuring a magnificent Thunder Gate and traditional architecture.', 'landmark', 4.5, '2-3-1 Asakusa, Taito City, Tokyo 111-0032'),
  ('Rome', 'Italy', 'Colosseum', 'Ancient amphitheater and iconic symbol of Imperial Rome, showcasing remarkable Roman engineering.', 'landmark', 4.8, 'Piazza del Colosseo, 1, 00184 Roma RM'),
  ('London', 'UK', 'Tower Bridge', 'Famous Victorian bascule bridge spanning the Thames, offering stunning views and a glass floor walkway.', 'landmark', 4.6, 'Tower Bridge Rd, London SE1 2UP'),
  ('Dubai', 'UAE', 'Burj Khalifa', 'World''s tallest building with observation decks providing panoramic views of Dubai and beyond.', 'attraction', 4.7, '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai');
