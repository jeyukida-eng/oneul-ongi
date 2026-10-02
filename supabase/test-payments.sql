-- Test payment orders are written only by authenticated Edge Functions.
create table if not exists public.payment_orders (
 id uuid primary key default gen_random_uuid(), order_id text not null unique,
 provider text not null default 'toss', environment text not null check(environment in ('test','live')),
 product_key text not null, product_name text not null, amount integer not null check(amount>0),
 currency text not null default 'KRW', buyer_id uuid references auth.users(id) on delete set null,
 book_id uuid references public.books(id) on delete set null,
 status text not null default 'pending' check(status in ('pending','confirmed','failed','canceled')),
 payment_key text unique, method text, approved_at timestamptz, failed_code text, failed_message text,
 provider_response jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.payment_orders enable row level security;
revoke all on public.payment_orders from anon, authenticated;
grant all on public.payment_orders to service_role;
create index if not exists payment_orders_buyer_created_idx on public.payment_orders(buyer_id,created_at desc);
create index if not exists payment_orders_book_idx on public.payment_orders(book_id);
-- No sales ledger, reader entitlements, or real point balances are updated in test mode.
