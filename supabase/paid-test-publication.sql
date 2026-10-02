begin;
-- Direct API clients can read original paid manuscripts only as the author.
-- Readers receive paid bodies through the authenticated purchase-checking function.
alter policy "public can read published episodes" on public.episodes
 using (
  owner_id=(select auth.uid())
  or (published=true and price=0 and exists(select 1 from public.books b where b.id=episodes.book_id and b.published=true))
 );
alter table public.episodes drop constraint if exists episodes_paid_publication_pending;
-- episodes_first_five_free and episodes_price_nonnegative remain enforced.
commit;
