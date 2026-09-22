/**
 * Vercel Serverless Function
 * Mustafa-only Kick LIVE status test.
 *
 * It prefers the official Kick Public API when KICK_CLIENT_ID and
 * KICK_CLIENT_SECRET are configured. If they are not configured (or the
 * official endpoint is temporarily unavailable), it falls back to Kick's
 * public channel page API and checks whether a livestream object exists.
 */

const SLUG = 'mustafa_go';
const KICK_API = 'https://api.kick.com';
const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
const KICK_CHANNEL_API = `https://kick.com/api/v2/channels/${SLUG}`;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAppToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt - 60_000) return cachedToken;

  if (!process.env.KICK_CLIENT_ID || !process.env.KICK_CLIENT_SECRET) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.KICK_CLIENT_ID,
    client_secret: process.env.KICK_CLIENT_SECRET,
  });

  const response = await fetch(KICK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) throw new Error(`Kick token request failed: ${response.status}`);

  const token = await response.json();
  cachedToken = token.access_token;
  cachedTokenExpiresAt = now + Number(token.expires_in || 3600) * 1000;
  return cachedToken;
}

async function checkOfficialApi() {
  const accessToken = await getAppToken();
  if (!accessToken) return null;

  const response = await fetch(
    `${KICK_API}/public/v1/channels?slug=${encodeURIComponent(SLUG)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) throw new Error(`Kick channel request failed: ${response.status}`);

  const payload = await response.json();
  const channel = Array.isArray(payload.data) ? payload.data[0] : null;
  if (!channel) return false;

  // Kick channel responses expose the current stream in `stream`.
  // `is_live` is used when present; a non-null stream is also treated as live.
  return Boolean(channel.stream?.is_live ?? channel.stream);
}

async function checkKickChannelPageApi() {
  const response = await fetch(KICK_CHANNEL_API, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) throw new Error(`Kick channel page API failed: ${response.status}`);

  const channel = await response.json();

  // Kick's public channel data uses a livestream object when the channel is live.
  return Boolean(channel?.livestream);
}

export default async function handler(req, res) {
  const requestedSlug = String(req.query?.slug || '').toLowerCase();
  if (requestedSlug !== SLUG) {
    return res.status(400).json({
      ok: false,
      error: 'Only mustafa_go is enabled in this test.',
    });
  }

  try {
    let isLive = null;
    let source = 'official-api';

    try {
      isLive = await checkOfficialApi();
    } catch (error) {
      console.warn('Official Kick API check failed:', error.message);
    }

    if (isLive === null) {
      source = 'kick-channel-api';
      isLive = await checkKickChannelPageApi();
    }

    // Do not cache the live/offline result at the CDN.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      ok: true,
      slug: SLUG,
      is_live: Boolean(isLive),
      source,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Kick status check failed:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      ok: false,
      is_live: false,
      error: 'Unable to check Kick live status right now.',
    });
  }
}
