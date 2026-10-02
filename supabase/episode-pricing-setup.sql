-- Pricing setup only. Paid publication stays closed until checkout launches.
alter table public.books add column default_episode_price integer not null default 0
  constraint books_default_episode_price_nonnegative check (default_episode_price >= 0);
alter table public.episodes add column price integer not null default 0
  constraint episodes_price_nonnegative check (price >= 0)
  constraint episodes_first_five_free check (episode_no > 5 or price = 0)
  constraint episodes_paid_publication_pending check (not published or price = 0);
comment on column public.books.default_episode_price is 'Default price in KRW for newly created episodes after episode 5; 0 means free.';
comment on column public.episodes.price is 'Episode price in KRW; episodes 1-5 always free. Paid publication awaits checkout launch.';
