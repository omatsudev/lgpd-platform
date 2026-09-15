-- Migration 055: adiciona plano por empresa.
--
-- Plano "basico" libera só Dashboard, Relatório, Checklist, Inventário de
-- Dados e Documentos — os demais módulos mostram o preview bloqueado
-- (mesmo componente já usado para o papel "collaborator", ver
-- lib/plans.ts). "completo" é o padrão, sem restrição — empresas
-- existentes não são afetadas a menos que sejam explicitamente
-- rebaixadas para "basico".

alter table public.companies
  add column if not exists plan text not null default 'completo'
  check (plan in ('basico', 'completo'));
