-- Read only the caller's existing episode reactions; private reader keys never leave the database.
create or replace function pyeoda_private.liked_books(p_reader_token text)
returns table(book_id uuid, liked_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare viewer uuid := auth.uid(); actor text;
begin
 if viewer is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  actor := 'u:' || viewer::text;
 else
  if p_reader_token is null or p_reader_token !~ '^[a-f0-9]{64}$' then
   raise exception 'Invalid reader token' using errcode='22023';
  end if;
  actor := 'g:' || encode(extensions.digest(p_reader_token,'sha256'),'hex');
 end if;
 return query select h.book_id,max(h.created_at) from pyeoda_private.episode_hearts h
 join public.books b on b.id=h.book_id and b.published=true
 join public.episodes e on e.book_id=h.book_id and e.episode_no=h.episode_no and e.published=true
 where h.reader_key=actor group by h.book_id order by max(h.created_at) desc;
end;
$$;
revoke all on function pyeoda_private.liked_books(text) from public;
grant execute on function pyeoda_private.liked_books(text) to anon,authenticated;
create or replace function public.get_my_liked_books(p_reader_token text)
returns table(book_id uuid, liked_at timestamptz)
language sql security invoker set search_path = ''
as $$ select * from pyeoda_private.liked_books(p_reader_token); $$;
revoke all on function public.get_my_liked_books(text) from public;
grant execute on function public.get_my_liked_books(text) to anon,authenticated;
