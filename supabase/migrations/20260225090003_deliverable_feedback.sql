-- ===========================
-- Deliverables & Feedback
-- ===========================

-- Deliverables table (individual files/designs shared for review)
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  designer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  file_type text not null default 'image', -- image | pdf
  round int not null default 1,
  version int not null default 1,
  status text not null default 'awaiting_feedback',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliverables_status_check check (
    status in ('awaiting_feedback', 'feedback_given', 'changes_addressed', 'approved')
  ),
  constraint deliverables_file_type_check check (
    file_type in ('image', 'pdf')
  )
);

-- Feedback on deliverables
create table public.deliverable_feedback (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  category_ratings jsonb not null default '{}'::jsonb,
  comments text,
  overall_rating text not null default 'neutral',
  addressed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint feedback_rating_check check (
    overall_rating in ('approve', 'changes', 'neutral')
  )
);

-- Indexes
create index idx_deliverables_project on public.deliverables(project_id);
create index idx_deliverables_round on public.deliverables(project_id, round);
create index idx_feedback_deliverable on public.deliverable_feedback(deliverable_id);

-- RLS
alter table public.deliverables enable row level security;
alter table public.deliverable_feedback enable row level security;

-- Designers can manage their own deliverables
create policy "designers_manage_deliverables" on public.deliverables
  for all using (designer_id = auth.uid());

-- Clients can view deliverables for projects they're part of
create policy "clients_view_deliverables" on public.deliverables
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

-- Clients can insert feedback
create policy "clients_insert_feedback" on public.deliverable_feedback
  for insert with check (client_id = auth.uid());

-- Clients can view their own feedback
create policy "clients_view_feedback" on public.deliverable_feedback
  for select using (client_id = auth.uid());

-- Designers can view and update feedback on their deliverables
create policy "designers_manage_feedback" on public.deliverable_feedback
  for all using (
    exists (
      select 1 from public.deliverables d
      where d.id = deliverable_id and d.designer_id = auth.uid()
    )
  );
