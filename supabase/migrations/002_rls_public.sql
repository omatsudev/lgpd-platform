-- Public INSERT policies for external forms (unauthenticated)
-- Complaints and data subject requests can be submitted by anyone

-- Public form: anyone can create a complaint
create policy "public_can_insert_complaints" on public.complaints
  for insert with check (true);

-- Public form: anyone can create a data subject request
create policy "public_can_insert_data_subject_requests" on public.data_subject_requests
  for insert with check (true);

-- RLS for trainings: company users can manage
create policy "user_can_manage_trainings" on public.trainings
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- RLS for training_employees: company users can manage
create policy "user_can_manage_training_employees" on public.training_employees
  for all using (
    training_id in (
      select t.id from public.trainings t
      join public.user_companies uc on uc.company_id = t.company_id
      where uc.user_id = auth.uid()
    )
  );

-- RLS for companies: INSERT for authenticated users (to create a new company)
create policy "user_can_insert_companies" on public.companies
  for insert with check (owner_id = auth.uid());

-- RLS for user_companies: INSERT for authenticated users
create policy "user_can_insert_user_companies" on public.user_companies
  for insert with check (user_id = auth.uid());

-- RLS for logs: INSERT for company users
create policy "user_can_insert_logs" on public.audit_logs
  for insert with check (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
