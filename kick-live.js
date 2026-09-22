export default async function handler(req, res) {
  const slug = String(req.query?.slug || '').trim().toLowerCase();

  if (!slug || !/^[a-z0-9_]+$/.test(slug)) {
    return res.status(400).json({ is_live: false, error: 'Invalid slug' });
  }

  const token = process.env.KICK_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      is_live: false,
      error: 'KICK_ACCESS_TOKEN is not configured'
    });
  }

  try {
    const response = await fetch(
      `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        is_live: false,
        error: `Kick API returned ${response.status}`
      });
    }

    const body = await response.json();
    const channel = Array.isArray(body?.data) ? body.data[0] : null;

    return res.status(200).json({
      is_live: channel?.stream?.is_live === true
    });
  } catch {
    return res.status(502).json({
      is_live: false,
      error: 'Unable to reach Kick API'
    });
  }
}
