import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path"; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

const SSO_URL = "http://localhost:3000";
const CLIENT_ID = "app1";
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const STATE = "xyz123";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Serve client.js statically
app.use('/client.js', express.static(path.join(__dirname, 'client.js')));


function getCookieName(name) {
  return `${name}_${CLIENT_ID}`;
}

// Helper function to set cookies with appropriate options
const setAuthCookies = (res, data) => {
  const expiresAt = Date.now() + data.expires_in * 1000;
  const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie(getCookieName("access_token"), data.access_token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: data.expires_in * 1000 // Max age for access token (15 minutes)
  });
  res.cookie(getCookieName("refresh_token"), data.refresh_token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: refreshTokenMaxAge // Max age for refresh token (7 days)
  });
  res.cookie(getCookieName("expires_at"), expiresAt, {
    sameSite: "Lax",
    maxAge: refreshTokenMaxAge // expires_at should persist as long as refresh_token
  });
};


const htmlTemplate = (content) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSO Client: ${CLIENT_ID}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/client.js"></script>
  <script>
    // Pastikan fungsi startTokenAutoRefresh tersedia di global scope setelah client.js dimuat
    window.onload = () => {
      if (typeof startTokenAutoRefresh === 'function') {
        startTokenAutoRefresh("${CLIENT_ID}");
      } else {
        console.error("startTokenAutoRefresh function not found after client.js load.");
      }
    };
  </script>

</head >
  <body class="bg-gray-50 min-h-screen font-sans">
    <div class="max-w-xl mx-auto py-10 px-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 class="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">🔐 SSO Client: ${CLIENT_ID}</h1>
      ${content}
    </div>
  </body>
</html >
  `;

app.get("/", async (req, res) => {
  let access_token = req.cookies[getCookieName("access_token")];
  let refresh_token = req.cookies[getCookieName("refresh_token")];
  const expires_at = req.cookies[getCookieName("expires_at")];

  // Attempt to refresh token if access_token is missing but refresh_token exists
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
        setAuthCookies(res, newData); // Use helper to set new cookies
        return res.redirect("/"); // Redirect to apply new cookies
      } else {
        console.error("Failed to refresh token during initial load:", newData.error);
        // If refresh failed, clear all cookies and redirect to login
        res.clearCookie(getCookieName("access_token"));
        res.clearCookie(getCookieName("refresh_token"));
        res.clearCookie(getCookieName("expires_at"));
        const loginURL = `${SSO_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
        return res.send(
          htmlTemplate(`
            <p class="text-red-600 mb-4">Sesi Anda telah berakhir. Silakan login kembali.</p>
            <a href="${loginURL}" class="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition duration-300">
              🔑 Login with SSO
            </a>
          `)
        );
      }
    } catch (e) {
      console.error("Error during initial refresh attempt:", e.message);
      // Clear cookies on network error during refresh
      res.clearCookie(getCookieName("access_token"));
      res.clearCookie(getCookieName("refresh_token"));
      res.clearCookie(getCookieName("expires_at"));
      const loginURL = `${SSO_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
      return res.send(
        htmlTemplate(`
          <p class="text-red-600 mb-4">Terjadi kesalahan saat mencoba memperbarui sesi Anda. Silakan coba login kembali.</p>
          <a href="${loginURL}" class="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition duration-300">
            🔑 Login with SSO
          </a>
        `)
      );
    }
  }

  // If no access token (and no successful refresh), show login button
  if (!access_token) {
    const loginURL = `${SSO_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
    return res.send(
      htmlTemplate(`
        <a href="${loginURL}" class="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition duration-300">
          🔑 Login with SSO
        </a>
      `)
    );
  }

  // If access token exists, show session info and buttons
  const content = `
    <div class="space-y-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
        <h2 class="font-semibold text-lg text-green-800 mb-2">Session Info</h2>
        <p class="text-gray-700"><b>Access Token:</b> <span class="break-all">${access_token.slice(0, 20)}...${access_token.slice(-20)}</span></p>
        <p class="text-gray-700"><b>Expires At:</b> <span id="expires_at_display">${expires_at ? new Date(Number(expires_at)).toLocaleString() : "?"}</span></p>
        <p class="text-gray-700"><b>Refresh Token:</b> <span class="break-all">${refresh_token ? refresh_token.slice(0, 20) + '...' + refresh_token.slice(-20) : 'N/A'}</span></p>
      </div>
      <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <form action="/userinfo" method="GET" class="w-full sm:w-auto">
          <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            User Info
          </button>
        </form>
        <form action="/logout" method="POST" class="w-full sm:w-auto">
          <button type="submit" class="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
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

    setAuthCookies(res, data); // Use helper to set new cookies

    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.send(htmlTemplate(`<p class="text-red-600"> Failed: ${err.message}</p>`));
  }
});

app.post("/refresh-token", async (req, res) => {
  const refresh_token = req.cookies[getCookieName("refresh_token")];
  if (!refresh_token) {
    console.warn("No refresh token found for /refresh-token endpoint.");
    return res.status(401).json({ error: "No refresh token" });
  }

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
    if (!data.access_token) {
      console.error("Invalid refresh token response from SSO:", data.error);
      // Clear cookies if refresh token is invalid/expired on SSO server
      res.clearCookie(getCookieName("access_token"));
      res.clearCookie(getCookieName("refresh_token"));
      res.clearCookie(getCookieName("expires_at"));
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    setAuthCookies(res, data); // Use helper to set new cookies

    return res.json({ refreshed: true, expires_in: data.expires_in });
  } catch (e) {
    console.error("Error during /refresh-token endpoint processing:", e.message);
    // Clear cookies on network error
    res.clearCookie(getCookieName("access_token"));
    res.clearCookie(getCookieName("refresh_token"));
    res.clearCookie(getCookieName("expires_at"));
    return res.status(500).json({ error: e.message });
  }
});

app.get("/userinfo", async (req, res) => {
  const access_token = req.cookies[getCookieName("access_token")];
  if (!access_token) {
    // If access token is missing, try to refresh or redirect to login
    const refresh_token = req.cookies[getCookieName("refresh_token")];
    if (refresh_token) {
      // Attempt to refresh, then redirect to /userinfo again
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
          setAuthCookies(res, newData);
          return res.redirect("/userinfo"); // Redirect back to userinfo with new token
        }
      } catch (e) {
        console.error("Failed to refresh token for userinfo:", e.message);
      }
    }
    // If no refresh token or refresh failed, redirect to login
    return res.redirect("/");
  }

  try {
    const resp = await fetch(`${SSO_URL}/userinfo`, {
      headers: { Authorization: "Bearer " + access_token }
    });
    const user = await resp.json();

    // Update expires_at display on page for real-time accuracy
    const expires_at_cookie = req.cookies[getCookieName("expires_at")];
    const expires_at_display = expires_at_cookie ? new Date(Number(expires_at_cookie)).toLocaleString() : "?";

    return res.send(htmlTemplate(`
      <h2 class="text-xl font-bold mb-2 text-gray-800">👤 User Info</h2>
      <div class="bg-gray-100 p-4 rounded-lg shadow-inner mb-4">
        <pre class="text-gray-700 whitespace-pre-wrap break-all">${JSON.stringify(user, null, 2)}</pre>
      </div>
      <p class="text-sm text-gray-600 mb-4">Access Token Expires At: <span id="expires_at_display_userinfo">${expires_at_display}</span></p>
      <a href="/" class="text-blue-600 hover:underline mt-4 inline-block flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Home
      </a>
    `));
  } catch (err) {
    console.error("Error fetching userinfo:", err);
    // If userinfo fetch fails, it might be due to an expired access token
    // The client-side auto-refresh should handle this, but as a fallback,
    // we can redirect to home which will trigger a refresh attempt.
    return res.redirect("/");
  }
});

app.post("/logout", (req, res) => {
  // Clear all cookies related to this client application
  res.clearCookie(getCookieName("access_token"));
  res.clearCookie(getCookieName("refresh_token"));
  res.clearCookie(getCookieName("expires_at"));

  // Redirect to SSO logout endpoint to clear SSO session
  res.redirect(`${SSO_URL}/logout?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(`http://localhost:${PORT}`)}`);
});

app.listen(PORT, () => {
  console.log(` SSO Client '${CLIENT_ID}' running on http://localhost:${PORT}`);
});
