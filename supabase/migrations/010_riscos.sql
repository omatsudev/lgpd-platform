-- Módulo de Gestão de Riscos LGPD

create table public.riscos (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,

  -- Identificação
  titulo text not null,
  descricao text,
  categoria text not null check (categoria in (
    'privacidade', 'seguranca', 'legal', 'operacional', 'reputacional', 'tecnologico'
  )),

  -- Origem
  origem text check (origem in ('inventario', 'incidente', 'auditoria', 'fornecedor', 'interno', 'outro')),

  -- UUIDs sem FK direta para não depender da ordem de execução das migrations
  inventario_id uuid,
  incidente_id uuid,

  -- Avaliação inerente (antes dos controles)
  probabilidade_inerente integer not null check (probabilidade_inerente between 1 and 5),
  impacto_inerente integer not null check (impacto_inerente between 1 and 5),

  -- Avaliação residual (após os controles)
  probabilidade_residual integer check (probabilidade_residual between 1 and 5),
  impacto_residual integer check (impacto_residual between 1 and 5),

  -- Tratamento
  estrategia text check (estrategia in ('aceitar', 'mitigar', 'transferir', 'evitar')),
  plano_acao text,
  responsavel text,
  prazo date,

  -- Status
  status text not null default 'identificado' check (status in (
    'identificado', 'em_tratamento', 'monitorando', 'encerrado'
  )),

  -- Metadados
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.riscos enable row level security;

create policy "user_can_manage_riscos" on public.riscos
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

create trigger set_riscos_updated_at before update on public.riscos
  for each row execute function public.set_updated_at();
