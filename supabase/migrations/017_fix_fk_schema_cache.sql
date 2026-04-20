-- Garante que a FK entre user_companies e companies existe
-- e força reload do schema cache do PostgREST

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'user_companies'
      and kcu.column_name = 'company_id'
  ) then
    alter table public.user_companies
      add constraint user_companies_company_id_fkey
      foreign key (company_id)
      references public.companies(id)
      on delete cascade;
  end if;
end $$;

-- Força reload do schema cache do PostgREST
notify pgrst, 'reload schema';
