/*
  # Fix share state handling

  1. Changes
    - Update get_and_mark_share function to handle text state
    - Add explicit type casting for state column
    - Improve error handling

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_and_mark_share;

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (share_state text) AS $$
BEGIN
  -- Check if share exists
  IF NOT EXISTS (SELECT 1 FROM shares WHERE id = share_id) THEN
    RAISE EXCEPTION 'Share not found' USING ERRCODE = 'NTFND';
  END IF;

  -- Try to update and return state
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
    AND NOT accessed
  RETURNING state::text AS share_state;

  -- Check if any rows were returned
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share already accessed or expired' USING ERRCODE = 'SHACC';
  END IF;
END;
$$ LANGUAGE plpgsql;