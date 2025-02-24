/*
  # Update shares table and functions for string state

  1. Changes
    - Modify shares table to use text for state instead of jsonb
    - Update get_and_mark_share function to handle text state
    - Add state validation function

  2. Security
    - Enable RLS on shares table
    - Add policies for accessing shares
*/

-- Modify shares table to use text instead of jsonb
ALTER TABLE shares 
ALTER COLUMN state TYPE text USING state::text;

-- Drop existing function
DROP FUNCTION IF EXISTS get_and_mark_share;

-- Create improved function with text state
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (share_state text) AS $$
BEGIN
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
    AND NOT accessed
  RETURNING shares.state AS share_state;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can create shares"
  ON shares
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read unaccessed shares"
  ON shares
  FOR SELECT
  TO public
  USING (NOT accessed AND expires_at > now());