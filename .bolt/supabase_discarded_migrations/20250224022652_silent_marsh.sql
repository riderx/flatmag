/*
  # Add Collaboration Features

  1. New Tables
    - `cursors`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `magazine_id` (text)
      - `x` (integer)
      - `y` (integer)
      - `color` (text)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS on `cursors` table
    - Add policies for cursor management
*/

-- Create cursors table
CREATE TABLE cursors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  magazine_id text NOT NULL,
  x integer NOT NULL,
  y integer NOT NULL,
  color text NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cursors ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can create cursors"
  ON cursors
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own cursors"
  ON cursors
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read cursors"
  ON cursors
  FOR SELECT
  TO public
  USING (true);

-- Function to cleanup stale cursors
CREATE OR REPLACE FUNCTION cleanup_stale_cursors()
RETURNS void AS $$
BEGIN
  DELETE FROM cursors
  WHERE last_updated < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create cleanup job
SELECT cron.schedule('cleanup-stale-cursors', '* * * * *', 'SELECT cleanup_stale_cursors();');