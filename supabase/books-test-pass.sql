-- Test-only 8,690 KRW / 30-day pass. No real payment, entitlement or revenue.
create table public.books_test_pass_orders (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 product_name text not null default '독자 월 이용권',
 amount_krw integer not null default 8690 check (amount_krw=8690),
 mode text not null default 'test' check (mode='test'),
 provider text not null default 'simulation' check (provider='simulation'),
 status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 valid_until timestamptz,
 check ((status='paid' and valid_until is not null) or (status<>'paid' and valid_until is null))
);
create index books_test_pass_user_created on public.books_test_pass_orders(user_id,created_at desc);
alter table public.books_test_pass_orders enable row level security;
revoke all on public.books_test_pass_orders from public,anon,authenticated;
grant select on public.books_test_pass_orders to authenticated;
grant all on public.books_test_pass_orders to service_role;
create policy books_test_pass_read_own on public.books_test_pass_orders for select to authenticated using ((select auth.uid())=user_id);

create function pyeoda_private.books_test_pass_user() returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); sid uuid;
begin
 if u is null or not exists(select 1 from auth.users where id=u and is_anonymous=false and deleted_at is null and (banned_until is null or banned_until<now())) then
  raise exception 'Signed-in account required' using errcode='42501';
 end if;
 sid:=(auth.jwt()->>'session_id')::uuid;
 if sid is null or not exists(select 1 from auth.sessions where id=sid and user_id=u and (not_after is null or not_after>now())) then
  raise exception 'Active session required' using errcode='42501';
 end if;
 return u;
end $$;

create function pyeoda_private.create_books_test_pass_order(p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=pyeoda_private.books_test_pass_user(); r public.books_test_pass_orders;
begin
 if p_request_id is null then raise exception 'Request ID required' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,813));
 select * into r from public.books_test_pass_orders where id=p_request_id;
 if found then
  if r.user_id<>u then raise exception 'Order unavailable' using errcode='42501'; end if;
  return to_jsonb(r);
 end if;
 if (select count(*) from public.books_test_pass_orders where user_id=u and created_at>now()-interval '1 day')>=40 then raise exception 'Too many test requests' using errcode='54000'; end if;
 insert into public.books_test_pass_orders(id,user_id) values(p_request_id,u) returning * into r;
 return to_jsonb(r);
end $$;

create function pyeoda_private.finish_books_test_pass_order(p_order_id uuid,p_outcome text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=pyeoda_private.books_test_pass_user();r public.books_test_pass_orders;
begin
 if p_outcome is null or p_outcome not in ('paid','failed','cancelled') then raise exception 'Invalid outcome' using errcode='22023'; end if;
 select * into r from public.books_test_pass_orders where id=p_order_id and user_id=u for update;
 if not found then raise exception 'Order unavailable' using errcode='42501'; end if;
 if r.status<>'pending' then return to_jsonb(r); end if;
 update public.books_test_pass_orders set status=p_outcome,finished_at=now(),valid_until=case when p_outcome='paid' then now()+interval '30 days' else null end where id=r.id returning * into r;
 return to_jsonb(r);
end $$;

create function pyeoda_private.books_test_pass_status() returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=pyeoda_private.books_test_pass_user(); until_at timestamptz;
begin
 select max(valid_until) into until_at from public.books_test_pass_orders where user_id=u and status='paid' and valid_until>now();
 return jsonb_build_object('active',until_at is not null,'valid_until',until_at,'mode','test','provider','simulation');
end $$;
create function public.create_books_test_pass_order(p_request_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select pyeoda_private.create_books_test_pass_order(p_request_id); $$;
create function public.finish_books_test_pass_order(p_order_id uuid,p_outcome text) returns jsonb language sql security invoker set search_path='' as $$ select pyeoda_private.finish_books_test_pass_order(p_order_id,p_outcome); $$;
create function public.books_test_pass_status() returns jsonb language sql security invoker set search_path='' as $$ select pyeoda_private.books_test_pass_status(); $$;
revoke all on function pyeoda_private.books_test_pass_user(),pyeoda_private.create_books_test_pass_order(uuid),pyeoda_private.finish_books_test_pass_order(uuid,text),pyeoda_private.books_test_pass_status(),public.create_books_test_pass_order(uuid),public.finish_books_test_pass_order(uuid,text),public.books_test_pass_status() from public,anon,authenticated;
grant usage on schema pyeoda_private to authenticated;
grant execute on function pyeoda_private.books_test_pass_user(),pyeoda_private.create_books_test_pass_order(uuid),pyeoda_private.finish_books_test_pass_order(uuid,text),pyeoda_private.books_test_pass_status(),public.create_books_test_pass_order(uuid),public.finish_books_test_pass_order(uuid,text),public.books_test_pass_status() to authenticated;
notify pgrst,'reload schema';
