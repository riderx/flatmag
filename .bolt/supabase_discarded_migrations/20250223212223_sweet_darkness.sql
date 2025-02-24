/*
  # Fix column names in magazines table

  1. Changes
    - Rename issue_number to issueNumber to match application code
    - Add indexes for better query performance

  2. Security
    - No changes to RLS policies
*/

-- Rename issue_number to issueNumber
ALTER TABLE magazines RENAME COLUMN issue_number TO "issueNumber";

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS magazines_user_id_idx ON magazines(user_id);
CREATE INDEX IF NOT EXISTS magazines_created_at_idx ON magazines(created_at);
CREATE INDEX IF NOT EXISTS magazines_is_deleted_idx ON magazines(is_deleted);