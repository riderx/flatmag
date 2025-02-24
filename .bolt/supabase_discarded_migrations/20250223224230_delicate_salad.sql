-- Create sessions table
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state jsonb NOT NULL,
  active_users jsonb DEFAULT '[]'::jsonb,
  allow_edit boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_updates table
CREATE TABLE session_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  type text NOT NULL,
  data jsonb NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert updates"
  ON session_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read updates"
  ON session_updates FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_session_updates_session_id ON session_updates(session_id);
CREATE INDEX idx_session_updates_created_at ON session_updates(created_at);

-- Create function to cleanup old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE updated_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;