# Hammer Crew — Kick LIVE status

This is the original site with only one addition: a LIVE badge on each member card when that Kick channel is currently live.

Kick API is called server-side through `/api/kick-live`, so no API secret is exposed in the browser.

## Required Vercel environment variable

Set:

`KICK_ACCESS_TOKEN`

to a Kick app access token with permission to read channel data.

The existing local images and all original HTML/CSS remain unchanged except for the LIVE badge markup/styles and the live-status code.
