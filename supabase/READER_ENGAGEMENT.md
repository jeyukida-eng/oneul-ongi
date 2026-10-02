# Reader engagement
Apply episode-hearts.sql before book-subscriptions.sql.
Both setup scripts were applied to the current Supabase project.

Episode hearts are toggled per published episode. books.likes aggregates hearts across all episodes. A reader can heart each episode once; DELETE reverses its contribution.
Free book subscriptions are toggled per published book. books.subscriber_count is the per-book count. get_author_subscriber_count returns distinct reader identities across the authenticated author's books.
Subscriptions do not grant access to paid content or initiate payments. Notification delivery is not implemented.

Guests use a persistent random 256-bit browser token; only a SHA-256 hash is stored server-side. Browser storage deletion or another browser produces a new guest identity. Normal authenticated users are keyed by trusted auth.uid(). Guest and account identities are separate; no cross-identity merge is performed.
Private tables have RLS enabled and no client table grants. Public RPC wrappers use SECURITY INVOKER; privileged helpers live in pyeoda_private with empty search_path and explicit execute grants.
Counts change only after server-confirmed mutations, with idempotent desired-state RPCs. No Realtime reading connection is used. Query errors leave existing counts unchanged. Author responses are guarded against account changes.

Verified with rollback-only SQL assertions: repeated add/remove, invalid guest token, unpublished target rejection, account identity stability across different tokens, author distinct count across two books, private table grants. Web/mobile DOM tests cover syntax, toggles, stale response guards, locked episode, account isolation and the three studio lists.
