/*
  # Fix RLS Policies for Anonymous Access

  ## Changes
  1. Drop existing restrictive RLS policies that require authenticated users
  2. Create new permissive policies that allow both anon and authenticated roles
  
  ## Security Note
  This migration enables anonymous access for development purposes.
  For production, consider implementing proper authentication.
  
  ## Tables Updated
  - items: Allow all operations for anon and authenticated users
  - comments: Allow all operations for anon and authenticated users
  - audit_logs: Allow read and insert for anon and authenticated users
*/

-- Drop existing policies for items table
DROP POLICY IF EXISTS "Anyone can view items" ON items;
DROP POLICY IF EXISTS "Users can insert items" ON items;
DROP POLICY IF EXISTS "Users can update items" ON items;
DROP POLICY IF EXISTS "Users can delete items" ON items;

-- Create new permissive policies for items table
CREATE POLICY "Allow all to view items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert items"
  ON items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update items"
  ON items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete items"
  ON items FOR DELETE
  USING (true);

-- Drop existing policies for comments table
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Create new permissive policies for comments table
CREATE POLICY "Allow all to view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update comments"
  ON comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete comments"
  ON comments FOR DELETE
  USING (true);

-- Drop existing policies for audit_logs table
DROP POLICY IF EXISTS "Anyone can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create new permissive policies for audit_logs table
CREATE POLICY "Allow all to view audit logs"
  ON audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);