-- Migration 059: sistema de notificações completo, por empresa.
--
-- A tabela "notifications" de 001_initial_schema.sql nunca foi aplicada
-- neste projeto Supabase (compartilhado por vários apps) — confirmado:
-- "relation public.notifications does not exist". Cria do zero já no
-- modelo certo (por empresa, não por usuário, consistente com o resto do
-- multi-tenant).
--
-- Dois jeitos de gerar notificação:
-- 1) Eventos imediatos: trigger na criação do registro (incidente, denúncia,
--    solicitação de titular) — dispara não importa o caminho de inserção
--    (ação autenticada ou formulário público), porque está no banco.
-- 2) Eventos por prazo: não existe "escrita" que marque o momento em que um
--    documento vence ou uma retenção fica vencida — isso só acontece porque
--    o tempo passou. Esses são gerados por uma varredura diária
--    (app/api/cron/scan-notifications), não por trigger.
--
-- O índice único parcial (company_id, type, source_table, source_id) evita
-- duplicar notificação pro mesmo registro no scan seguinte.

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  type text not null check (type in (
    'incident',
    'complaint',
    'data_subject_request',
    'document_expiring',
    'document_expired',
    'retention_expiring',
    'retention_overdue',
    'data_subject_overdue'
  )),
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null,
  message text not null,
  link text,
  source_table text,
  source_id uuid,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

create index notifications_company_idx on public.notifications (company_id, created_at desc);
create unique index notifications_dedupe_idx
  on public.notifications (company_id, type, source_table, source_id)
  where source_id is not null;

alter table public.notifications enable row level security;

create policy "user_can_read_notifications" on public.notifications
  for select using (
    company_id in (select company_id from public.user_companies where user_id = auth.uid())
  );

-- Marcar como lida é a única escrita permitida pro usuário autenticado; tudo
-- o mais (criar, excluir) é só service role, igual ao resto do conteúdo
-- gerado pelo servidor.
create policy "user_can_mark_notifications_read" on public.notifications
  for update using (
    company_id in (select company_id from public.user_companies where user_id = auth.uid())
  )
  with check (
    company_id in (select company_id from public.user_companies where user_id = auth.uid())
  );

-- =============================================
-- Eventos imediatos
-- =============================================

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
  on conflict (company_id, type, source_table, source_id) where source_id is not null do nothing;
  return new;
end;
$$;

create trigger notify_incident_created
  after insert on public.incidents
  for each row execute function public.notify_new_incident();

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
  on conflict (company_id, type, source_table, source_id) where source_id is not null do nothing;
  return new;
end;
$$;

create trigger notify_complaint_created
  after insert on public.complaints
  for each row execute function public.notify_new_complaint();

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
  on conflict (company_id, type, source_table, source_id) where source_id is not null do nothing;
  return new;
end;
$$;

create trigger notify_data_subject_request_created
  after insert on public.data_subject_requests
  for each row execute function public.notify_new_data_subject_request();
