-- Public creator identity and private reader follow relationships.
create table public.book_creator_profiles (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(char_length(display_name) between 1 and 60),
 bio text not null default '' check(char_length(bio)<=300),
 work_note text not null default '' check(char_length(work_note)<=1000),
 updated_at timestamptz not null default now()
);
alter table public.book_creator_profiles enable row level security;
grant select on public.book_creator_profiles to anon,authenticated;
grant insert,update on public.book_creator_profiles to authenticated;
create policy creator_profile_read on public.book_creator_profiles for select to anon,authenticated
 using(owner_id=(select auth.uid()) or exists(select 1 from public.books b where b.owner_id=book_creator_profiles.owner_id and b.published and b.age_rating in ('all','15')));
create policy creator_profile_insert on public.book_creator_profiles for insert to authenticated
 with check(owner_id=(select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
create policy creator_profile_update on public.book_creator_profiles for update to authenticated
 using(owner_id=(select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false))
 with check(owner_id=(select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
create table public.book_creator_follows (
 creator_id uuid not null references auth.users(id) on delete cascade,
 reader_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(creator_id,reader_id),
 check(creator_id<>reader_id)
);
create index book_creator_follows_reader_idx on public.book_creator_follows(reader_id);
alter table public.book_creator_follows enable row level security;
grant select,insert,delete on public.book_creator_follows to authenticated;
create policy creator_follow_read on public.book_creator_follows for select to authenticated using(reader_id=(select auth.uid()));
create policy creator_follow_insert on public.book_creator_follows for insert to authenticated
 with check(reader_id=(select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false)
 and exists(select 1 from public.books b where b.owner_id=creator_id and b.published and b.age_rating in ('all','15')));
create policy creator_follow_delete on public.book_creator_follows for delete to authenticated using(reader_id=(select auth.uid()));
-- Counts expose no follower identities. Definer is needed only for the private aggregate;
-- the viewer may access their own unpublished creator page, or a creator with public works.
create function pyeoda_private.book_creator_follow_state(p_creator_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
begin
 if p_creator_id is distinct from auth.uid() and not exists(
 select 1 from public.books b where b.owner_id=p_creator_id and b.published and b.age_rating in ('all','15')) then
  raise exception 'Creator not found' using errcode='P0002';
 end if;
 return (select jsonb_build_object('followers',count(*),'following',coalesce(bool_or(reader_id=auth.uid()),false))
 from public.book_creator_follows where creator_id=p_creator_id);
end;
$$;
revoke all on function pyeoda_private.book_creator_follow_state(uuid) from public;
grant execute on function pyeoda_private.book_creator_follow_state(uuid) to anon,authenticated;
create function public.get_book_creator_follow_state(p_creator_id uuid)
returns jsonb language sql security invoker set search_path=''
as $$ select pyeoda_private.book_creator_follow_state(p_creator_id); $$;
revoke all on function public.get_book_creator_follow_state(uuid) from public;
grant execute on function public.get_book_creator_follow_state(uuid) to anon,authenticated;

