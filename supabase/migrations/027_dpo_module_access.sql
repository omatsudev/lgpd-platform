-- Migration 027: DPO tem acesso completo a todos os módulos das empresas que gerencia
-- Um DPO pode estar vinculado a uma empresa via companies.dpo_id SEM ter entrada em user_companies.
-- As policies existentes só cobrem user_companies. Esta migration adiciona policies via dpo_id.

-- Helper: empresa gerenciada pelo DPO (via dpo_id)
-- Já existe policy em companies. Adicionamos para os módulos.

-- ── checklist_items ─────────────────────────────────────────────────────────
create policy "dpo_can_manage_checklist" on public.checklist_items
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── data_inventory ──────────────────────────────────────────────────────────
create policy "dpo_can_manage_data_inventory" on public.data_inventory
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── incidents ───────────────────────────────────────────────────────────────
create policy "dpo_can_manage_incidents" on public.incidents
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── documents ───────────────────────────────────────────────────────────────
create policy "dpo_can_manage_documents" on public.documents
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── risks ───────────────────────────────────────────────────────────────────
create policy "dpo_can_manage_risks" on public.risks
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── suppliers ───────────────────────────────────────────────────────────────
create policy "dpo_can_manage_suppliers" on public.suppliers
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── data_subject_requests ────────────────────────────────────────────────────
create policy "dpo_can_manage_data_subject_requests" on public.data_subject_requests
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── consents ────────────────────────────────────────────────────────────────
create policy "dpo_can_manage_consents" on public.consents
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── trainings ────────────────────────────────────────────────────────────────
create policy "dpo_can_manage_trainings" on public.trainings
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── complaints ────────────────────────────────────────────────────────────────
create policy "dpo_can_manage_complaints" on public.complaints
  for all using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── audit_logs ────────────────────────────────────────────────────────────────
create policy "dpo_can_read_audit_logs" on public.audit_logs
  for select using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

-- ── retencao_descarte (se existir) ───────────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'retencao_descarte') then
    execute $p$
      create policy "dpo_can_manage_retencao_descarte" on public.retencao_descarte
        for all using (
          company_id in (
            select id from public.companies where dpo_id = auth.uid()
          )
        )
    $p$;
  end if;
end $$;
