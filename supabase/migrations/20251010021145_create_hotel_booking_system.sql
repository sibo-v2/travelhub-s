/*
  # Create Hotel Booking System

  ## Overview
  This migration creates a comprehensive hotel booking system that integrates with the existing travel platform.

  ## 1. New Tables
    
    ### `hotels`
    - `id` (uuid, primary key) - Unique identifier for each hotel
    - `name` (text) - Hotel name
    - `location` (text) - City/destination where hotel is located
    - `address` (text) - Full street address
    - `rating` (numeric) - Hotel rating (0-5 stars)
    - `price_per_night` (numeric) - Base price per night in USD
    - `image_url` (text) - URL to hotel image
    - `amenities` (text array) - List of hotel amenities
    - `description` (text) - Hotel description
    - `available_rooms` (integer) - Number of available rooms
    - `created_at` (timestamptz) - Record creation timestamp

    ### `hotel_bookings`
    - `id` (uuid, primary key) - Unique booking identifier
    - `user_id` (uuid, foreign key) - Reference to auth.users
    - `hotel_id` (uuid, foreign key) - Reference to hotels table
    - `check_in_date` (date) - Check-in date
    - `check_out_date` (date) - Check-out date
    - `num_guests` (integer) - Number of guests
    - `room_type` (text) - Type of room booked
    - `total_price` (numeric) - Total booking price
    - `status` (text) - Booking status (pending, confirmed, cancelled)
    - `created_at` (timestamptz) - Booking creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on both tables
    - Hotels table: Public read access for browsing
    - Hotel bookings: Users can only view/manage their own bookings
    - Authenticated users can create new bookings

  ## 3. Sample Data
    - Populate hotels table with diverse accommodations across popular destinations
*/

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  address text NOT NULL,
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_per_night numeric(10,2) NOT NULL CHECK (price_per_night >= 0),
  image_url text NOT NULL,
  amenities text[] DEFAULT ARRAY[]::text[],
  description text NOT NULL,
  available_rooms integer DEFAULT 0 CHECK (available_rooms >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create hotel_bookings table
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  num_guests integer DEFAULT 1 CHECK (num_guests > 0),
  room_type text NOT NULL,
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;

-- Hotels policies (public read access)
CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO authenticated, anon
  USING (true);

-- Hotel bookings policies
CREATE POLICY "Users can view own hotel bookings"
  ON hotel_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hotel bookings"
  ON hotel_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hotel bookings"
  ON hotel_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hotel bookings"
  ON hotel_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample hotel data
INSERT INTO hotels (name, location, address, rating, price_per_night, image_url, amenities, description, available_rooms) VALUES
  ('Grand Palace Hotel', 'Paris', '15 Avenue des Champs-Élysées, 75008 Paris, France', 4.8, 350.00, 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Fitness Center', 'Room Service'], 'Luxurious 5-star hotel in the heart of Paris with stunning views of the Eiffel Tower. Features elegant rooms, world-class dining, and exceptional service.', 45),
  ('Tokyo Bay Resort', 'Tokyo', '1-9 Maihama, Urayasu, Chiba 279-0031, Japan', 4.6, 280.00, 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Beach Access', 'Restaurant', 'Spa', 'Business Center'], 'Modern resort overlooking Tokyo Bay with easy access to major attractions. Perfect blend of traditional Japanese hospitality and contemporary comfort.', 60),
  ('Manhattan Skyline Hotel', 'New York', '123 W 57th Street, New York, NY 10019, USA', 4.7, 425.00, 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Gym', 'Concierge', 'Restaurant', 'Bar', 'Valet Parking'], 'Sophisticated hotel in Midtown Manhattan offering spectacular city views, upscale amenities, and easy access to Times Square and Central Park.', 38),
  ('London Bridge Suites', 'London', '47-51 Great Suffolk Street, London SE1 0BS, UK', 4.5, 310.00, 'https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Restaurant', 'Bar', 'Meeting Rooms', 'Breakfast Included'], 'Contemporary hotel near iconic London landmarks with spacious suites, modern design, and excellent transport links to all major attractions.', 52),
  ('Sydney Harbour Inn', 'Sydney', '88 George Street, The Rocks, Sydney NSW 2000, Australia', 4.9, 390.00, 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Rooftop Pool', 'Restaurant', 'Spa', 'Harbor Views', 'Fitness Center'], 'Premium waterfront hotel with breathtaking views of Sydney Opera House and Harbour Bridge. Luxury accommodations with world-class dining options.', 42),
  ('Dubai Marina Resort', 'Dubai', 'Dubai Marina Walk, Dubai Marina, Dubai, UAE', 4.8, 480.00, 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Private Beach', 'Pool', 'Spa', 'Restaurant', 'Water Sports', 'Kids Club'], 'Opulent beachfront resort in Dubai Marina with stunning Arabian Gulf views, exceptional dining, and world-class amenities for the entire family.', 55),
  ('Rome Colosseum View Hotel', 'Rome', 'Via Nicola Salvi, 28, 00187 Rome, Italy', 4.6, 295.00, 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Rooftop Terrace', 'Restaurant', 'Bar', 'Concierge'], 'Charming boutique hotel steps from the Colosseum, featuring authentic Italian design, rooftop dining with panoramic views, and personalized service.', 35),
  ('Barcelona Beach Hotel', 'Barcelona', 'Passeig Marítim de la Barceloneta, 32, 08003 Barcelona, Spain', 4.7, 265.00, 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Beachfront', 'Pool', 'Restaurant', 'Gym', 'Bike Rental'], 'Modern beachfront hotel on Barceloneta Beach with Mediterranean cuisine, stunning sea views, and easy access to Gothic Quarter and Las Ramblas.', 48),
  ('Singapore Marina Hotel', 'Singapore', '10 Bayfront Avenue, Singapore 018956', 4.9, 420.00, 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Infinity Pool', 'Spa', 'Restaurant', 'Casino', 'Shopping Mall'], 'Iconic luxury hotel featuring the famous rooftop infinity pool, multiple dining options, and unparalleled views of Singapore skyline.', 40),
  ('Bali Sunset Villa', 'Bali', 'Jalan Pantai Kuta, Kuta, Bali 80361, Indonesia', 4.8, 220.00, 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Private Pool', 'Spa', 'Restaurant', 'Beach Access', 'Yoga Classes'], 'Tropical paradise resort with private villas, lush gardens, traditional Balinese architecture, and world-renowned spa treatments.', 30),
  ('Amsterdam Canal House', 'Amsterdam', 'Keizersgracht 384, 1016 GB Amsterdam, Netherlands', 4.5, 245.00, 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Breakfast Included', 'Bike Rental', 'Bar', 'Canal Views'], 'Historic canal house hotel in the heart of Amsterdam offering authentic Dutch charm, canal views, and complimentary bikes to explore the city.', 28),
  ('Miami Beach Resort', 'Miami', '2399 Collins Avenue, Miami Beach, FL 33139, USA', 4.7, 340.00, 'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['Free WiFi', 'Beachfront', 'Pool', 'Spa', 'Restaurant', 'Nightclub', 'Water Sports'], 'Vibrant Art Deco hotel on South Beach featuring trendy restaurants, poolside bars, ocean views, and the ultimate Miami Beach experience.', 50);
