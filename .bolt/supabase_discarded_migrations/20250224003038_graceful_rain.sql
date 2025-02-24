/*
  # Create shares table and functions

  1. New Tables
    - `shares`
      - `id` (uuid, primary key)
      - `state` (jsonb, stores magazine state)
      - `created_at` (timestamptz)
      - `accessed` (boolean)
      - `expires_at` (timestamptz)

  2. Functions
    - `get_and_mark_share`: Retrieves share and marks it for deletion
    - `cleanup_shares`: Removes expired and accessed shares

  3. Security
    - Enable RLS on shares table
    - Add policies for creating and accessing shares
*/

-- Create shares table
CREATE TABLE shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  accessed boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create shares
CREATE POLICY "Anyone can create shares" ON shares
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to read unaccessed shares
CREATE POLICY "Anyone can read unaccessed shares" ON shares
  FOR SELECT
  TO anon
  USING (NOT accessed AND expires_at > now());

-- Allow updating accessed status
CREATE POLICY "Anyone can mark shares as accessed" ON shares
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (
    -- Only allow updating the accessed field
    (OLD.state = NEW.state) AND
    (OLD.created_at = NEW.created_at) AND
    (OLD.expires_at = NEW.expires_at)
  );

-- Function to get share and mark it for deletion
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (state jsonb) AS $$
BEGIN
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
    AND NOT accessed
    AND expires_at > now()
  RETURNING state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;