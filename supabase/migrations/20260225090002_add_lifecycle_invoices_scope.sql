-- Migration: Add lifecycle states, scope documents, invoices, and change orders
-- These tables persist project lifecycle tracking, scope management, and invoicing

-- ===========================
-- Lifecycle States
-- ===========================
create table public.lifecycle_states (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  current_phase text not null default 'discovery',
  phase_started_at timestamptz not null default now(),
  phases_completed jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  client_health_score numeric not null default 100,
  updated_at timestamptz not null default now(),
  constraint lifecycle_states_project_id_key unique (project_id),
  constraint lifecycle_states_phase_check check (
    current_phase in ('discovery', 'proposal', 'design', 'feedback', 'revision', 'delivery', 'completed')
  ),
  constraint lifecycle_states_health_check check (
    client_health_score >= 0 and client_health_score <= 100
  )
);

-- ===========================
-- Scope Documents
-- ===========================
create table public.scope_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version int not null default 1,
  deliverables jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '{}'::jsonb,
  change_orders jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ===========================
-- Invoices
-- ===========================
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  designer_id uuid not null references auth.users(id) on delete cascade,
  client_email text not null,
  amount_cents int not null default 0,
  currency text not null default 'aud',
  status text not null default 'draft',
  stripe_invoice_id text,
  due_date date,
  paid_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_status_check check (
    status in ('draft', 'sent', 'paid', 'overdue')
  )
);

-- ===========================
-- Change Orders
-- ===========================
create table public.change_orders (
  id uuid primary key default gen_random_uuid(),
  scope_document_id uuid not null references public.scope_documents(id) on delete cascade,
  description text not null,
  impact text not null default 'timeline',
  status text not null default 'proposed',
  requested_by text not null,
  created_at timestamptz not null default now(),
  constraint change_orders_impact_check check (
    impact in ('timeline', 'budget', 'both')
  ),
  constraint change_orders_status_check check (
    status in ('proposed', 'approved', 'rejected')
  )
);

-- ===========================
-- Indexes
-- ===========================
create index idx_lifecycle_states_project on public.lifecycle_states(project_id);
create index idx_scope_documents_project on public.scope_documents(project_id);
create index idx_invoices_project on public.invoices(project_id);
create index idx_invoices_designer on public.invoices(designer_id);
create index idx_invoices_status on public.invoices(status);
create index idx_change_orders_scope on public.change_orders(scope_document_id);

-- ===========================
-- Updated_at triggers
-- ===========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger lifecycle_states_updated_at
  before update on public.lifecycle_states
  for each row execute function public.set_updated_at();

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ===========================
-- RLS Policies
-- ===========================
alter table public.lifecycle_states enable row level security;
alter table public.scope_documents enable row level security;
alter table public.invoices enable row level security;
alter table public.change_orders enable row level security;

-- Designers: see lifecycle for their own projects
create policy "designers_lifecycle_select" on public.lifecycle_states
  for select using (
    project_id in (select id from public.projects where designer_id = auth.uid())
  );

create policy "designers_lifecycle_all" on public.lifecycle_states
  for all using (
    project_id in (select id from public.projects where designer_id = auth.uid())
  );

-- Clients: read-only lifecycle for projects they're on
create policy "clients_lifecycle_select" on public.lifecycle_states
  for select using (
    project_id in (select id from public.projects where client_id = auth.uid())
  );

-- Scope documents: designers full, clients read
create policy "designers_scope_all" on public.scope_documents
  for all using (
    project_id in (select id from public.projects where designer_id = auth.uid())
  );

create policy "clients_scope_select" on public.scope_documents
  for select using (
    project_id in (select id from public.projects where client_id = auth.uid())
  );

-- Invoices: designers full access to their own, clients read their project's
create policy "designers_invoices_all" on public.invoices
  for all using (designer_id = auth.uid());

create policy "clients_invoices_select" on public.invoices
  for select using (
    project_id in (select id from public.projects where client_id = auth.uid())
  );

-- Change orders: designers full via scope doc -> project, clients read
create policy "designers_change_orders_all" on public.change_orders
  for all using (
    scope_document_id in (
      select sd.id from public.scope_documents sd
      join public.projects p on p.id = sd.project_id
      where p.designer_id = auth.uid()
    )
  );

create policy "clients_change_orders_select" on public.change_orders
  for select using (
    scope_document_id in (
      select sd.id from public.scope_documents sd
      join public.projects p on p.id = sd.project_id
      where p.client_id = auth.uid()
    )
  );
