-- Shared books/accounts/payments; verification records are written only by a trusted provider callback.
begin;
alter table public.books add column age_rating text not null default 'all' check(age_rating in ('all','15','19'));
alter table public.books add column adult_review_status text not null default 'pending' check(adult_review_status in ('pending','approved','rejected','suspended'));
alter table public.books add column adult_policy_version text;
alter table public.books add column adult_review_note text not null default '';
create table public.adult_verifications (
 user_id uuid primary key references auth.users(id) on delete cascade,
 provider text not null, verification_reference text not null unique,
 verified_at timestamptz not null default now(), expires_at timestamptz not null,
 revoked_at timestamptz, check(expires_at>verified_at)
);
alter table public.adult_verifications enable row level security;
grant select on public.adult_verifications to authenticated;
revoke insert,update,delete on public.adult_verifications from anon,authenticated;
create policy adult_verification_self_read on public.adult_verifications for select to authenticated using(user_id=(select auth.uid()));
create table public.adult_review_history (
 id bigint generated always as identity primary key, book_id uuid references public.books(id) on delete set null,
 actor_id uuid, old_status text, new_status text, note text, created_at timestamptz not null default now()
);
alter table public.adult_review_history enable row level security;
grant select on public.adult_review_history to authenticated;
create policy adult_history_admin_read on public.adult_review_history for select to authenticated using((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create table public.adult_reports (
 id bigint generated always as identity primary key, book_id uuid not null references public.books(id) on delete cascade,
 reporter_id uuid not null default auth.uid() references auth.users(id), reason text not null check(length(reason) between 5 and 2000),
 status text not null default 'open' check(status in ('open','resolved')), created_at timestamptz not null default now()
);
alter table public.adult_reports enable row level security;
grant select,insert,update on public.adult_reports to authenticated;
grant usage on sequence public.adult_reports_id_seq to authenticated;
create policy adult_report_insert on public.adult_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and status='open' and exists(select 1 from public.books b where b.id=book_id and b.age_rating='19'));
create policy adult_report_read on public.adult_reports for select to authenticated using(reporter_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create policy adult_report_admin_update on public.adult_reports for update to authenticated using((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true') with check((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create policy adult_admin_books_read on public.books for select to authenticated using((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create policy adult_admin_books_update on public.books for update to authenticated using((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true') with check((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create policy adult_books_gate on public.books as restrictive for select to anon,authenticated using(
 age_rating<>'19' or owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true' or
 (adult_review_status='approved' and exists(select 1 from public.adult_verifications v where v.user_id=(select auth.uid()) and v.expires_at>now() and v.revoked_at is null))
);
create policy adult_episodes_gate on public.episodes as restrictive for select to anon,authenticated using(exists(select 1 from public.books b where b.id=book_id));
create policy adult_admin_episodes_read on public.episodes for select to authenticated using((select auth.jwt()->'app_metadata'->>'pyeoda_admin')='true');
create schema if not exists private;
create function private.guard_adult_book() returns trigger language plpgsql set search_path='' as $$
declare is_admin boolean := coalesce(auth.jwt()->'app_metadata'->>'pyeoda_admin'='true',false) or current_user in ('postgres','service_role');
begin
 if TG_OP='UPDATE' and old.age_rating='19' and new.age_rating<>'19' then raise exception '19+ 작품은 일반관으로 직접 변경할 수 없습니다. 관리자 검토가 필요합니다.'; end if;
 if new.age_rating='19' then
  if new.adult_policy_version is distinct from '2026-10-v1' then raise exception '19+ 등록기준 동의가 필요합니다.'; end if;
  -- Adult covers cannot be written to the existing publicly accessible cover bucket.
  new.cover_url:='';
  if TG_OP='INSERT' then new.adult_review_status:='pending';new.adult_review_note:='';
  elsif not is_admin then
   if new.adult_review_status is distinct from old.adult_review_status or new.adult_review_note is distinct from old.adult_review_note then raise exception '심사 상태는 관리자만 변경할 수 있습니다.'; end if;
   if row(new.title,new.subtitle,new.intro,new.author_note,new.tags,new.category,new.genre,new.cover_prompt) is distinct from row(old.title,old.subtitle,old.intro,old.author_note,old.tags,old.category,old.genre,old.cover_prompt) or old.age_rating<>'19' then
    new.adult_review_status:='pending';new.adult_review_note:='작품 정보 변경: 재심사';
   end if;
  end if;
 end if;
 return new;
end $$;
create trigger adult_book_guard before insert or update on public.books for each row execute function private.guard_adult_book();
-- Only this internal trigger writes the append-only review history.
create function private.audit_adult_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.adult_review_status is distinct from new.adult_review_status or old.adult_review_note is distinct from new.adult_review_note then
  insert into public.adult_review_history(book_id,actor_id,old_status,new_status,note) values(new.id,auth.uid(),old.adult_review_status,new.adult_review_status,new.adult_review_note);
 end if;
 return new;
end $$;
revoke all on function private.audit_adult_review() from public,anon,authenticated;
create trigger adult_review_audit after update on public.books for each row execute function private.audit_adult_review();
create function private.adult_episode_recheck() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and row(old.title,old.body,old.body_html,old.published) is not distinct from row(new.title,new.body,new.body_html,new.published) then return new; end if;
 update public.books set adult_review_status='pending',adult_review_note='회차 변경: 재심사' where id=case when TG_OP='DELETE' then old.book_id else new.book_id end and age_rating='19';
 if TG_OP='DELETE' then return old; end if;return new;
end $$;
revoke all on function private.adult_episode_recheck() from public,anon,authenticated;
create trigger adult_episode_recheck after insert or update or delete on public.episodes for each row execute function private.adult_episode_recheck();
commit;
