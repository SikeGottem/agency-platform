-- Messages table for client-designer communication
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'designer')),
  sender_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_project_id on public.messages(project_id);
create index idx_messages_created_at on public.messages(project_id, created_at);

alter table public.messages enable row level security;

-- Clients can read messages on projects they own
create policy "Clients can view their project messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and (p.client_id = auth.uid() or p.client_email = (select email from auth.users where id = auth.uid()))
    )
  );

-- Designers can read messages on projects they own
create policy "Designers can view their project messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and p.designer_id = auth.uid()
    )
  );

-- Clients can insert messages on their projects
create policy "Clients can send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and sender_type = 'client'
    and exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and (p.client_id = auth.uid() or p.client_email = (select email from auth.users where id = auth.uid()))
    )
  );

-- Designers can insert messages on their projects
create policy "Designers can send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and sender_type = 'designer'
    and exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and p.designer_id = auth.uid()
    )
  );
