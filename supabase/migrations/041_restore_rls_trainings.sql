-- Migration 041: restaura RLS na tabela trainings
--
-- Mesmo problema da migration 040: a tabela ficou com row level security
-- desabilitada após a consolidação dos projetos Supabase em 2026-04-18,
-- expondo treinamentos de todas as empresas. Tabela usada apenas pelo
-- lgpd-platform, sem dependência de outros projetos.

drop policy if exists "user_can_manage_trainings" on public.trainings;
create policy "user_can_manage_trainings" on public.trainings
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

alter table public.trainings enable row level security;
