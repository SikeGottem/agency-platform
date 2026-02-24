-- Questionnaire step analytics: track time per step, completion, drop-offs
create table if not exists questionnaire_analytics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  step_key text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  skipped boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_qa_project_id on questionnaire_analytics(project_id);
create index idx_qa_step_key on questionnaire_analytics(step_key);

-- RLS
alter table questionnaire_analytics enable row level security;

-- Anyone can insert (clients via magic link don't have auth)
create policy "Anyone can insert analytics"
  on questionnaire_analytics for insert
  with check (true);

-- Designers can read analytics for their projects
create policy "Designers can read analytics"
  on questionnaire_analytics for select
  using (
    project_id in (
      select id from projects where designer_id = auth.uid()
    )
  );
