# Puzzle Parlor

Jigsaw puzzles (500 / 750 / 1,000 pieces) with a piece tray, light table, and progress sync across devices.

- `public/` is the whole app: static HTML, pictures and the PWA files (manifest, service worker, icons).
- `functions/api/` is a tiny Cloudflare Pages Function that stores progress in the `PUZZLE_PROGRESS` KV namespace, keyed by the player's sync code.
- `.github/workflows/deploy.yml` deploys to Cloudflare Pages on every push to `main`. It needs one repository secret: `CLOUDFLARE_API_TOKEN` (a token with **Cloudflare Pages: Edit** and **Workers KV Storage: Edit** permissions).

## Run locally
Open `public/index.html` in a browser (sync is unavailable without the Cloudflare backend), or `npx wrangler pages dev public` for the full thing.

## Install as an app
Open the deployed site, then **Add to Home Screen** (iPhone/iPad Safari: Share button) or **Install app** (Chrome/Edge). Enter the same sync code on each device under **Sync across devices**.

Pictures: the "New scene" illustrations were generated with Canva AI for this app; everything else is public-domain art from Wikimedia Commons (credits link from each card).
