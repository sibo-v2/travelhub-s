/*
  # Create Travel Notes System

  ## Overview
  Creates a comprehensive notes system for travelers to organize trip planning,
  packing lists, to-do items, and travel reminders with rich text support.

  ## Changes
  
  1. New Tables
    - `travel_notes`
      - Stores user notes with rich text content
      - Supports categorization and tags
      - Includes title, content, and metadata
      - Tracks creation and modification dates
    
    - `note_categories`
      - Predefined categories for organizing notes
      - Custom user categories support
    
    - `note_tags`
      - Flexible tagging system for notes
      - Many-to-many relationship with notes

  ## Security
    - Enable RLS on all tables
    - Users can only access their own notes
    - Full CRUD operations for authenticated users

  ## Notes
    - Rich text content stored as HTML
    - Support for multiple categories per note
    - Tagging system for better organization
    - Archived notes for cleanup without deletion
*/

-- Create note categories table
CREATE TABLE IF NOT EXISTS note_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text,
  color text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO note_categories (name, icon, color, is_default) VALUES
  ('Packing List', '🎒', 'blue', true),
  ('To-Do', '✓', 'green', true),
  ('Itinerary', '📅', 'purple', true),
  ('Accommodations', '🏨', 'orange', true),
  ('Dining', '🍽️', 'red', true),
  ('Transportation', '🚗', 'teal', true),
  ('Activities', '🎯', 'pink', true),
  ('Budget', '💰', 'yellow', true),
  ('Emergency Info', '🚨', 'red', true),
  ('General', '📝', 'gray', true)
ON CONFLICT (name) DO NOTHING;

-- Create travel notes table
CREATE TABLE IF NOT EXISTS travel_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES note_categories(id) ON DELETE SET NULL,
  
  -- Organization
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  
  -- Metadata
  color text DEFAULT 'white',
  reminder_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create note tags table
CREATE TABLE IF NOT EXISTS note_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES travel_notes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(note_id, tag)
);

-- Enable RLS
ALTER TABLE note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Note categories policies (public read)
CREATE POLICY "Anyone can view note categories"
  ON note_categories
  FOR SELECT
  TO public
  USING (true);

-- Travel notes policies
CREATE POLICY "Users can view own notes"
  ON travel_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON travel_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON travel_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON travel_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Note tags policies
CREATE POLICY "Users can view tags for own notes"
  ON note_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM travel_notes
      WHERE travel_notes.id = note_tags.note_id
      AND travel_notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for own notes"
  ON note_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_notes
      WHERE travel_notes.id = note_tags.note_id
      AND travel_notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from own notes"
  ON note_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM travel_notes
      WHERE travel_notes.id = note_tags.note_id
      AND travel_notes.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_notes_user_id ON travel_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_notes_category_id ON travel_notes(category_id);
CREATE INDEX IF NOT EXISTS idx_travel_notes_created_at ON travel_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_notes_pinned ON travel_notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_travel_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_travel_notes_updated_at
      BEFORE UPDATE ON travel_notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
