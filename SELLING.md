# Selling Puzzle Parlor on the web with unlock codes

The web app at https://puzzle-parlor-app.pages.dev is free to try (the first two pictures in every theme) and locks the rest behind an unlock code. Store builds (Android via Capacitor) are paid upfront and never show the lock.

## Pieces
- `public/buy.html` — the sales page. Set `CHECKOUT_URL` (Square payment link) and `PRICE` at the bottom of the file. Until the link is set the buy buttons stay disabled.
- `public/admin.html` — make, list and revoke codes. Needs the admin key.
- `functions/api/license/[action].js` — `activate`, `deactivate` (public); `mint`, `list`, `revoke`, `unrevoke` (admin, header `x-admin-key`).
- `functions/api/square/webhook.js` — Square calls this after a payment; it mints a code and emails it.
- Codes look like `PP-XXXX-XXXX-XXXX`, work on up to 3 devices, and live in the PUZZLE_PROGRESS KV namespace under `lic:` keys.

## One-time setup
Add these as **GitHub repository secrets** (puzzle-parlor → Settings → Secrets and variables → Actions). Every deploy copies the ones that are set to the Cloudflare Pages project, so you never touch the Cloudflare dashboard. (Setting them directly in Cloudflare → Pages → Settings → Variables and Secrets also works.)

**Locking is off until `LICENSE_ADMIN_KEY` exists.** Without it the web app stays fully open, so nobody gets locked out before you can make codes. Once it is set, make a code for yourself in admin.html first.
| Secret | Purpose |
|---|---|
| `LICENSE_ADMIN_KEY` | Long random string; paste it into admin.html to manage codes. Required for admin.html. |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | From the Square webhook subscription (below). Required for automatic codes. |
| `PUZZLE_PRICE_CENTS` | e.g. `299`. Only payments of this amount (up to 17% more, to allow for sales tax) mint a code, so Phoenix Method client payments on the same Square account never do. Strongly recommended. |
| `RESEND_API_KEY` | Resend API key, to email codes automatically. Without it, codes are minted but you must email them by hand (they show in admin.html with the buyer's email). |
| `LICENSE_FROM_EMAIL` | Sender for the code email, e.g. `Puzzle Parlor <puzzles@kandyphoenix.com>`. The domain must be verified in Resend. |
| `LICENSE_REPLY_TO` | Optional, e.g. `puzzles@kandyphoenix.com`. |
| `APP_URL` | Optional, defaults to the pages.dev address. Set it when a custom domain exists. |

After adding a secret, run the "Deploy to Cloudflare Pages" workflow from the Actions tab (Run workflow) so it is copied across.

## Square setup
1. Square Dashboard → Online → Payment Links (or Items & Orders → Payment links): create a link for "Puzzle Parlor – full version", price $2.99, and turn on collecting the buyer's email (it is needed to send the code). Paste the link into `CHECKOUT_URL` in buy.html.
2. developer.squareup.com → your application → Webhooks → Add subscription: URL `https://puzzle-parlor-app.pages.dev/api/square/webhook`, API version current, events `payment.created` and `payment.updated`. Copy the **Signature key** into the `SQUARE_WEBHOOK_SIGNATURE_KEY` secret.
3. Send a test event from the Square dashboard, or make a real $2.99 purchase and refund it, and confirm the code appears in admin.html.

## Manual sales
Open admin.html, paste the admin key, make a code, and email it to the buyer. Works for Square invoices, gifts, or giveaways.

## Pricing note
The Google Play build is sold separately through Google at its own price and is always fully unlocked. The web unlock price is independent; keep the two roughly in line to avoid confusing buyers.
