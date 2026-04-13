-- Módulo de Gestão de Fornecedores e Due Diligence LGPD

create table public.fornecedores (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,

  -- Identificação
  nome text not null,
  cnpj text,
  site text,
  contato_nome text,
  contato_email text,
  contato_telefone text,
  pais text not null default 'Brasil',

  -- Classificação
  categoria text not null check (categoria in (
    'tecnologia', 'saude', 'financeiro', 'rh', 'marketing',
    'juridico', 'contabilidade', 'logistica', 'outro'
  )),
  tipo_acesso text not null check (tipo_acesso in (
    'operador', 'controlador_conjunto', 'suboperador', 'sem_acesso_dados'
  )),

  -- Dados tratados
  dados_acessados jsonb default '[]',
  finalidade_compartilhamento text,
  base_legal_compartilhamento text,

  -- Contrato / DPA
  possui_contrato boolean default false,
  possui_dpa boolean default false,
  data_assinatura_dpa date,
  url_contrato text,

  -- Due diligence
  status_diligencia text not null default 'pendente' check (status_diligencia in (
    'pendente', 'em_analise', 'aprovado', 'reprovado', 'expirado'
  )),
  data_ultima_avaliacao date,
  data_proxima_avaliacao date,
  nivel_risco text not null default 'medio' check (nivel_risco in ('baixo', 'medio', 'alto', 'critico')),
  observacoes text,

  -- Transferência internacional
  transferencia_internacional boolean default false,
  pais_destino text,
  mecanismo_transferencia text,

  -- Status
  ativo boolean default true,

  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.fornecedores enable row level security;

create policy "user_can_manage_fornecedores" on public.fornecedores
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_fornecedores_updated_at before update on public.fornecedores
  for each row execute function public.set_updated_at();
