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
  verifyAccessToken,
  verifyRefreshToken
} from "./utils/token.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// CORS dinamis dari database (clients.domain)
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

// Middleware
app.use(cors(CORS));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/admin", adminRoutes);

// Bersihkan properti JWT payload
function sanitizeJwtPayload(payload) {
  const { exp, iat, nbf, jti, ...cleaned } = payload;
  return cleaned;
}

/** ------------------ [1] /authorize ------------------ **/
app.get("/authorize", async (req, res) => {
  const schema = Joi.object({
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    state: Joi.string().optional()
  });

  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).send("❌ Invalid request: " + error.message);

  const { client_id, redirect_uri, state } = value;

  const clientRes = await db.query("SELECT * FROM clients WHERE client_id = $1", [client_id]);
  const client = clientRes.rows[0];
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).send("❌ Invalid client or redirect_uri");
  }

  const token = req.cookies.sso_token;
  if (token) {
    try {
      const payload = verifyAccessToken(token);

      const accessRes = await db.query(
        "SELECT 1 FROM user_clients WHERE user_id = $1 AND client_id = $2",
        [payload.user_id, client.id]
      );
      if (accessRes.rowCount === 0) {
        return res.status(403).send("❌ Access denied for this client");
      }

      const code = generateAccessToken({ user_id: payload.user_id, username: payload.username });
      return res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`);
    } catch (err) {
      res.clearCookie("sso_token");
    }
  }

  res.send(`
    <form method="POST" action="/login">
      <input name="username" placeholder="username" required />
      <input name="password" type="password" required />
      <input type="hidden" name="client_id" value="${client_id}" />
      <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
      <input type="hidden" name="state" value="${state || ""}" />
      <button>Login</button>
    </form>
  `);
});

/** ------------------ [2] /login ------------------ **/
app.post("/login", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    state: Joi.string().optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.message);

  const { username, password, client_id, redirect_uri, state } = value;

  const user = (await db.query("SELECT * FROM users WHERE username=$1", [username])).rows[0];
  if (!user) return res.status(401).send("Invalid credentials");

  const bcrypt = await import("bcrypt");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("Invalid credentials");

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).send("Invalid client or redirect_uri");
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

  // Simpan log login
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const agent = req.headers["user-agent"];
  await db.query(
    "INSERT INTO login_logs (user_id, client_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
    [user.id, client.id, ip, agent]
  );

  const code = generateAccessToken({ user_id: user.id, username: user.username });
  res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`);
});

/** ------------------ [3] /token ------------------ **/
app.post("/token", async (req, res) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    client_id: Joi.string().required(),
    client_secret: Joi.string().required(),
    redirect_uri: Joi.string().uri().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { code, client_id, client_secret, redirect_uri } = value;

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client || client.client_secret !== client_secret || client.redirect_uri !== redirect_uri) {
    return res.status(400).json({ error: "Invalid client" });
  }
  console.log("Received client_id:", client_id);
  console.log("Received client_secret:", client_secret);
  console.log("Expected secret:", client?.client_secret);
  console.log("Received redirect_uri:", redirect_uri);
  console.log("Expected redirect_uri:", client?.redirect_uri);


  try {
    const payload = verifyAccessToken(code);
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

    res.json({
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires_in: 900
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }
});

/** ------------------ [4] /refresh ------------------ **/
app.post("/refresh", async (req, res) => {
  const { refresh_token, client_id, client_secret } = req.body;

  const client = (await db.query("SELECT * FROM clients WHERE client_id=$1", [client_id])).rows[0];
  if (!client || client.client_secret !== client_secret) {
    return res.status(401).json({ error: "Invalid client" });
  }

  try {
    const payload = verifyRefreshToken(refresh_token);

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
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/** ------------------ [5] /userinfo ------------------ **/
app.get("/userinfo", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });

  const token = auth.split(" ")[1];
  try {
    const user = verifyAccessToken(token);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

/** ------------------ [6] /.well-known/jwks.json ------------------ **/
app.get("/.well-known/jwks.json", async (req, res) => {
  const jwk = await getPublicJWK();
  res.json({ keys: [jwk] });
});

/** ------------------ [7] /logout ------------------ **/
app.get("/logout", async (req, res) => {
  const client_id = req.query.client_id;
  const redirectTo = req.query.redirect_uri || "/";

  try {
    const token = req.cookies.sso_token;
    if (token) {
      const payload = verifyAccessToken(token);

      if (client_id) {
        // hanya hapus refresh token untuk client_id tertentu
        const client = await db.query("SELECT id FROM clients WHERE client_id=$1", [client_id]);
        if (client.rowCount) {
          await db.query(
            "DELETE FROM refresh_tokens WHERE user_id=$1 AND client_id=$2",
            [payload.user_id, client.rows[0].id]
          );
        }
        // **tidak** clearCookie di sini
      } else {
        // global logout: hapus semua dan clear cookie
        await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [payload.user_id]);
        res.clearCookie("sso_token");
      }
    }
  } catch (err) {
    console.error("Logout error:", err);
    // jangan clearCookie jika hanya client logout
  }

  return res.redirect(redirectTo);
});


/** ------------------ Start Server ------------------ **/
app.listen(PORT, () => {
  console.log(`✅ SSO Server running on http://localhost:${PORT}`);
});
