-- Migration: Add deliverables table for project workspace
-- Stores design concepts, files, and deliverables organized by rounds

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  designer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  file_type text, -- 'image', 'pdf', 'figma', 'other'
  version int not null default 1,
  round_number int not null default 1,
  status text not null default 'draft' check (
    status in ('draft', 'shared', 'feedback', 'approved')
  ),
  shared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.deliverables enable row level security;

-- Designers see their own deliverables
create policy "Designers can manage their deliverables"
  on public.deliverables for all
  using (auth.uid() = designer_id)
  with check (auth.uid() = designer_id);

-- Clients can see shared deliverables for their projects
create policy "Clients can view shared deliverables"
  on public.deliverables for select
  using (
    status in ('shared', 'feedback', 'approved')
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

-- Index for fast lookups
create index deliverables_project_id_idx on public.deliverables(project_id);
create index deliverables_round_idx on public.deliverables(project_id, round_number);

-- Ensure deliverables storage bucket exists
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do nothing;

-- Storage policies for deliverables bucket
create policy "Designers can upload deliverables"
  on storage.objects for insert
  with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');

create policy "Designers can view their deliverables"
  on storage.objects for select
  using (bucket_id = 'deliverables' and auth.role() = 'authenticated');

create policy "Designers can delete their deliverables"
  on storage.objects for delete
  using (bucket_id = 'deliverables' and auth.role() = 'authenticated');
