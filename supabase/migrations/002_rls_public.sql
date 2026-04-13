-- Políticas de INSERT público para formulários externos (sem autenticação)
-- Denúncias e solicitações de titulares podem ser enviadas por qualquer pessoa

-- Formulário público: qualquer pessoa pode criar uma denúncia
create policy "public_can_insert_denuncias" on public.denuncias
  for insert with check (true);

-- Formulário público: qualquer pessoa pode criar solicitação de titular
create policy "public_can_insert_titulares" on public.solicitacoes_titulares
  for insert with check (true);

-- RLS para treinamentos: usuários da empresa podem gerenciar
create policy "user_can_manage_treinamentos" on public.treinamentos
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- RLS para treinamento_colaboradores: usuários da empresa podem gerenciar
create policy "user_can_manage_treinamento_colaboradores" on public.treinamento_colaboradores
  for all using (
    treinamento_id in (
      select t.id from public.treinamentos t
      join public.user_empresas ue on ue.empresa_id = t.empresa_id
      where ue.user_id = auth.uid()
    )
  );

-- RLS para empresas: INSERT para usuários autenticados (para criar nova empresa)
create policy "user_can_insert_empresas" on public.empresas
  for insert with check (owner_id = auth.uid());

-- RLS para user_empresas: INSERT para usuários autenticados
create policy "user_can_insert_user_empresas" on public.user_empresas
  for insert with check (user_id = auth.uid());

-- RLS para logs: INSERT para usuários da empresa
create policy "user_can_insert_logs" on public.logs_auditoria
  for insert with check (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );
