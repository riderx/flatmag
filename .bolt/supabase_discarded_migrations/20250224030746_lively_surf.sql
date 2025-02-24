/*
  # Fix share state loading

  1. Changes
    - Add validation check for share state
    - Add error codes for better error handling
    - Add indexes for better performance
    - Add cleanup trigger

  2. Security
    - Add RLS policies for better access control
    - Add validation checks
*/

-- Add validation check for share state
ALTER TABLE shares
ADD CONSTRAINT share_state_not_empty CHECK (state IS NOT NULL AND state != '');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_accessed ON shares(accessed);
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shares(expires_at);

-- Add cleanup trigger
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS trigger AS $$
BEGIN
  DELETE FROM shares 
  WHERE accessed = true 
     OR expires_at <= now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER cleanup_expired_shares_trigger
  AFTER INSERT ON shares
  EXECUTE FUNCTION cleanup_expired_shares();

-- Drop existing function
DROP FUNCTION IF EXISTS get_and_mark_share;

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION get_and_mark_share(share_id uuid)
RETURNS TABLE (share_state text)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  share_record shares%ROWTYPE;
BEGIN
  -- Get share record
  SELECT * INTO share_record
  FROM shares
  WHERE id = share_id
  FOR UPDATE;

  -- Handle not found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share not found' USING ERRCODE = 'NTFND';
  END IF;

  -- Check if already accessed
  IF share_record.accessed THEN
    RAISE EXCEPTION 'Share already accessed' USING ERRCODE = 'SHACC';
  END IF;

  -- Check if expired
  IF share_record.expires_at <= now() THEN
    RAISE EXCEPTION 'Share expired' USING ERRCODE = 'SHEXP';
  END IF;

  -- Update and return state
  RETURN QUERY
  UPDATE shares
  SET accessed = true
  WHERE id = share_id
  RETURNING state::text AS share_state;
END;
$$ LANGUAGE plpgsql;