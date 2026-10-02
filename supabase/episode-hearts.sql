-- Episode hearts: private reader records, public aggregate counts only.
create schema if not exists pyeoda_private;
revoke all on schema pyeoda_private from public;
grant usage on schema pyeoda_private to anon, authenticated;

create table if not exists pyeoda_private.episode_hearts (
  book_id uuid not null,
  episode_no integer not null check (episode_no > 0),
  reader_key text not null,
  created_at timestamptz not null default now(),
  primary key (book_id, episode_no, reader_key),
  foreign key (book_id, episode_no) references public.episodes(book_id, episode_no) on delete cascade
);
alter table pyeoda_private.episode_hearts enable row level security;
revoke all on pyeoda_private.episode_hearts from public, anon, authenticated;

create or replace function pyeoda_private.update_heart_total()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    update public.books set likes = coalesce(likes,0)+1 where id=NEW.book_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.books set likes = greatest(coalesce(likes,0)-1,0) where id=OLD.book_id;
    return OLD;
  end if;
  return null;
end;
$$;
revoke all on function pyeoda_private.update_heart_total() from public, anon, authenticated;
drop trigger if exists episode_hearts_total on pyeoda_private.episode_hearts;
create trigger episode_hearts_total after insert or delete on pyeoda_private.episode_hearts
for each row execute function pyeoda_private.update_heart_total();

create or replace function pyeoda_private.episode_heart_state(
  p_book_id uuid, p_episode_no integer, p_reader_token text, p_liked boolean
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  actor text;
  total bigint;
  episode_total bigint;
  is_liked boolean;
begin
  -- Authenticated readers are keyed by trusted auth.uid(), never user metadata.
  -- Guests use a browser-generated random bearer token, stored only as a hash.
  if viewer is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    actor := 'u:' || viewer::text;
  else
    if p_reader_token is null or p_reader_token !~ '^[a-f0-9]{64}$' then
      raise exception 'Invalid reader token' using errcode='22023';
    end if;
    actor := 'g:' || encode(extensions.digest(p_reader_token,'sha256'),'hex');
  end if;
  if p_episode_no is null or p_episode_no<1 then
    raise exception 'Invalid episode' using errcode='22023';
  end if;
  if p_liked is null then
    select coalesce(likes,0) into total from public.books where id=p_book_id and published=true;
  else
    -- Serialize writes to keep the cached book total atomic with each reaction.
    select coalesce(likes,0) into total from public.books where id=p_book_id and published=true for update;
  end if;
  if total is null or not exists(select 1 from public.episodes where book_id=p_book_id and episode_no=p_episode_no and published=true) then
    raise exception 'Published episode not found' using errcode='P0002';
  end if;
  if p_liked is true then
    insert into pyeoda_private.episode_hearts(book_id,episode_no,reader_key)
    values(p_book_id,p_episode_no,actor) on conflict do nothing;
  elsif p_liked is false then
    delete from pyeoda_private.episode_hearts where book_id=p_book_id and episode_no=p_episode_no and reader_key=actor;
  end if;
  select coalesce(likes,0) into total from public.books where id=p_book_id;
  select count(*),coalesce(bool_or(reader_key=actor),false) into episode_total,is_liked
  from pyeoda_private.episode_hearts where book_id=p_book_id and episode_no=p_episode_no;
  return jsonb_build_object('likes',total,'episode_likes',episode_total,'liked',is_liked);
end;
$$;
revoke all on function pyeoda_private.episode_heart_state(uuid,integer,text,boolean) from public;
grant execute on function pyeoda_private.episode_heart_state(uuid,integer,text,boolean) to anon,authenticated;

create or replace function public.get_episode_heart(p_book_id uuid,p_episode_no integer,p_reader_token text)
returns jsonb language sql security invoker set search_path = ''
as $$ select pyeoda_private.episode_heart_state(p_book_id,p_episode_no,p_reader_token,null); $$;
create or replace function public.set_episode_heart(p_book_id uuid,p_episode_no integer,p_reader_token text,p_liked boolean)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
begin
  if p_liked is null then raise exception 'Like state required' using errcode='22023'; end if;
  return pyeoda_private.episode_heart_state(p_book_id,p_episode_no,p_reader_token,p_liked);
end;
$$;
revoke all on function public.get_episode_heart(uuid,integer,text) from public;
revoke all on function public.set_episode_heart(uuid,integer,text,boolean) from public;
grant execute on function public.get_episode_heart(uuid,integer,text) to anon,authenticated;
grant execute on function public.set_episode_heart(uuid,integer,text,boolean) to anon,authenticated;
