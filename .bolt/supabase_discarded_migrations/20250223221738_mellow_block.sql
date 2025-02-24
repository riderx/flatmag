-- Drop existing objects if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'share_permission') THEN
    DROP TYPE share_permission CASCADE;
  END IF;
END $$;

-- Create enum for share permissions
CREATE TYPE share_permission AS ENUM ('read', 'edit');

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
  permission share_permission NOT NULL DEFAULT 'read',
  created_at timestamptz DEFAULT now()
);

-- Create magazine_invites table (not linked to users)
CREATE TABLE magazine_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  magazine_id uuid NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  permission share_permission NOT NULL DEFAULT 'read',
  redeemed_by uuid REFERENCES auth.users(id),
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to magazines
CREATE TRIGGER update_magazines_updated_at
  BEFORE UPDATE ON magazines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create invite redemption function
CREATE OR REPLACE FUNCTION redeem_magazine_invite(invite_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_magazine_id uuid;
  v_permission share_permission;
BEGIN
  -- Check if invite exists and is not redeemed
  SELECT magazine_id, permission INTO v_magazine_id, v_permission
  FROM magazine_invites
  WHERE id = invite_id 
    AND redeemed_by IS NULL 
    AND redeemed_at IS NULL
    AND expires_at > now();
    
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Begin atomic operation
  BEGIN
    -- Mark invite as redeemed
    UPDATE magazine_invites
    SET redeemed_by = user_id,
        redeemed_at = now()
    WHERE id = invite_id;

    -- Create share for the user
    INSERT INTO magazine_shares (magazine_id, shared_with, permission)
    VALUES (v_magazine_id, user_id, v_permission);

    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
END;
$$;

-- Enable RLS
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_invites ENABLE ROW LEVEL SECURITY;

-- Magazines policies
CREATE POLICY "Users can view own and shared magazines"
  ON magazines FOR SELECT
  TO authenticated
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

CREATE POLICY "Users can create magazines"
  ON magazines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own magazines"
  ON magazines FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Magazine shares policies
CREATE POLICY "Users can view shares for their magazines"
  ON magazine_shares FOR SELECT
  TO authenticated
  USING (
    shared_with = auth.uid() OR
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can share own magazines"
  ON magazine_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove shares for own magazines"
  ON magazine_shares FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_shares.magazine_id
      AND user_id = auth.uid()
    )
  );

-- Magazine invites policies
CREATE POLICY "Users can create invites for own magazines"
  ON magazine_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_invites.magazine_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view invites for own magazines"
  ON magazine_invites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM magazines
      WHERE id = magazine_invites.magazine_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_magazines_user_id ON magazines(user_id);
CREATE INDEX idx_magazine_shares_magazine_id ON magazine_shares(magazine_id);
CREATE INDEX idx_magazine_shares_shared_with ON magazine_shares(shared_with);
CREATE INDEX idx_magazine_invites_magazine_id ON magazine_invites(magazine_id);
CREATE INDEX idx_magazine_invites_redeemed_by ON magazine_invites(redeemed_by);