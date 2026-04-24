-- Migration 019: RLS para DPO gerenciar empresas atribuídas
-- Um DPO registrado na plataforma pode ver e atualizar empresas onde dpo_id = auth.uid()

-- Empresas: DPO pode ver empresas onde é o DPO responsável
create policy "dpo_can_see_assigned_companies" on public.companies
  for select using (dpo_id = auth.uid());

-- Empresas: DPO pode atualizar empresas onde é o DPO responsável
create policy "dpo_can_update_assigned_companies" on public.companies
  for update using (dpo_id = auth.uid());

-- user_companies: DPO pode ver vínculos das suas empresas (para gerenciamento)
create policy "dpo_can_read_managed_company_users" on public.user_companies
  for select using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );
