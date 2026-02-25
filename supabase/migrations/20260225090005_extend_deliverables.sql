-- Extend deliverables: allow more file types (figma links), add shared_at, relax constraints

-- Allow null file_url (for figma links stored as url) and more file types
alter table public.deliverables alter column file_url drop not null;
alter table public.deliverables drop constraint if exists deliverables_file_type_check;
alter table public.deliverables add constraint deliverables_file_type_check check (
  file_type in ('image', 'pdf', 'figma', 'other')
);

-- Add shared_at timestamp
alter table public.deliverables add column if not exists shared_at timestamptz;

-- Update status constraint to include 'draft' and 'shared' for pre-share workflow
alter table public.deliverables drop constraint if exists deliverables_status_check;
alter table public.deliverables add constraint deliverables_status_check check (
  status in ('draft', 'shared', 'awaiting_feedback', 'feedback_given', 'changes_addressed', 'approved')
);

-- Ensure deliverables storage bucket
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do nothing;

-- Storage policies (idempotent)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'upload_deliverables' and tablename = 'objects') then
    create policy "upload_deliverables" on storage.objects for insert
      with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'view_deliverables' and tablename = 'objects') then
    create policy "view_deliverables" on storage.objects for select
      using (bucket_id = 'deliverables' and auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'delete_deliverables' and tablename = 'objects') then
    create policy "delete_deliverables" on storage.objects for delete
      using (bucket_id = 'deliverables' and auth.role() = 'authenticated');
  end if;
end $$;
