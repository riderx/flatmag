/*
  # Simplify share function

  1. Changes
    - Remove expiration check from get_and_mark_share function
    - Keep explicit column selection to avoid ambiguity
    - Function only checks if share exists and is not accessed

  2. Security
    - No changes to RLS policies
    - Function remains accessible to all users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_and_mark_share;

-- Create simplified function without expiration check
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (share_state jsonb) AS $$
BEGIN
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
    AND NOT accessed
  RETURNING shares.state AS share_state;
END;
$$ LANGUAGE plpgsql;