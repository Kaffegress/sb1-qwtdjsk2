/*
  # Add New Fields for Enhanced Item Details

  ## Summary
  Adds two new optional text fields to the items table to support more detailed documentation:
  - current_solution: Documents the existing/current solution or approach
  - resource_assessment: Documents resource considerations and requirements

  ## Changes
  1. New Columns
    - `current_solution` (text, nullable) - Description of the current/existing solution
    - `resource_assessment` (text, nullable) - Assessment of resources needed
  
  ## Notes
  - Both fields are optional (nullable) to maintain backward compatibility
  - No data migration needed as these are new fields
  - Existing RLS policies automatically apply to new columns
*/

-- Add new fields to items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'current_solution'
  ) THEN
    ALTER TABLE items ADD COLUMN current_solution text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'resource_assessment'
  ) THEN
    ALTER TABLE items ADD COLUMN resource_assessment text;
  END IF;
END $$;