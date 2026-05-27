-- Migration 029: adiciona colunas JSONB que faltavam em data_inventory
-- Produção foi criada via dashboard sem rodar migrations 022/023/026 completas.
-- Colunas aplicadas diretamente via CLI; este arquivo documenta o estado final.

alter table public.data_inventory
  add column if not exists identificacao                jsonb,
  add column if not exists responsible_departments      jsonb   default '[]',
  add column if not exists data_categories_detail       jsonb   default '[]',
  add column if not exists legal_bases                  jsonb   default '[]',
  add column if not exists shared_details               jsonb   default '[]',
  add column if not exists security_measures_detail     jsonb   default '[]',
  add column if not exists storage_types                jsonb   default '[]',
  add column if not exists data_sources                 jsonb   default '[]',
  add column if not exists data_subject_categories      jsonb   default '[]',
  add column if not exists evento_inicial               text,
  add column if not exists destinacao_final             text,
  add column if not exists bloqueio_possivel            boolean default false,
  add column if not exists transferencia_internacional  jsonb   default '[]',
  add column if not exists contratos                    jsonb   default '[]';

-- Remove NOT NULL de colunas que devem ser opcionais no wizard multi-etapas
alter table public.data_inventory
  alter column purpose          drop not null,
  alter column legal_basis      drop not null,
  alter column storage_location drop not null;
