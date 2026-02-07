const STATE_COOKIE = 'decap_oauth_state';

function getCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;

  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }

  return null;
}

function escapeForScript(value) {
  return value.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function popupMessageHtml(type, payload) {
  const message = `authorization:github:${type}:${JSON.stringify(payload)}`;
  const safe = escapeForScript(message);

  return `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(event) {
          window.opener.postMessage('${safe}', event.origin);
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }

        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`;
}

function clearStateCookie(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const secureAttr = proto === 'https' ? '; Secure' : '';
  return `${STATE_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secureAttr}`;
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID or GITHUB_OAUTH_CLIENT_SECRET');
  }

  const { code, state, error } = req.query;

  if (typeof error === 'string') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Set-Cookie', clearStateCookie(req));
    return res.status(400).send(popupMessageHtml('error', { error }));
  }

  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.status(400).send('Missing code or state');
  }

  const stateCookie = getCookie(req, STATE_COOKIE);
  if (!stateCookie || stateCookie !== state) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Set-Cookie', clearStateCookie(req));
    return res.status(401).send(popupMessageHtml('error', { error: 'invalid_state' }));
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state
    })
  });

  const tokenJson = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenJson.access_token) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Set-Cookie', clearStateCookie(req));
    return res
      .status(500)
      .send(popupMessageHtml('error', { error: tokenJson.error || 'token_exchange_failed' }));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Set-Cookie', clearStateCookie(req));
  return res.status(200).send(popupMessageHtml('success', { token: tokenJson.access_token }));
}
