alter table public.books add column if not exists image_layout text not null default 'auto' check(image_layout in ('auto','single','spread'));
