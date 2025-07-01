import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 8000;

const SSO_URL = "http://localhost:3000";
const CLIENT_ID = "app1";
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const STATE = "xyz123";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

function getCookieName(name) {
  return `${name}_${CLIENT_ID}`;
}

const htmlTemplate = (content) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>SSO Client: ${CLIENT_ID}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/client.js"></script>
  <script>startTokenAutoRefresh("${CLIENT_ID}")</script>

</head >
  <body class="bg-gray-50 min-h-screen">
    <div class="max-w-xl mx-auto py-10 px-6">
      <h1 class="text-2xl font-bold mb-4">🔐 SSO Client: ${CLIENT_ID}</h1>
      ${content}
    </div>
  </body>
</html >
  `;

app.get("/", async (req, res) => {
  let access_token = req.cookies[getCookieName("access_token")];
  let refresh_token = req.cookies[getCookieName("refresh_token")];
  const expires_at = req.cookies[getCookieName("expires_at")];

  if (!access_token && refresh_token) {
    try {
      const refreshRes = await fetch(`${SSO_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token,
          client_id: CLIENT_ID,
        })
      });

      const newData = await refreshRes.json();
      if (newData.access_token) {
        access_token = newData.access_token;
        const newExpires = Date.now() + newData.expires_in * 1000;

        res.cookie(getCookieName("access_token"), newData.access_token, {
          httpOnly: true,
          sameSite: "Lax",
          maxAge: newData.expires_in * 1000
        });
        res.cookie(getCookieName("refresh_token"), newData.refresh_token, {
          httpOnly: true,
          sameSite: "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie(getCookieName("expires_at"), newExpires, {
          sameSite: "Lax"
        });

        return res.redirect("/");
      }
    } catch (e) {
      console.error(" Gagal refresh token:", e.message);
    }
  }

  if (!access_token) {
    const loginURL = `${SSO_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
    return res.send(
      htmlTemplate(`
        <a href="${loginURL}" class="bg-blue-600 text-white px-4 py-2 rounded inline-block">
          🔑 Login with SSO
        </a>
      `)
    );
  }

  const content = `
    <div class="space-y-4">
      <div class="p-4 bg-green-100 rounded">
        <h2 class="font-semibold mb-2">Session</h2>
        <p><b>Token:</b> ${access_token.slice(0, 20)}...${access_token.slice(-20)}</p>
        <p><b>Expires:</b> ${expires_at ? new Date(Number(expires_at)).toLocaleString() : "?"}</p>
      </div>
      <div class="flex space-x-4">
        <form action="/userinfo" method="GET">
          <button class="bg-blue-600 text-white px-4 py-2 rounded">🔎 User Info</button>
        </form>
        <form action="/logout" method="POST">
          <button class="bg-red-500 text-white px-4 py-2 rounded">🚪 Logout</button>
        </form>
      </div>
    </div>
  `;

  res.send(htmlTemplate(content));
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send(htmlTemplate(`<p class="text-red-600"> No code received</p>`));

  try {
    const tokenRes = await fetch(`${SSO_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await tokenRes.json();

    if (!data.access_token) {
      return res.send(htmlTemplate(`<p class="text-red-600"> Token exchange failed</p><pre>${JSON.stringify(data, null, 2)}</pre>`));
    }

    const expiresAt = Date.now() + data.expires_in * 1000;

    res.cookie(getCookieName("access_token"), data.access_token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: data.expires_in * 1000
    });
    res.cookie(getCookieName("refresh_token"), data.refresh_token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.cookie(getCookieName("expires_at"), expiresAt, {
      sameSite: "Lax"
    });

    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.send(htmlTemplate(`<p class="text-red-600"> Failed: ${err.message}</p>`));
  }
});

app.post("/refresh-token", async (req, res) => {
  const refresh_token = req.cookies[getCookieName("refresh_token")];
  if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

  try {
    const refreshRes = await fetch(`${SSO_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token,
        client_id: CLIENT_ID,
      })
    });

    const data = await refreshRes.json();
    if (!data.access_token) return res.status(401).json({ error: "Invalid refresh" });

    const expiresAt = Date.now() + data.expires_in * 1000;

    res.cookie(getCookieName("access_token"), data.access_token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: data.expires_in * 1000
    });
    res.cookie(getCookieName("refresh_token"), data.refresh_token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.cookie(getCookieName("expires_at"), expiresAt, {
      sameSite: "Lax"
    });

    return res.json({ refreshed: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/userinfo", async (req, res) => {
  const access_token = req.cookies[getCookieName("access_token")];
  if (!access_token) return res.redirect("/");

  try {
    const resp = await fetch(`${SSO_URL}/userinfo`, {
      headers: { Authorization: "Bearer " + access_token }
    });
    const user = await resp.json();

    return res.send(htmlTemplate(`
      <h2 class="text-xl font-bold mb-2">👤 User Info</h2>
      <pre class="bg-gray-100 p-4 rounded">${JSON.stringify(user, null, 2)}</pre>
      <a href="/" class="text-blue-600 hover:underline mt-4 inline-block">← Back</a>
    `));
  } catch (err) {
    return res.send(htmlTemplate(`<p class="text-red-600"> Error: ${err.message}</p>`));
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie(getCookieName("access_token"));
  res.clearCookie(getCookieName("refresh_token"));
  res.clearCookie(getCookieName("expires_at"));

  res.redirect(`${SSO_URL}/logout?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(`http://localhost:${PORT}`)}`);
});

app.listen(PORT, () => {
  console.log(` SSO Client '${CLIENT_ID}' running on http://localhost:${PORT}`);
});
