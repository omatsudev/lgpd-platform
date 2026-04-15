-- Expansion of data_inventory table to support the professional wizard

alter table public.data_inventory
  add column if not exists process_name text,
  add column if not exists responsible_department text,
  add column if not exists process_description text,
  add column if not exists lifecycle_phases jsonb default '{}',
  add column if not exists data_categories jsonb default '[]',
  add column if not exists data_description text,
  add column if not exists processing_frequency text,
  add column if not exists data_shared boolean default false,
  add column if not exists shared_with text,
  add column if not exists consent_collection_method text,
  add column if not exists data_source text,
  add column if not exists data_subject_category text,
  add column if not exists storage_type text,
  add column if not exists requires_dpia text default 'automatic',
  add column if not exists risk_level text default 'low',
  add column if not exists record_status text default 'draft';

-- Trigger to update updated_at already exists (set_data_inventory_updated_at)
-- No additional migration needed
