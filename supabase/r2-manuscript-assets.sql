-- Additive only: existing manuscripts and covers are unchanged.
create table public.manuscript_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  book_id uuid references public.books(id) on delete set null,
  episode_no integer not null check (episode_no > 0),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760),
  object_key text not null unique,
  status text not null default 'pending' check (status in ('pending','ready')),
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  unique(book_id, episode_no, sha256)
);
create index manuscript_assets_owner on public.manuscript_assets(owner_id);
alter table public.manuscript_assets enable row level security;
revoke all on public.manuscript_assets from public, anon, authenticated;
grant select on public.manuscript_assets to authenticated;
create policy manuscript_assets_owner_read on public.manuscript_assets for select to authenticated
using (owner_id = (select auth.uid()));
grant all on public.manuscript_assets to service_role;

-- Serialized reservations include unfinished uploads. Never free a reservation
-- until an operator has confirmed the corresponding R2 object is absent/deleted.
create function public.reserve_manuscript_asset(
 p_owner uuid, p_book uuid, p_episode integer, p_hash text, p_mime text,
 p_bytes bigint, p_total_limit bigint, p_owner_limit bigint
) returns public.manuscript_assets language plpgsql security invoker set search_path = '' as $$
declare existing public.manuscript_assets; result public.manuscript_assets; total_bytes bigint; own_bytes bigint;
begin
 perform pg_advisory_xact_lock(738211,1);
 if not exists(select 1 from public.books where id=p_book and owner_id=p_owner) then
  raise exception 'ASSET_OWNER_REQUIRED';
 end if;
 select * into existing from public.manuscript_assets where book_id=p_book and episode_no=p_episode and sha256=p_hash;
 if found then
  if existing.owner_id<>p_owner or existing.byte_size<>p_bytes or existing.mime_type<>p_mime then raise exception 'ASSET_CONFLICT'; end if;
  return existing;
 end if;
 if p_bytes<=0 or p_bytes>10485760 or (p_total_limit is not null and p_total_limit<=0) or (p_owner_limit is not null and p_owner_limit<=0) then raise exception 'ASSET_SIZE_LIMIT'; end if;
 select coalesce(sum(byte_size),0),coalesce(sum(byte_size) filter(where owner_id=p_owner),0)
 into total_bytes,own_bytes from public.manuscript_assets;
 if (p_total_limit is not null and total_bytes+p_bytes>p_total_limit) or (p_owner_limit is not null and own_bytes+p_bytes>p_owner_limit) then raise exception 'ASSET_QUOTA_EXCEEDED'; end if;
 insert into public.manuscript_assets(owner_id,book_id,episode_no,sha256,mime_type,byte_size,object_key)
 values(p_owner,p_book,p_episode,p_hash,p_mime,p_bytes,
  'manuscripts/'||p_owner::text||'/'||p_book::text||'/'||p_episode::text||'/'||p_hash)
 returning * into result;
 return result;
end $$;
revoke all on function public.reserve_manuscript_asset(uuid,uuid,integer,text,text,bigint,bigint,bigint) from public,anon,authenticated;
grant execute on function public.reserve_manuscript_asset(uuid,uuid,integer,text,text,bigint,bigint,bigint) to service_role;
