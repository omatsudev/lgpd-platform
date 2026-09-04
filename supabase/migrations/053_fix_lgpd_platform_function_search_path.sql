-- Migration 053: fecha o aviso "Function Search Path Mutable" nas 2 funções
-- criadas na migration 052 sem search_path explícito.

create or replace function lgpd_platform.set_updated_at()
returns trigger
language plpgsql
set search_path = lgpd_platform
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function lgpd_platform.sync_retention_disposal_status()
returns trigger
language plpgsql
set search_path = lgpd_platform
as $$
begin
  new.calculated_status :=
    case
      when new.hold_active then 'hold'
      when new.expiration_date is null then 'regular'
      when new.expiration_date < current_date then 'overdue'
      when new.expiration_date < current_date + interval '60 days' then 'expiring_soon'
      else 'regular'
    end;
  return new;
end;
$$;
