create table public.purchase_translation_chunks (
 book_id uuid not null references public.books(id) on delete cascade,
 source_hash text not null check(source_hash ~ '^[0-9a-f]{64}$'),
 language text not null check(language in ('en','ja','zh')),
 chunk_no integer not null check(chunk_no>=0),
 content jsonb,
 locked_until timestamptz not null default '1970-01-01',
 claim uuid,
 attempts integer not null default 0 check(attempts>=0),
 primary key(book_id,source_hash,language,chunk_no)
);
alter table public.purchase_translation_chunks enable row level security;
revoke all on public.purchase_translation_chunks from public,anon,authenticated;
grant all on public.purchase_translation_chunks to service_role;
