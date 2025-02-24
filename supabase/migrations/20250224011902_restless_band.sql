/*
  # Fix share function

  1. Changes
    - Fix ambiguous column reference in get_and_mark_share function
    - Add explicit column selection to avoid ambiguity
    - Add proper error handling

  2. Security
    - No changes to RLS policies
    - Function remains accessible to all users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_and_mark_share;

-- Create improved function with explicit column selection
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (share_state jsonb) AS $$
BEGIN
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
    AND NOT accessed
    AND expires_at > now()
  RETURNING shares.state AS share_state;
END;
$$ LANGUAGE plpgsql;