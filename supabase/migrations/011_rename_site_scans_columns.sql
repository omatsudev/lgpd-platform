-- Rename Portuguese column names in site_scans to English
-- Run if migration 009 was already applied with the old column names

alter table public.site_scans
  rename column tecnologias to technologies;

alter table public.site_scans
  rename column problemas to issues;
