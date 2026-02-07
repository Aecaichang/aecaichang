import crypto from 'node:crypto';

const STATE_COOKIE = 'decap_oauth_state';
const STATE_TTL_SECONDS = 600;

function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID');
  }

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${getBaseUrl(req)}/api/callback`;

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'repo user');
  url.searchParams.set('state', state);

  const isSecure = redirectUri.startsWith('https://');
  const secureAttr = isSecure ? '; Secure' : '';

  res.setHeader(
    'Set-Cookie',
    `${STATE_COOKIE}=${state}; Max-Age=${STATE_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secureAttr}`
  );

  return res.redirect(302, url.toString());
}
