-- Módulo de Verificador de Site / Cookie Scanner

create table public.site_scans (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,

  -- Alvo
  url text not null,
  dominio text not null,

  -- Status
  status text not null default 'pendente' check (status in ('pendente', 'processando', 'concluido', 'erro')),
  erro_mensagem text,

  -- Resultado
  cookies jsonb default '[]',           -- lista de cookies detectados
  tecnologias jsonb default '[]',       -- CMS, analytics, ads detectados
  tem_banner_cookies boolean,
  tem_politica_privacidade boolean,
  url_politica_privacidade text,
  score_conformidade integer,           -- 0-100
  problemas jsonb default '[]',         -- lista de problemas encontrados
  recomendacoes jsonb default '[]',     -- lista de recomendações

  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null
);

alter table public.site_scans enable row level security;

create policy "user_can_manage_scans" on public.site_scans
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );
