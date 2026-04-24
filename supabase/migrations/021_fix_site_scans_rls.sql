-- Fix: adiciona WITH CHECK explícito na policy de site_scans para garantir INSERT
-- A policy "for all using (...)" cobre SELECT/UPDATE/DELETE mas em alguns Supabase
-- o INSERT precisa de WITH CHECK separado.

drop policy if exists "user_can_manage_scans" on public.site_scans;

create policy "user_can_manage_scans" on public.site_scans
  for all
  using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  )
  with check (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
