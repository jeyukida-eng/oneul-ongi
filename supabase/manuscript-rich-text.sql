alter table public.episodes add column body_html text not null default '';
comment on column public.episodes.body_html is 'Rich manuscript markup; clients must sanitize using the manuscript formatting allowlist before rendering. Plain text remains in body.';
