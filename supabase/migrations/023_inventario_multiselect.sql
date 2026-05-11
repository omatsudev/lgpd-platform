-- Corrige data_inventory para suportar múltiplas seleções
-- conforme relatorio_lgpd.pdf §5 (setores envolvidos, bases legais, tipos de armazenamento)
-- e adiciona campos de ciclo de vida de retenção

alter table public.data_inventory
  -- setores envolvidos no tratamento (múltiplos)
  add column if not exists responsible_departments jsonb default '[]',
  -- múltiplas bases legais (art. 7º LGPD)
  add column if not exists legal_bases             jsonb default '[]',
  -- múltiplos tipos de armazenamento
  add column if not exists storage_types           jsonb default '[]',
  -- campos de ciclo de retenção/descarte
  add column if not exists evento_inicial          text,
  add column if not exists destinacao_final        text,
  add column if not exists bloqueio_possivel       boolean default false;
