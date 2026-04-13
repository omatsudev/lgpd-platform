-- Módulo de Gestão de Consentimentos LGPD

-- Finalidades de consentimento configuradas pela empresa
create table public.consentimento_finalidades (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  nome text not null,
  descricao text not null,
  base_legal text not null default 'consentimento',
  obrigatorio boolean default false,
  ativo boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Registros de consentimento dos titulares
create table public.consentimentos (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  finalidade_id uuid references public.consentimento_finalidades(id) on delete cascade not null,

  -- Titular
  titular_nome text,
  titular_email text not null,
  titular_cpf text,

  -- Consentimento
  aceito boolean not null,
  versao_politica text,
  canal text not null default 'web' check (canal in ('web', 'app', 'presencial', 'email', 'api')),
  ip_origem text,
  user_agent text,

  -- Revogação
  revogado boolean default false,
  revogado_em timestamptz,
  motivo_revogacao text,

  created_at timestamptz default now() not null
);

-- RLS — finalidades
alter table public.consentimento_finalidades enable row level security;

create policy "user_can_manage_finalidades" on public.consentimento_finalidades
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- RLS — consentimentos (leitura autenticada + insert público via API)
alter table public.consentimentos enable row level security;

create policy "user_can_read_consentimentos" on public.consentimentos
  for select using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

create policy "public_can_insert_consentimento" on public.consentimentos
  for insert with check (true);

create policy "public_can_update_revogacao" on public.consentimentos
  for update using (true) with check (true);

-- Updated_at trigger para finalidades
create trigger set_finalidades_updated_at before update on public.consentimento_finalidades
  for each row execute function public.set_updated_at();
