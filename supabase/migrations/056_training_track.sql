-- Migration 056: trilha de treinamento LGPD (módulos, vídeos, quizzes,
-- avaliação final, progresso por aluno e certificados).
--
-- Conteúdo (trilha, módulos, vídeos e perguntas) é global, igual para todas as
-- empresas. Progresso, tentativas e certificados são por aluno e por empresa.
--
-- Escrita: todas as tabelas de progresso são gravadas pelo servidor da
-- aplicação com a service role (SUPABASE_SERVICE_ROLE_KEY), depois de validar
-- a sessão e as regras de negócio (lib/training). Não há policies de escrita
-- para anon/authenticated: o aluno não consegue forjar nota, progresso ou
-- certificado chamando o PostgREST direto do navegador.
--
-- Gabarito: training_answer_keys tem RLS ligado e nenhuma policy, então só a
-- service role lê. As perguntas e alternativas são públicas para usuários
-- autenticados, mas a alternativa correta nunca chega ao navegador antes da
-- correção.

-- =============================================
-- Conteúdo
-- =============================================
create table public.training_tracks (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  video_quiz_pass_ratio numeric(4, 3) not null default 0.75
    check (video_quiz_pass_ratio > 0 and video_quiz_pass_ratio <= 1),
  final_exam_pass_ratio numeric(4, 3) not null default 0.70
    check (final_exam_pass_ratio > 0 and final_exam_pass_ratio <= 1),
  -- null = tentativas ilimitadas
  final_exam_max_attempts integer check (final_exam_max_attempts > 0),
  workload_minutes integer not null default 60 check (workload_minutes > 0),
  -- null = certificado sem validade
  certificate_validity_months integer check (certificate_validity_months > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.training_modules (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.training_tracks(id) on delete cascade not null,
  position integer not null check (position > 0),
  title text not null,
  objective text not null default '',
  -- quantas perguntas deste módulo são sorteadas na avaliação final
  final_exam_question_count integer not null default 0 check (final_exam_question_count >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (track_id, position)
);

create table public.training_videos (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.training_modules(id) on delete cascade not null,
  -- ordem global na trilha (1 a 12)
  position integer not null check (position > 0),
  title text not null,
  key_message text not null default '',
  duration_seconds integer not null check (duration_seconds > 0),
  -- null enquanto o vídeo não foi gravado/hospedado
  video_url text,
  captions_url text,
  transcript text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  min_watch_ratio numeric(4, 3) not null default 0.9
    check (min_watch_ratio > 0 and min_watch_ratio <= 1),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (module_id, position)
);

create table public.training_questions (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.training_tracks(id) on delete cascade not null,
  -- código do documento de quizzes (ex.: "3.2" ou "B17")
  code text not null,
  kind text not null check (kind in ('video_quiz', 'final_exam')),
  type text not null default 'single_choice'
    check (type in ('single_choice', 'true_false', 'multiple_choice')),
  video_id uuid references public.training_videos(id) on delete cascade,
  module_id uuid references public.training_modules(id) on delete cascade,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  prompt text not null,
  explanation text not null default '',
  active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (track_id, code),
  check (
    (kind = 'video_quiz' and video_id is not null)
    or (kind = 'final_exam' and module_id is not null)
  )
);

create index training_questions_video_idx on public.training_questions (video_id);
create index training_questions_module_idx on public.training_questions (module_id);

create table public.training_question_options (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references public.training_questions(id) on delete cascade not null,
  position integer not null check (position > 0),
  label text not null,
  -- justificativa/feedback específico da alternativa (opcional)
  feedback text,
  unique (question_id, position)
);

create table public.training_answer_keys (
  question_id uuid references public.training_questions(id) on delete cascade not null,
  option_id uuid references public.training_question_options(id) on delete cascade not null,
  primary key (question_id, option_id)
);

-- =============================================
-- Progresso do aluno
-- =============================================
create table public.training_enrollments (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.training_tracks(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  -- dados mínimos para o relatório do gestor e o certificado
  learner_name text not null,
  learner_email text not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  unique (track_id, company_id, user_id)
);

create index training_enrollments_company_idx on public.training_enrollments (company_id);

create table public.training_video_progress (
  enrollment_id uuid references public.training_enrollments(id) on delete cascade not null,
  video_id uuid references public.training_videos(id) on delete cascade not null,
  -- trechos realmente assistidos ([{start, end}] em segundos); avanço manual não conta
  watched_segments jsonb not null default '[]'::jsonb,
  last_position_seconds numeric(8, 2) not null default 0,
  watched_ratio numeric(5, 4) not null default 0,
  completed_at timestamptz,
  updated_at timestamptz default now() not null,
  primary key (enrollment_id, video_id)
);

create table public.training_quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.training_enrollments(id) on delete cascade not null,
  video_id uuid references public.training_videos(id) on delete cascade not null,
  answers jsonb not null,
  correct_count integer not null,
  total_count integer not null,
  passed boolean not null,
  created_at timestamptz default now() not null
);

create index training_quiz_attempts_enrollment_idx on public.training_quiz_attempts (enrollment_id);

create table public.training_exam_attempts (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.training_enrollments(id) on delete cascade not null,
  -- perguntas sorteadas e ordem das alternativas: [{questionId, optionIds}]
  paper jsonb not null,
  answers jsonb,
  correct_count integer,
  total_count integer not null,
  score_ratio numeric(5, 4),
  passed boolean,
  started_at timestamptz default now() not null,
  submitted_at timestamptz
);

-- No máximo uma tentativa em aberto por aluno.
create unique index training_exam_attempts_one_open_idx
  on public.training_exam_attempts (enrollment_id) where submitted_at is null;

create table public.training_certificates (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.training_enrollments(id) on delete cascade not null unique,
  verification_code text not null unique,
  learner_name text not null,
  company_name text not null,
  track_title text not null,
  workload_minutes integer not null,
  issued_at timestamptz default now() not null,
  expires_at timestamptz
);

-- =============================================
-- updated_at
-- =============================================
create trigger training_tracks_updated_at before update on public.training_tracks
  for each row execute function public.set_updated_at();
create trigger training_modules_updated_at before update on public.training_modules
  for each row execute function public.set_updated_at();
create trigger training_videos_updated_at before update on public.training_videos
  for each row execute function public.set_updated_at();
create trigger training_questions_updated_at before update on public.training_questions
  for each row execute function public.set_updated_at();
create trigger training_video_progress_updated_at before update on public.training_video_progress
  for each row execute function public.set_updated_at();

-- =============================================
-- RLS
-- =============================================
-- Empresas cujo progresso o usuário pode acompanhar: vínculo não-collaborator
-- ou DPO responsável. security definer para não reintroduzir a recursão de
-- policies corrigida na migration 042.
create or replace function public.training_manager_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.user_companies
  where user_id = p_user_id and role <> 'collaborator'
  union
  select id from public.companies where dpo_id = p_user_id;
$$;

revoke execute on function public.training_manager_company_ids(uuid) from public, anon;
grant execute on function public.training_manager_company_ids(uuid) to authenticated;

alter table public.training_tracks enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_videos enable row level security;
alter table public.training_questions enable row level security;
alter table public.training_question_options enable row level security;
alter table public.training_answer_keys enable row level security;
alter table public.training_enrollments enable row level security;
alter table public.training_video_progress enable row level security;
alter table public.training_quiz_attempts enable row level security;
alter table public.training_exam_attempts enable row level security;
alter table public.training_certificates enable row level security;

create policy "authenticated_can_read_training_tracks" on public.training_tracks
  for select to authenticated using (true);
create policy "authenticated_can_read_training_modules" on public.training_modules
  for select to authenticated using (true);
create policy "authenticated_can_read_published_training_videos" on public.training_videos
  for select to authenticated using (status = 'published');
create policy "authenticated_can_read_training_questions" on public.training_questions
  for select to authenticated using (active);
create policy "authenticated_can_read_training_question_options" on public.training_question_options
  for select to authenticated using (true);
-- training_answer_keys: sem policy de propósito (somente service role).

create policy "learner_or_manager_can_read_training_enrollments" on public.training_enrollments
  for select to authenticated using (
    user_id = auth.uid()
    or company_id in (select public.training_manager_company_ids(auth.uid()))
  );

create policy "learner_or_manager_can_read_training_video_progress" on public.training_video_progress
  for select to authenticated using (
    enrollment_id in (select id from public.training_enrollments)
  );

create policy "learner_or_manager_can_read_training_quiz_attempts" on public.training_quiz_attempts
  for select to authenticated using (
    enrollment_id in (select id from public.training_enrollments)
  );

create policy "learner_or_manager_can_read_training_exam_attempts" on public.training_exam_attempts
  for select to authenticated using (
    enrollment_id in (select id from public.training_enrollments)
  );

create policy "learner_or_manager_can_read_training_certificates" on public.training_certificates
  for select to authenticated using (
    enrollment_id in (select id from public.training_enrollments)
  );
