-- Migration: Generic integration table names
-- Rename meta_connections → integration_connections
-- Rename meta_pages → integration_resources
-- Non-destructive: only renames tables, columns, indexes, and RLS policies

-- ============================================================
-- TABLE RENAMES
-- ============================================================

-- Rename meta_connections → integration_connections
ALTER TABLE meta_connections RENAME TO integration_connections;

-- Rename meta_pages → integration_resources
ALTER TABLE meta_pages RENAME TO integration_resources;

-- ============================================================
-- COLUMN RENAMES: integration_connections
-- ============================================================

ALTER TABLE integration_connections RENAME COLUMN meta_user_id TO provider_user_id;

-- ============================================================
-- COLUMN RENAMES: integration_resources
-- ============================================================

ALTER TABLE integration_resources RENAME COLUMN meta_connection_id TO integration_connection_id;
ALTER TABLE integration_resources RENAME COLUMN meta_page_id TO resource_external_id;
ALTER TABLE integration_resources RENAME COLUMN is_selected TO is_active;

-- ============================================================
-- INDEX RENAMES (IF EXISTS)
-- ============================================================

ALTER INDEX IF EXISTS meta_connections_organization_id_idx RENAME TO integration_connections_organization_id_idx;
ALTER INDEX IF EXISTS meta_pages_organization_id_meta_page_id_key RENAME TO integration_resources_organization_id_resource_external_id_key;

-- ============================================================
-- RLS POLICIES: Drop old, recreate with new names
-- (Supabase does not support renaming policies directly)
-- ============================================================

DROP POLICY IF EXISTS "meta_connections_select" ON integration_connections;
DROP POLICY IF EXISTS "meta_connections_insert" ON integration_connections;
DROP POLICY IF EXISTS "meta_connections_update" ON integration_connections;
DROP POLICY IF EXISTS "meta_pages_select" ON integration_resources;
DROP POLICY IF EXISTS "meta_pages_insert" ON integration_resources;
DROP POLICY IF EXISTS "meta_pages_update" ON integration_resources;

-- Recreate RLS for integration_connections
CREATE POLICY "integration_connections_select" ON integration_connections
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "integration_connections_insert" ON integration_connections
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "integration_connections_update" ON integration_connections
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Recreate RLS for integration_resources
CREATE POLICY "integration_resources_select" ON integration_resources
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "integration_resources_insert" ON integration_resources
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "integration_resources_update" ON integration_resources
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));
