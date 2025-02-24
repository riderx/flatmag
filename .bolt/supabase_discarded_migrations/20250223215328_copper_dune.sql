/*
  # Magazine Flat Plan Schema

  1. Tables
    - magazines: Stores magazine information
      - id (uuid, primary key)
      - title (text)
      - issue_number (text)
      - publication_date (date)
      - page_ratio (text)
      - state (jsonb) - Stores flat plan state
      - user_id (uuid) - References auth.users
      - is_deleted (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - magazine_shares: Tracks shared magazines
      - id (uuid, primary key)
      - magazine_id (uuid, references magazines)
      - shared_with (uuid) - References auth.users
      - created_by (uuid) - References auth.users
      - created_at (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Magazines:
      - Users can read their own and shared magazines
      - Users can create magazines
      - Users can update their own magazines
    - Shares:
      - Magazine owners can create and delete shares
      - Users can read shares they're involved in
*/

-- Create magazines table
CREATE TABLE magazines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issue_number text NOT NULL,
  publication_date date NOT NULL,
  page_ratio text NOT NULL,
  state jsonb DEFAULT '{}'::jsonb,
  user_id uuid NOT NULL,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create magazine_shares table
CREATE TABLE magazine_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  magazine_id uuid NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  shared_with uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_shares ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for magazines
CREATE TRIGGER update_magazines_updated_at
  BEFORE UPDATE ON magazines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Magazines Policies

-- Users can read their own and shared magazines
CREATE POLICY "Enable read access for magazines"
  ON magazines
  FOR SELECT
  USING (
    NOT is_deleted AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM magazine_shares
        WHERE magazine_id = magazines.id
        AND shared_with = auth.uid()
      )
    )
  );

-- Users can create magazines
CREATE POLICY "Enable insert access for magazines"
  ON magazines
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own magazines
CREATE POLICY "Enable update access for magazines"
  ON magazines
  FOR UPDATE
  USING (user_id = auth.uid());

-- Magazine Shares Policies

-- Users can read shares they're involved in
CREATE POLICY "Enable read access for magazine shares"
  ON magazine_shares
  FOR SELECT
  USING (
    shared_with = auth.uid() OR
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );

-- Magazine owners can create shares
CREATE POLICY "Enable insert access for magazine shares"
  ON magazine_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );

-- Magazine owners can delete shares
CREATE POLICY "Enable delete access for magazine shares"
  ON magazine_shares
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );