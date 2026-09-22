# Hammer Crew — Mustafa Kick LIVE test

This version checks only `mustafa_go` and shows a red `LIVE` badge on Mustafa's card while he is live.

## How it works

- The browser calls `/api/kick-status?slug=mustafa_go`.
- The server function first tries the official Kick Public API if `KICK_CLIENT_ID` and `KICK_CLIENT_SECRET` are configured.
- If those variables are not configured or the official API is temporarily unavailable, the function falls back to Kick's public channel data and checks for the current livestream.
- The status is refreshed every 15 seconds.
- The response is not CDN-cached, so starting/stopping a stream is reflected quickly.

Kick's current developer documentation lists the channel and livestream APIs, and its changelog notes that the older Livestreams V1 listing is deprecated in favor of newer livestream endpoints. See the official Kick DevDocs for current API details.

## Vercel

Upload/deploy the whole project folder. No environment variables are required for the fallback test.

If you have a Kick Developer application, you can optionally add:

- `KICK_CLIENT_ID`
- `KICK_CLIENT_SECRET`

Never put either secret directly into `index.html` or `script.js`.

## Local file warning

Opening `index.html` directly with `file://` will not execute the `/api` serverless function. Deploy the project to Vercel (or run it through a compatible serverless development server) to test the real status check.
