-- Migration 028: adiciona constraint unique(company_id, item_key) em checklist_items
-- Necessária para o upsert ON CONFLICT funcionar.
-- A migration 008 incluía unique() na criação da tabela, mas o banco de produção
-- foi criado sem ela (provavelmente via dashboard sem rodar as migrations completas).

alter table public.checklist_items
  add constraint if not exists checklist_items_company_item_unique
  unique (company_id, item_key);
