/*
  # Create Chat Messages System

  ## Overview
  Creates a chat messages table to store conversations between users and the AI travel assistant.
  This enables persistent chat history and better user support.

  ## Changes
  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `user_id` (uuid, nullable) - Links to auth.users, nullable for guest users
      - `message` (text) - The message content
      - `sender` (text) - Either 'user' or 'agent'
      - `created_at` (timestamptz) - Message timestamp
      - `session_id` (uuid, nullable) - Groups messages by chat session

  ## Security
  - Enable RLS on chat_messages table
  - Users can read their own messages
  - Users can insert their own messages
  - System can insert agent responses

  ## Notes
  - Messages are stored for support and improvement purposes
  - Users can view their complete chat history
  - Guests can chat without login but history won't persist
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'agent')),
  session_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public to insert messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
