import express from "express";
import { db } from "./utils/db.js";
import { verifyAccessToken } from "./utils/token.js";

const router = express.Router();

// Middleware login
function requireLogin(req, res, next) {
  const token = req.cookies.sso_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.use(requireLogin);

/** ---------- USERS ---------- **/

// Get all users + client akses
router.get("/users", async (_, res) => {
  try {
    const userRes = await db.query("SELECT * FROM users ORDER BY id");
    const users = userRes.rows;

    const relRes = await db.query(`
      SELECT uc.user_id, c.id AS client_id, c.client_id AS client_name
      FROM user_clients uc
      JOIN clients c ON c.id = uc.client_id
    `);

    const userWithClients = users.map(user => {
      const clients = relRes.rows
        .filter(r => r.user_id === user.id)
        .map(r => ({ id: r.client_id, name: r.client_name }));

      delete user.password; // sembunyikan hash
      return { ...user, clients };
    });

    res.json(userWithClients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil data user" });
  }
});

// Insert user + relasi ke client
router.post("/users", async (req, res) => {
  const { username, password, client_ids = [] } = req.body;

  try {
    const bcrypt = await import("bcrypt");
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashed]
    );

    const user_id = result.rows[0].id;

    for (const client_id of client_ids) {
      await db.query("INSERT INTO user_clients (user_id, client_id) VALUES ($1, $2)", [user_id, client_id]);
    }

    res.json({ message: "User created", user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambahkan user" });
  }
});

/** ---------- CLIENTS ---------- **/

// Get all clients
router.get("/clients", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM clients ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil client" });
  }
});

// Insert client
router.post("/clients", async (req, res) => {
  const { domain, client_id, client_secret, redirect_uri, active } = req.body;

  try {
    await db.query(
      `INSERT INTO clients (domain, client_id, client_secret, redirect_uri, active)
       VALUES ($1, $2, $3, $4, $5)`,
      [domain, client_id, client_secret, redirect_uri, active]
    );

    res.json({ message: "Client created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambahkan client" });
  }
});

export default router;
