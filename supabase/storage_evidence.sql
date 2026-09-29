-- Private compliance evidence bucket + owner-scoped object policies.
-- Apply in the Supabase SQL editor after schema.sql.

insert into storage.buckets (id, name, public)
values ('evidence-vault', 'evidence-vault', false)
on conflict (id) do nothing;

drop policy if exists "evidence-vault: owner insert" on storage.objects;
create policy "evidence-vault: owner insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "evidence-vault: owner select" on storage.objects;
create policy "evidence-vault: owner select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "evidence-vault: owner update" on storage.objects;
create policy "evidence-vault: owner update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "evidence-vault: owner delete" on storage.objects;
create policy "evidence-vault: owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
