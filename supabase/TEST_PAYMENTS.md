# PYEODA test checkout

Web and mobile use Toss Payments SDK v2 in test mode only. Server settings `TOSS_TEST_CLIENT_KEY` and `TOSS_TEST_SECRET_KEY` must be a matching test-key pair. Never commit the secret key. Live key prefixes are rejected by both server and client.

Authenticated, non-anonymous users can create orders and list their own 30 latest test orders. Prices come from server product definitions or book/episode records. Confirm checks buyer, amount, payment key, and the provider's DONE response; uses an idempotency key and reconciles already-processed payments. Browser cancellation cannot overwrite an approved/in-flight payment. Transient confirmation/storage failures retain a retryable pending order.

`payment_orders` is RLS-enabled with browser access revoked. Only the server service role writes or reads it. Provider responses store a small summary, never card details. Confirmed test book/episode orders grant test reading access through `public-episodes` for that buyer only. Test approval does not add usable points, update sales ledgers, or affect settlement.

Apply `test-payments.sql`, then `paid-test-publication.sql`, and deploy both payment functions plus `public-episodes`. The latter returns title/price metadata for locked episodes and withholds both plain and rich bodies; personal content uses private/no-store responses. Direct table RLS permits only authors and free published episodes. The first five episodes remain free. Apply the paid-publication script after the original pricing setup. Gateway JWT verification is disabled because each protected action explicitly verifies the user's access token with Supabase Auth. Only config readiness and the publishable Toss client key are available without authentication.

Live launch requires a separate authorized release: PG contract and review, dedicated live settings, payment/point entitlement transactions, refunds and webhook reconciliation, monitoring and settlement validation. Merely replacing keys cannot enable live payments in this test-only deployment.
