-- Módulo de Checklist de Adequação LGPD

create table public.checklist_itens (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  categoria text not null,
  item_key text not null, -- identificador fixo do item (não muda entre empresas)
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido', 'nao_aplicavel')),
  observacao text,
  responsavel text,
  data_conclusao date,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now() not null,
  unique(empresa_id, item_key)
);

alter table public.checklist_itens enable row level security;

create policy "user_can_manage_checklist" on public.checklist_itens
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

create trigger set_checklist_updated_at before update on public.checklist_itens
  for each row execute function public.set_updated_at();
