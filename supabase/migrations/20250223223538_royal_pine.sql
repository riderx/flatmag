/*
  # Simple Share Table with Auto-Delete

  1. New Tables
    - shares: Stores temporary shared states
      - id (uuid): Unique share ID
      - state (jsonb): Magazine state
      - created_at (timestamptz): Creation timestamp
      - accessed (boolean): Flag to mark if share was accessed
      - expires_at (timestamptz): Expiration timestamp

  2. Functions
    - get_and_mark_share: Function to get share and mark for deletion
    - cleanup_shares: Function to remove accessed shares
*/

-- Create shares table
CREATE TABLE shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  accessed boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
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
$$ LANGUAGE plpgsql;

-- Function to cleanup accessed shares
CREATE OR REPLACE FUNCTION cleanup_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM shares
  WHERE accessed = true
    OR expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Create cleanup job that runs every minute
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-shares', '* * * * *', 'SELECT cleanup_shares();');