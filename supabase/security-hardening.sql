begin;
-- Existing covers remain readable; restrict future uploads to bounded raster files.
update storage.buckets set file_size_limit=10485760,allowed_mime_types=array['image/png','image/jpeg','image/webp'] where id='book-covers';
alter policy "authors can update own episodes" on public.episodes
 using (owner_id=(select auth.uid()))
 with check (owner_id=(select auth.uid()) and exists(select 1 from public.books b where b.id=episodes.book_id and b.owner_id=(select auth.uid())));
alter policy "owners can update own translations" on public.book_translations
 using (owner_id=(select auth.uid()))
 with check (owner_id=(select auth.uid()) and exists(select 1 from public.books b where b.id=book_translations.book_id and b.owner_id=(select auth.uid())));
-- Permanent author accounts only. Restrictive policies also cover future permissive rules.
drop policy if exists permanent_author_insert on public.books;
create policy permanent_author_insert on public.books as restrictive for insert to authenticated
 with check (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
drop policy if exists permanent_author_update on public.books;
create policy permanent_author_update on public.books as restrictive for update to authenticated
 using (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false')
 with check (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
drop policy if exists permanent_author_delete on public.books;
create policy permanent_author_delete on public.books as restrictive for delete to authenticated
 using (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
drop policy if exists permanent_author_insert on public.episodes;
create policy permanent_author_insert on public.episodes as restrictive for insert to authenticated
 with check (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
drop policy if exists permanent_author_update on public.episodes;
create policy permanent_author_update on public.episodes as restrictive for update to authenticated
 using (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false')
 with check (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
drop policy if exists permanent_author_delete on public.episodes;
create policy permanent_author_delete on public.episodes as restrictive for delete to authenticated
 using (coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
-- Serialize cover reservations so concurrent requests cannot evade daily limits.
create or replace function public.reserve_cover_generation(p_owner uuid,p_cover_key uuid,p_book uuid,p_user_prompt text,p_full_prompt text,p_style text,p_model text)
returns public.cover_generation_logs language plpgsql security invoker set search_path='' as $$
declare result public.cover_generation_logs;
begin
 perform pg_advisory_xact_lock(738211,2);
 if p_owner is null or p_cover_key is null or length(p_full_prompt)>6000 or length(p_user_prompt)>3000 then raise exception 'COVER_INPUT_INVALID';end if;
 if p_book is not null and not exists(select 1 from public.books where id=p_book and owner_id=p_owner) then raise exception 'COVER_OWNER_REQUIRED';end if;
 if (select count(*) from public.cover_generation_logs where user_id=p_owner and created_at>now()-interval '1 minute')>=2
 or (select count(*) from public.cover_generation_logs where user_id=p_owner and created_at>now()-interval '24 hours')>=10
 or (select count(*) from public.cover_generation_logs where created_at>now()-interval '24 hours')>=100 then raise exception 'COVER_RATE_LIMIT';end if;
 insert into public.cover_generation_logs(user_id,cover_key,book_id,user_prompt,full_prompt,style,model,quality,is_free,amount_krw,status)
 values(p_owner,p_cover_key,p_book,p_user_prompt,p_full_prompt,p_style,p_model,'medium',true,0,'pending') returning * into result;
 return result;
end $$;
revoke all on function public.reserve_cover_generation(uuid,uuid,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.reserve_cover_generation(uuid,uuid,uuid,text,text,text,text) to service_role;
commit;
