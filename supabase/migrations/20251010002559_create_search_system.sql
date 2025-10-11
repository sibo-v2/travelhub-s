/*
  # Search System Schema

  ## Overview
  Creates comprehensive search functionality including search history, saved searches,
  and user preferences to enable personalized travel planning.

  ## New Tables

  ### search_history
  Tracks all user searches for analytics and personalization
  - `id` (uuid, primary key) - Unique search record ID
  - `user_id` (uuid, foreign key to auth.users) - User who performed search
  - `search_query` (text) - The search term entered
  - `search_type` (text) - Category: flights, destinations, transportation, all
  - `filters` (jsonb) - Applied filters (dates, budget, preferences)
  - `results_count` (integer) - Number of results returned
  - `created_at` (timestamptz) - When search was performed

  ### saved_searches
  Stores user's saved searches for quick access
  - `id` (uuid, primary key) - Unique saved search ID
  - `user_id` (uuid, foreign key to auth.users) - Owner of saved search
  - `name` (text) - User-friendly name for the search
  - `search_query` (text) - The search term
  - `search_type` (text) - Category type
  - `filters` (jsonb) - Saved filter preferences
  - `notification_enabled` (boolean) - Alert user of new matches
  - `created_at` (timestamptz) - When search was saved
  - `updated_at` (timestamptz) - Last update timestamp

  ### user_favorites
  Stores favorited items (flights, destinations, etc.)
  - `id` (uuid, primary key) - Unique favorite ID
  - `user_id` (uuid, foreign key to auth.users) - User who favorited
  - `item_type` (text) - Type: flight, destination, transportation
  - `item_id` (uuid) - ID of the favorited item
  - `notes` (text) - User's personal notes
  - `created_at` (timestamptz) - When item was favorited

  ### search_preferences
  Stores user's search preferences and personalization data
  - `user_id` (uuid, primary key, foreign key to auth.users) - User ID
  - `preferred_airports` (text[]) - Frequently used airports
  - `preferred_destinations` (text[]) - Favorite destinations
  - `budget_range` (jsonb) - Typical budget preferences
  - `travel_style` (text) - luxury, budget, adventure, etc.
  - `interests` (text[]) - User interests for recommendations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users only

  ## Notes
  - Search history enables personalization and analytics
  - Saved searches provide convenience and notifications
  - Favorites allow users to bookmark and compare options
  - Preferences drive intelligent recommendations
*/

CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query text NOT NULL,
  search_type text NOT NULL DEFAULT 'all',
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_query text NOT NULL,
  search_type text NOT NULL DEFAULT 'all',
  filters jsonb DEFAULT '{}'::jsonb,
  notification_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS search_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_airports text[] DEFAULT ARRAY[]::text[],
  preferred_destinations text[] DEFAULT ARRAY[]::text[],
  budget_range jsonb DEFAULT '{"min": 0, "max": 10000}'::jsonb,
  travel_style text DEFAULT 'standard',
  interests text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own preferences"
  ON search_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON search_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON search_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item ON user_favorites(item_type, item_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_saved_searches_updated_at'
  ) THEN
    CREATE TRIGGER set_saved_searches_updated_at
      BEFORE UPDATE ON saved_searches
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_search_preferences_updated_at'
  ) THEN
    CREATE TRIGGER set_search_preferences_updated_at
      BEFORE UPDATE ON search_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
