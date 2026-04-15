-- Normalize site_scans column names to English
-- Handles all transition scenarios safely

do $$
begin
  -- tecnologias → technologies
  if exists (select 1 from information_schema.columns where table_name = 'site_scans' and column_name = 'tecnologias') then
    if exists (select 1 from information_schema.columns where table_name = 'site_scans' and column_name = 'technologies') then
      -- both exist: drop the old Portuguese one
      alter table public.site_scans drop column tecnologias;
    else
      alter table public.site_scans rename column tecnologias to technologies;
    end if;
  end if;

  -- problemas → issues
  if exists (select 1 from information_schema.columns where table_name = 'site_scans' and column_name = 'problemas') then
    if exists (select 1 from information_schema.columns where table_name = 'site_scans' and column_name = 'issues') then
      alter table public.site_scans drop column problemas;
    else
      alter table public.site_scans rename column problemas to issues;
    end if;
  end if;
end $$;
