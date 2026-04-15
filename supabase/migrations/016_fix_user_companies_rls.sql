-- Fix: adiciona políticas RLS faltantes em user_companies
-- Sem SELECT policy, getUserCompany() sempre retorna null e o dashboard fica vazio.

-- Usuário pode ver suas próprias linhas em user_companies
create policy "user_can_read_own_user_companies"
  on public.user_companies
  for select
  using (user_id = auth.uid());

-- Usuário pode atualizar sua própria linha (para mudança de role, etc.)
create policy "user_can_update_own_user_companies"
  on public.user_companies
  for update
  using (user_id = auth.uid());

-- Usuário pode atualizar suas próprias empresas
create policy "user_can_update_own_companies"
  on public.companies
  for update
  using (
    id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );
