-- Fix site_scans status constraint and seed demo cookie scan data

-- Normalise the status check constraint to known values
alter table public.site_scans
  drop constraint if exists site_scans_status_check;

alter table public.site_scans
  add constraint site_scans_status_check
    check (status in ('pending', 'processing', 'completed', 'error'));

-- Seed two cookie scan records for the first company
do $$
declare
  v_user_id    uuid;
  v_company_id uuid;
  v_empresa_id uuid;
  scan1        uuid;
  scan2        uuid;
begin
  select u.id into v_user_id
  from auth.users u
  order by u.created_at
  limit 1;

  if v_user_id is null then
    raise notice 'Nenhum usuário encontrado – seed ignorado.';
    return;
  end if;

  select uc.company_id into v_company_id
  from public.user_companies uc
  where uc.user_id = v_user_id
  order by uc.created_at
  limit 1;

  if v_company_id is null then
    raise notice 'Nenhuma empresa encontrada – seed ignorado.';
    return;
  end if;

  -- Look up empresas.id (the original PT table) for the FK
  select id into v_empresa_id
  from public.empresas
  order by created_at
  limit 1;

  if v_empresa_id is null then
    raise notice 'Tabela empresas vazia – usando company_id como fallback.';
    v_empresa_id := v_company_id;
  end if;

  -- Skip if records already exist
  if exists (select 1 from public.site_scans where company_id = v_company_id) then
    raise notice 'site_scans já populado – seed ignorado.';
    return;
  end if;

  scan1 := gen_random_uuid();
  scan2 := gen_random_uuid();

  insert into public.site_scans
    (id, empresa_id, company_id, url, dominio, domain, status, compliance_score,
     has_cookie_banner, has_privacy_policy, privacy_policy_url,
     cookies, technologies, issues, recommendations, created_by)
  values
  (scan1, v_empresa_id, v_company_id,
   'https://nexustec.com.br', 'nexustec.com.br', 'nexustec.com.br', 'completed', 72,
   true, true, 'https://nexustec.com.br/privacidade',
   '[{"name":"_ga","domain":".nexustec.com.br","type":"analytics","duration":"2 anos"},{"name":"_fbp","domain":".nexustec.com.br","type":"marketing","duration":"90 dias"},{"name":"session_id","domain":"nexustec.com.br","type":"essential","duration":"sessão"}]'::jsonb,
   '[{"name":"Google Analytics","category":"analytics"},{"name":"Facebook Pixel","category":"marketing"},{"name":"Hotjar","category":"analytics"}]'::jsonb,
   '[{"severity":"high","description":"Cookies de marketing carregados antes do consentimento"},{"severity":"medium","description":"Banner sem opção de rejeitar todos"}]'::jsonb,
   '[{"priority":"high","description":"Bloquear cookies de marketing até consentimento explícito"},{"priority":"medium","description":"Adicionar botão Rejeitar Todos no banner"}]'::jsonb,
   v_user_id),
  (scan2, v_empresa_id, v_company_id,
   'https://app.nexustec.com.br', 'app.nexustec.com.br', 'app.nexustec.com.br', 'completed', 88,
   true, true, 'https://nexustec.com.br/privacidade',
   '[{"name":"session_token","domain":"app.nexustec.com.br","type":"essential","duration":"24h"},{"name":"_ga","domain":".nexustec.com.br","type":"analytics","duration":"2 anos"}]'::jsonb,
   '[{"name":"Google Analytics","category":"analytics"}]'::jsonb,
   '[{"severity":"low","description":"Cookie _ga de analytics ativo sem aviso específico"}]'::jsonb,
   '[{"priority":"low","description":"Incluir nota sobre analytics no aviso de privacidade"}]'::jsonb,
   v_user_id);

  raise notice 'site_scans seed concluído.';
end $$;
