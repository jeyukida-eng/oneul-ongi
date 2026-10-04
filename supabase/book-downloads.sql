-- Private sale files; only the authenticated, purchase-checking Edge Function serves bytes.
create table if not exists public.book_download_files (
 id uuid primary key default gen_random_uuid(),
 book_id uuid not null references public.books(id) on delete cascade,
 owner_id uuid not null references auth.users(id),
 language text not null check(language in ('ko','en','ja','zh','multi')),
 format text not null check(format in ('pdf','epub')),
 filename text not null check(length(filename) between 1 and 180),
 object_key text not null,
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 byte_size bigint not null check(byte_size between 1 and 52428800),
 updated_at timestamptz not null default now(),
 unique(book_id,language,format)
);
alter table public.book_download_files enable row level security;
revoke all on public.book_download_files from public,anon,authenticated;
grant all on public.book_download_files to service_role;
create index if not exists book_download_files_owner_idx on public.book_download_files(owner_id);
