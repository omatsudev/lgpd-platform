-- Migration 058: duas coisas.
--
-- 1) Os valores do enum de plano estavam em português ('basico'/'completo'),
--    inconsistente com o resto do projeto (role já é 'admin'/'dpo'/'company'/
--    'collaborator', sempre em inglês). Solta a constraint antiga, migra os
--    dados existentes e adiciona a constraint nova com 'basic'/'full'.
--
-- 2) O módulo de treinamentos acabou de ir para produção e precisa ficar
--    restrito só à empresa do Serra Privacy por enquanto, independente do
--    plano de cada empresa (não é uma régua de plano, é um soft-launch
--    temporário). Coluna nova e independente pra isso.

alter table public.companies drop constraint if exists companies_plan_check;

update public.companies set plan = 'basic' where plan = 'basico';
update public.companies set plan = 'full' where plan = 'completo';

alter table public.companies
  add constraint companies_plan_check check (plan in ('basic', 'full'));

alter table public.companies
  add column if not exists trainings_early_access boolean not null default false;

update public.companies
set trainings_early_access = true
where id = '87a2b5b7-d4b2-4f52-9d7a-7703f74e2860'; -- Empresa de Serra Privacy
