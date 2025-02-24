/*
  # Fix Magazine RLS Policies

  1. Changes
    - Add policy for soft deleting owned magazines
    - Add policy for removing self from shared magazines
    - Fix update policy to handle shared_users updates

  2. Security
    - Only owners can soft delete magazines
    - Users can remove themselves from shared_users
    - Maintains existing RLS for other operations
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update magazines they own or can edit" ON magazines;

-- Create policy for soft deleting owned magazines
CREATE POLICY "Users can soft delete their own magazines"
  ON magazines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_deleted = false)
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      (is_deleted = true AND OLD.is_deleted = false)  -- Allow setting is_deleted to true
      OR is_deleted = false                           -- Allow other updates when not deleting
    )
  );

-- Create policy for updating shared_users
CREATE POLICY "Users can update shared_users"
  ON magazines
  FOR UPDATE
  TO authenticated
  USING (
    -- Either owner or in shared_users list
    (auth.uid() = user_id OR jsonb_path_exists(
      shared_users,
      '$[*] ? (@.user_id == $uid)',
      jsonb_build_object('uid', auth.uid()::text)
    ))
    AND is_deleted = false
  )
  WITH CHECK (
    CASE
      -- Owner can update anything
      WHEN auth.uid() = user_id THEN true
      -- Shared users can only remove themselves
      WHEN jsonb_path_exists(
        OLD.shared_users,
        '$[*] ? (@.user_id == $uid)',
        jsonb_build_object('uid', auth.uid()::text)
      ) THEN (
        -- Ensure only removing self from shared_users
        NOT jsonb_path_exists(
          NEW.shared_users,
          '$[*] ? (@.user_id == $uid)',
          jsonb_build_object('uid', auth.uid()::text)
        )
        -- And no other changes
        AND NEW.title = OLD.title
        AND NEW.issue_number = OLD.issue_number
        AND NEW.publication_date = OLD.publication_date
        AND NEW.page_ratio = OLD.page_ratio
        AND NEW.state = OLD.state
        AND NEW.user_id = OLD.user_id
        AND NEW.is_deleted = OLD.is_deleted
      )
      ELSE false
    END
  );