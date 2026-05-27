-- Rename Portuguese checklist category IDs to English
-- checklist_items.category stores the cat.id from lib/checklist-items.ts

update public.checklist_items set category = 'governance'  where category = 'governanca';
update public.checklist_items set category = 'inventory'   where category = 'inventario';
update public.checklist_items set category = 'consent'     where category = 'consentimento';
update public.checklist_items set category = 'rights'      where category = 'direitos';
update public.checklist_items set category = 'security'    where category = 'seguranca';
update public.checklist_items set category = 'suppliers'   where category = 'fornecedores';
update public.checklist_items set category = 'training'    where category = 'treinamento';
update public.checklist_items set category = 'dpia'        where category = 'ripd';
