import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import Joi from "joi";
import dayjs from "dayjs";
import { getPublicJWK } from "./utils/token.js";
import { db } from "./utils/db.js";
import adminRoutes from "./admin.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "./utils/token.js";
import { saveSession, getUserActiveSession } from "./utils/session.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const CORS = async (req, callback) => {
  const origin = req.header("Origin");
  try {
    const result = await db.query("SELECT domain FROM clients WHERE active = true");
    const allowedOrigins = result.rows.map(row => row.domain);
    const corsOptions = {
      origin: allowedOrigins.includes(origin),
      credentials: true
    };
    callback(null, corsOptions);
  } catch (err) {
    console.error("CORS DB Error:", err);
    callback(null, { origin: false });
  }
};

app.use(cors(CORS));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/admin", adminRoutes);

function sanitizeJwtPayload(payload) {
  const { exp, iat, nbf, jti, ...cleaned } = payload;
  return cleaned;
}

/** ----------- [1] /authorize ----------- **/
app.get("/authorize", async (req, res) => {
  const schema = Joi.object({
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    state: Joi.string().optional()
  });

  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).send(" Invalid request: " + error.message);

  const { client_id, redirect_uri, state } = value;

  const clientRes = await db.query("SELECT * FROM clients WHERE client_id = $1", [client_id]);
  const client = clientRes.rows[0];
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).send(`
      <div class="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div class="text-red-500 text-2xl mb-4"></div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Authorization Failed</h1>
          <p class="text-gray-600 mb-6">Invalid client or redirect_uri</p>
          <a href="/" class="text-blue-500 hover:text-blue-700">Return to home</a>
        </div>
      </div>
    `);
  }

  const token = req.cookies.sso_token;
  if (token) {
    try {
      const payload = verifyToken(token);
      const accessRes = await db.query(
        "SELECT 1 FROM user_clients WHERE user_id = $1 AND client_id = $2",
        [payload.user_id, client.id]
      );
      if (accessRes.rowCount === 0) {
        return res.status(403).send(`
          <div class="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
              <div class="text-red-500 text-2xl mb-4">🔒</div>
              <h1 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
              <p class="text-gray-600 mb-6">You don't have permission to access this client application</p>
              <a href="/" class="text-blue-500 hover:text-blue-700">Return to home</a>
            </div>
          </div>
        `);
      }

      const code = generateAccessToken({ user_id: payload.user_id, username: payload.username });
      return res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`);
    } catch (err) {
      res.clearCookie("sso_token");
    }
  }

  // Cek cookie akun_terdaftar
  const akunList = req.cookies.akun_terdaftar
    ? JSON.parse(req.cookies.akun_terdaftar)
    : [];

  if (akunList.length > 0) {
    const akunHTML = akunList.map(username => `
      <form method="POST" action="/login" class="mb-4">
        <input type="hidden" name="username" value="${username}" />
        <input type="hidden" name="client_id" value="${client_id}" />
        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
        <input type="hidden" name="state" value="${state || ""}" />
        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          Login as ${username}
        </button>
      </form>
    `).join("");

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Select Account</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Select Account</h1>
            <p class="text-gray-600 mt-2">Choose an account to continue</p>
          </div>
          
          <div class="mb-6">
            ${akunHTML}
          </div>
          
          <div class="text-center">
            <p class="text-gray-600 mb-4">Or login with another account</p>
            <a href="/login-form?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state || ""}" 
               class="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200">
              Manual Login
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  // Redirect ke halaman login form manual
  return res.redirect(`/login-form?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state || ""}`);
});

app.get("/login-form", (req, res) => {
  const { client_id, redirect_uri, state } = req.query;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">Login</h1>
          <p class="text-gray-600 mt-2">Enter your credentials to continue</p>
        </div>
        
        <form method="POST" action="/login" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" id="username" name="username" required 
                   class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" name="password" required 
                   class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <input type="hidden" name="client_id" value="${client_id}">
          <input type="hidden" name="redirect_uri" value="${redirect_uri}">
          <input type="hidden" name="state" value="${state || ""}">
          
          <button type="submit" 
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200">
            Sign In
          </button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/pilih-akun", async (req, res) => {
  const { username, client_id, redirect_uri, state } = req.body;

  const user = (await db.query("SELECT * FROM users WHERE username=$1", [username])).rows[0];
  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];

  if (!user || !client || client.redirect_uri !== redirect_uri) {
    return res.status(400).send("Invalid");
  }

  const allowed = await db.query("SELECT 1 FROM user_clients WHERE user_id=$1 AND client_id=$2", [user.id, client.id]);
  if (allowed.rowCount === 0) return res.status(403).send("Access denied");

  const sso_token = generateAccessToken({ user_id: user.id, username: user.username });
  res.cookie("sso_token", sso_token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 86400000
  });

  const code = generateAccessToken({ user_id: user.id, username: user.username });
  return res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`);
});


/** ----------- [2] /login ----------- **/
app.post("/login", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().optional(), // boleh kosong jika dari tombol akun
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    state: Joi.string().optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(" " + error.message);

  const { username, password, client_id, redirect_uri, state } = value;

  const user = (await db.query("SELECT * FROM users WHERE username=$1", [username])).rows[0];
  if (!user) return res.status(401).send(" User tidak ditemukan");

  // Jika password dikirim (dari form manual), cek
  if (password) {
    const bcrypt = await import("bcrypt");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send(" Password salah");
  }

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).send("Invalid client");
  }

  const allowed = await db.query("SELECT 1 FROM user_clients WHERE user_id=$1 AND client_id=$2", [user.id, client.id]);
  if (allowed.rowCount === 0) return res.status(403).send("Access denied");

  const sso_token = generateAccessToken({ user_id: user.id, username: user.username });
  const decoded = verifyToken(sso_token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  console.log(expiresIn);
  res.cookie("sso_token", sso_token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: expiresIn * 1000
  });

  // Simpan ke daftar akun_terdaftar
  let akunList = req.cookies.akun_terdaftar
    ? JSON.parse(req.cookies.akun_terdaftar)
    : [];

  if (!akunList.includes(user.username)) {
    akunList.push(user.username);
  }

  res.cookie("akun_terdaftar", JSON.stringify(akunList), {
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  // Insert log
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const agent = req.headers["user-agent"];
  await db.query(
    "INSERT INTO login_logs (user_id, client_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
    [user.id, client.id, ip, agent]
  );

  const code = generateAccessToken({ user_id: user.id, username: user.username });
  res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`);
});



/** ----------- [3] /token ----------- **/
app.post("/token", async (req, res) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { code, client_id, redirect_uri } = value;

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).json({ error: "Invalid client" });
  }

  try {
    const payload = verifyToken(code);
    const cleanPayload = sanitizeJwtPayload(payload);

    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1 AND client_id = $2", [
      cleanPayload.user_id,
      client.id
    ]);

    const access_token = generateAccessToken({ ...cleanPayload, client_id });
    const refresh_token = generateRefreshToken({ ...cleanPayload, client_id });
    const expires_at = dayjs().add(7, "days").toDate();

    await db.query(
      "INSERT INTO refresh_tokens (token, user_id, client_id, expires_at) VALUES ($1, $2, $3, $4)",
      [refresh_token, cleanPayload.user_id, client.id, expires_at]
    );
    await saveSession({
      user_id: cleanPayload.user_id,
      client_id: client.client_id,
      access_token,
      refresh_token,
      expires_at,
      user_agent: req.headers["user-agent"],
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress
    });

    res.json({
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires_in: 900
    });
  } catch {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
});

/** ----------- [4] /refresh ----------- **/
app.post("/refresh", async (req, res) => {
  const { refresh_token, client_id } = req.body;

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client) {
    return res.status(401).json({ error: "Invalid client" });
  }

  try {
    const payload = verifyToken(refresh_token);

    const check = await db.query(
      "SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()",
      [refresh_token]
    );
    if (check.rowCount === 0) {
      return res.status(401).json({ error: "Refresh token expired or invalid" });
    }

    const cleanPayload = sanitizeJwtPayload(payload);
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [refresh_token]);

    const newAccessToken = generateAccessToken({ ...cleanPayload, client_id });
    const newRefreshToken = generateRefreshToken({ ...cleanPayload, client_id });
    const expires_at = dayjs().add(7, "days").toDate();

    await db.query(
      "INSERT INTO refresh_tokens (token, user_id, client_id, expires_at) VALUES ($1, $2, $3, $4)",
      [newRefreshToken, cleanPayload.user_id, client.id, expires_at]
    );

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: 900
    });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/** ----------- [5] /userinfo ----------- **/
app.get("/userinfo", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });

  const token = auth.split(" ")[1];
  try {
    const user = verifyToken(token);
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

/** ----------- [6] /jwks ----------- **/
app.get("/.well-known/jwks.json", async (req, res) => {
  const jwk = await getPublicJWK();
  res.json({ keys: [jwk] });
});

/** ----------- [7] /logout ----------- **/
app.get("/logout", async (req, res) => {
  const client_id = req.query.client_id;
  const redirectTo = req.query.redirect_uri || "/";
  const clearAccounts = req.query.clear_accounts === "1"; //  tambahkan opsi ini

  try {
    const token = req.cookies.sso_token;
    if (token) {
      const payload = verifyToken(token);

      if (client_id) {
        const client = await db.query("SELECT id FROM clients WHERE client_id=$1", [client_id]);
        if (client.rowCount) {
          await db.query(
            "DELETE FROM refresh_tokens WHERE user_id=$1 AND client_id=$2",
            [payload.user_id, client.rows[0].id]
          );
        }
      } else {
        await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [payload.user_id]);
      }

      res.clearCookie("sso_token");

      if (clearAccounts) {
        res.clearCookie("akun_terdaftar"); // hanya dihapus jika diminta
      }
    }
  } catch (err) {
    console.error("Logout error:", err);
  }

  return res.redirect(redirectTo);
});


/** ----------- Start Server ----------- **/
app.listen(PORT, () => {
  console.log(` SSO Server running on http://localhost:${PORT}`);
});
