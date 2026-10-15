-- Migration 060: corrige o índice de deduplicação de notifications.
--
-- O índice único parcial (... where source_id is not null) não funciona como
-- alvo de ON CONFLICT via PostgREST/Supabase upsert — Postgres não consegue
-- inferir uma constraint parcial a partir de uma lista de colunas sem repetir
-- o predicado, e o upsert gerado pelo cliente não inclui WHERE nenhum. Na
-- prática nenhuma notificação criada (nem pelos triggers, nem pela
-- varredura diária) nunca tem source_id nulo mesmo, então o predicado nunca
-- fez diferença — troca por um índice único "normal".

drop index if exists public.notifications_dedupe_idx;

create unique index notifications_dedupe_idx
  on public.notifications (company_id, type, source_table, source_id);

-- Os 3 triggers de eventos imediatos também referenciavam o índice parcial
-- no ON CONFLICT — mesmo problema, mesmo fix.

create or replace function public.notify_new_incident()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (company_id, type, severity, title, message, link, source_table, source_id)
  values (
    new.company_id,
    'incident',
    case new.severity when 'critical' then 'critical' when 'high' then 'critical'
                       when 'medium' then 'warning' else 'info' end,
    'Novo incidente registrado',
    new.title,
    '/incidents/' || new.id,
    'incidents',
    new.id
  )
  on conflict (company_id, type, source_table, source_id) do nothing;
  return new;
end;
$$;

create or replace function public.notify_new_complaint()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (company_id, type, severity, title, message, link, source_table, source_id)
  values (
    new.company_id,
    'complaint',
    'warning',
    'Nova denúncia recebida',
    new.type,
    '/complaints/' || new.id,
    'complaints',
    new.id
  )
  on conflict (company_id, type, source_table, source_id) do nothing;
  return new;
end;
$$;

create or replace function public.notify_new_data_subject_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (company_id, type, severity, title, message, link, source_table, source_id)
  values (
    new.company_id,
    'data_subject_request',
    'warning',
    'Nova solicitação de titular',
    new.name || ' — ' || new.type,
    '/data-subjects/' || new.id,
    'data_subject_requests',
    new.id
  )
  on conflict (company_id, type, source_table, source_id) do nothing;
  return new;
end;
$$;
