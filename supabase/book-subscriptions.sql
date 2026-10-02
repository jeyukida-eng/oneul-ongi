-- Free book follows. Counts do not grant access to paid episodes.
alter table public.books add column if not exists subscriber_count bigint not null default 0 check(subscriber_count>=0);
create table if not exists pyeoda_private.book_subscriptions(
 book_id uuid not null references public.books(id) on delete cascade,
 reader_key text not null, created_at timestamptz not null default now(),
 primary key(book_id,reader_key)
);
alter table pyeoda_private.book_subscriptions enable row level security;
revoke all on pyeoda_private.book_subscriptions from public,anon,authenticated;
create or replace function pyeoda_private.update_subscriber_total()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' then
  update public.books set subscriber_count=subscriber_count+1 where id=NEW.book_id;return NEW;
 else
  update public.books set subscriber_count=greatest(subscriber_count-1,0) where id=OLD.book_id;return OLD;
 end if;
end;$$;
revoke all on function pyeoda_private.update_subscriber_total() from public,anon,authenticated;
drop trigger if exists book_subscriptions_total on pyeoda_private.book_subscriptions;
create trigger book_subscriptions_total after insert or delete on pyeoda_private.book_subscriptions
for each row execute function pyeoda_private.update_subscriber_total();
create or replace function pyeoda_private.book_subscription_state(p_book_id uuid,p_reader_token text,p_subscribed boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor text;total bigint;
begin
 if auth.uid() is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  actor:='u:'||auth.uid()::text;
 else
  if p_reader_token is null or p_reader_token !~ '^[a-f0-9]{64}$' then
   raise exception 'Invalid reader token' using errcode='22023';
  end if;
  actor:='g:'||encode(extensions.digest(p_reader_token,'sha256'),'hex');
 end if;
 if p_subscribed is null then
  select subscriber_count into total from public.books where id=p_book_id and published=true;
 else
  select subscriber_count into total from public.books where id=p_book_id and published=true for update;
 end if;
 if total is null then raise exception 'Published book not found' using errcode='P0002';end if;
 if p_subscribed is true then
  insert into pyeoda_private.book_subscriptions(book_id,reader_key) values(p_book_id,actor) on conflict do nothing;
 elsif p_subscribed is false then
  delete from pyeoda_private.book_subscriptions where book_id=p_book_id and reader_key=actor;
 end if;
 select subscriber_count into total from public.books where id=p_book_id;
 return jsonb_build_object('subscriber_count',total,'subscribed',exists(select 1 from pyeoda_private.book_subscriptions where book_id=p_book_id and reader_key=actor));
end;$$;
revoke all on function pyeoda_private.book_subscription_state(uuid,text,boolean) from public;
grant execute on function pyeoda_private.book_subscription_state(uuid,text,boolean) to anon,authenticated;
create or replace function public.get_book_subscription(p_book_id uuid,p_reader_token text)
returns jsonb language sql security invoker set search_path='' as $$
 select pyeoda_private.book_subscription_state(p_book_id,p_reader_token,null);
$$;
create or replace function public.set_book_subscription(p_book_id uuid,p_reader_token text,p_subscribed boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if p_subscribed is null then raise exception 'Subscription state required' using errcode='22023';end if;
 return pyeoda_private.book_subscription_state(p_book_id,p_reader_token,p_subscribed);
end;$$;
create or replace function pyeoda_private.author_subscriber_count()
returns bigint language sql security definer set search_path='' as $$
 select count(distinct s.reader_key) from pyeoda_private.book_subscriptions s
 join public.books b on b.id=s.book_id where b.owner_id=auth.uid();
$$;
revoke all on function pyeoda_private.author_subscriber_count() from public,anon;
grant execute on function pyeoda_private.author_subscriber_count() to authenticated;
create or replace function public.get_author_subscriber_count()
returns bigint language sql security invoker set search_path='' as $$
 select pyeoda_private.author_subscriber_count();
$$;
revoke all on function public.get_book_subscription(uuid,text) from public;
revoke all on function public.set_book_subscription(uuid,text,boolean) from public;
revoke all on function public.get_author_subscriber_count() from public,anon;
grant execute on function public.get_book_subscription(uuid,text) to anon,authenticated;
grant execute on function public.set_book_subscription(uuid,text,boolean) to anon,authenticated;
grant execute on function public.get_author_subscriber_count() to authenticated;
