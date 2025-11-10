-- Cocoon F2 Innovation Flow Schema
-- Creates tables for items, comments, and audit logs
-- with proper RLS policies for secure access

-- Items table: Core innovation items moving through F1→F2→F3 funnel
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'status1' CHECK (status IN ('status1', 'status2', 'status3', 'status4')),
  created_at timestamptz DEFAULT now(),
  f1_locked_at timestamptz,
  owner_id text NOT NULL,
  problem text,
  user_ctx text,
  min_solution text,
  kpi_name text,
  kpi_baseline text,
  kpi_target text,
  first_measure_due date,
  risk_note text,
  pii_flag boolean DEFAULT false,
  rbac_note text,
  artefact_url text,
  timebox_from date,
  timebox_to date,
  good_enough_demo boolean DEFAULT false,
  good_enough_measure boolean DEFAULT false,
  good_enough_log boolean DEFAULT false,
  stopp_reason text,
  ryg_status text CHECK (ryg_status IN ('red', 'yellow', 'green') OR ryg_status IS NULL),
  tags text[] DEFAULT ARRAY[]::text[]
);

-- Comments table: Comments on items
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table: Audit trail for all item changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_item ON audit_logs(item_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items table
CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);

-- RLS Policies for audit_logs table
CREATE POLICY "Anyone can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);