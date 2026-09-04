-- Sem policy de DELETE, a exclusão de empresa falhava silenciosamente (0 linhas afetadas).
create policy "user_can_delete_own_companies" on public.companies
  for delete using (
    (id in (select user_company_ids(auth.uid()))) or (owner_id = auth.uid())
  );

-- Baseada em company_id (não user_id) para permitir remover o vínculo de TODOS os
-- membros da empresa ao excluí-la, não apenas o vínculo de quem está excluindo.
create policy "user_can_delete_company_memberships" on public.user_companies
  for delete using (company_id in (select user_company_ids(auth.uid())));
