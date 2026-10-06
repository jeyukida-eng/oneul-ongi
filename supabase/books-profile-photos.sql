-- One small, private photo per account. Originals stay on the device.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('books-profile-photos', 'books-profile-photos', false, 102400, array['image/jpeg']);
create policy "books photo read own" on storage.objects for select to authenticated
using (bucket_id = 'books-profile-photos' and name = (select auth.uid())::text || '/avatar.jpg' and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false');
create policy "books photo insert own" on storage.objects for insert to authenticated
with check (bucket_id = 'books-profile-photos' and name = (select auth.uid())::text || '/avatar.jpg' and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false');
create policy "books photo update own" on storage.objects for update to authenticated
using (bucket_id = 'books-profile-photos' and name = (select auth.uid())::text || '/avatar.jpg' and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false')
with check (bucket_id = 'books-profile-photos' and name = (select auth.uid())::text || '/avatar.jpg' and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false');
create policy "books photo delete own" on storage.objects for delete to authenticated
using (bucket_id = 'books-profile-photos' and name = (select auth.uid())::text || '/avatar.jpg' and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false');
