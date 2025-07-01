import xlsx from 'xlsx';
import express from "express";
import { db } from "./utils/db.js";
import { verifyToken } from "./utils/token.js";
import upload from './utils/upload.js';
import crypto from "crypto";

const router = express.Router();

async function requireAdmin(req, res, next) {
  const token = req.cookies.sso_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = verifyToken(token);
    const userId = decoded.id;

    const userRes = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
    const role = userRes.rows[0]?.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: "Akses ditolak: hanya admin yang diizinkan" });
    }

    req.user = { ...decoded, role };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Token tidak valid" });
  }
}
router.use(requireAdmin);

/** 
 * USERS ROUTES 
 */

// Get all users with client access
router.get("/users", async (req, res) => {
  const search = req.query.search?.toLowerCase() || "";

  try {
    const userRes = await db.query(
      `SELECT * FROM users 
       WHERE LOWER(username) LIKE $1
       ORDER BY id`,
      [`%${search}%`]
    );

    const relRes = await db.query(`
      SELECT uc.user_id, c.id AS client_id, c.client_id AS client_name
      FROM user_clients uc
      JOIN clients c ON c.id = uc.client_id
      WHERE c.active = true
    `);

    const users = userRes.rows.map(user => {
      const clients = relRes.rows
        .filter(r => r.user_id === user.id)
        .map(r => ({ id: r.client_id, name: r.client_name }));

      delete user.password;
      return { ...user, clients };
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user details
router.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const [userRes, logsRes] = await Promise.all([
      db.query(`
        SELECT id, username, avatar, created_at
        FROM users WHERE id = $1
      `, [userId]),
      db.query(`
        SELECT 
          s.id AS session_id,
          s.client_id,
          c.nama AS client_name,
          s.created_at AS login_time,
          s.expires_at,
          s.revoked_at,
          s.ip_address,
          s.user_agent
        FROM sessions s
        LEFT JOIN clients c ON c.client_id = s.client_id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        LIMIT 50
      `, [userId])
    ]);

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      ...userRes.rows[0],
      login_history: logsRes.rows
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Create new user
router.post("/users", upload.single('avatar'), async (req, res) => {
  const { username, password } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : null;

  if (!username || !password) {
    if (req.file) {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const existingUser = await db.query(
      "SELECT 1 FROM users WHERE username = $1 LIMIT 1",
      [username]
    );

    if (existingUser.rowCount > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('BEGIN');
    const result = await db.query(
      `INSERT INTO users (username, password, avatar)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [username, hashedPassword, avatar]
    );
    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        username,
        avatar_url: avatar,
        created_at: result.rows[0].created_at
      }
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Error creating user:", err);

    if (req.file) {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to create user",
      details: err.message
    });
  }
});

// Import users from Excel
router.post('/import-users', upload.single('excel_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Excel file is required" });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await db.query('BEGIN');
    await db.query('TRUNCATE TABLE temp_user_excel');

    for (const row of data) {
      await db.query(
        `INSERT INTO temp_user_excel (id, username) 
         VALUES ($1, $2) 
         ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username`,
        [row.id, row.username]
      );
    }

    await db.query('COMMIT');
    res.json({ message: "Data imported successfully", total_rows: data.length });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Import error:", err);
    res.status(500).json({ error: "Failed to import data" });
  }
});

// Get temporary users
router.get("/user-temp", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM temp_user_excel ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching temp users:", err);
    res.status(500).json({ error: "Failed to fetch temporary users" });
  }
});

// Create user-client relationships
router.post("/user-client", async (req, res) => {
  const { client_id, user_id, user_id_relasi } = req.body;
  const client = await db.connect();

  if (!client_id || !user_id || !user_id_relasi) {
    client.release();
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await client.query("BEGIN");
    const clientId = parseInt(client_id);

    const userIds = Array.isArray(user_id) ? user_id :
      typeof user_id === "string" ? user_id.split(",").map(s => s.trim()) :
        [user_id];

    const relasiIds = Array.isArray(user_id_relasi) ? user_id_relasi :
      typeof user_id_relasi === "string" ? user_id_relasi.split(",").map(s => s.trim()) :
        [user_id_relasi];

    if (userIds.length !== relasiIds.length) {
      throw new Error("user_id and user_id_relasi count mismatch");
    }

    const userIdsInt = userIds.map(id => {
      const num = parseInt(id);
      if (isNaN(num)) throw new Error(`Invalid user_id: ${id}`);
      return num;
    });

    const relasiIdsInt = relasiIds.map(id => {
      const num = parseInt(id);
      if (isNaN(num)) throw new Error(`Invalid user_id_relasi: ${id}`);
      return num;
    });

    if (isNaN(clientId)) throw new Error(`Invalid client_id: ${client_id}`);

    for (let i = 0; i < userIdsInt.length; i++) {
      await client.query(
        `INSERT INTO user_clients (user_id, client_id, user_id_relasi)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, client_id) DO NOTHING`,
        [userIdsInt[i], clientId, relasiIdsInt[i]]
      );
    }

    if (relasiIdsInt.length > 0) {
      const placeholders = relasiIdsInt.map((_, i) => `$${i + 1}`).join(',');
      await client.query(
        `DELETE FROM temp_user_excel WHERE id IN (${placeholders})`,
        relasiIdsInt
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: `${userIdsInt.length} relationships created`,
      data: { client_id: clientId, total_relations: userIdsInt.length }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err);

    const statusCode = err.message.includes('valid') ? 400 : 500;
    res.status(statusCode).json({
      error: "Failed to create relationships",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
});

/** 
 * CLIENTS ROUTES 
 */

// Get all clients
router.get("/clients", async (req, res) => {
  const search = req.query.search?.toLowerCase() || "";

  try {
    const [clientsRes, sessionsRes] = await Promise.all([
      db.query(
        `SELECT id, client_id, nama, domain, logo 
         FROM clients 
         WHERE LOWER(client_id) LIKE $1 
            OR LOWER(nama) LIKE $1 
            OR LOWER(domain) LIKE $1
         ORDER BY id`,
        [`%${search}%`]
      ),
      db.query(`
        SELECT DISTINCT ON (s.client_id, s.user_id)
          s.client_id,
          s.user_id,
          u.username,
          u.avatar
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.revoked_at IS NULL AND s.expires_at > NOW()
      `)
    ]);

    const grouped = {};
    sessionsRes.rows.forEach(row => {
      if (!grouped[row.client_id]) grouped[row.client_id] = [];
      grouped[row.client_id].push({
        user_id: row.user_id,
        username: row.username,
        avatar_url: row.avatar
      });
    });

    const data = clientsRes.rows.map(client => ({
      client_id: client.client_id,
      nama: client.nama,
      domain: client.domain,
      logo_url: client.logo,
      user_active: grouped[client.client_id] || []
    }));

    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Get client details
router.get("/clients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const [clientRes, userAccessRes, activeUserRes] = await Promise.all([
      db.query(`
        SELECT id, client_id, nama, domain, logo, redirect_uri, active, created_at
        FROM clients WHERE id = $1
      `, [id]),
      db.query(`
        SELECT u.id, u.username, u.avatar
        FROM user_clients uc
        JOIN users u ON u.id = uc.user_id
        WHERE uc.client_id = $1
      `, [id]),
      db.query(`
        SELECT DISTINCT ON (s.user_id)
          s.id AS session_id,
          s.user_id,
          u.username,
          u.avatar,
          s.created_at AS login_time,
          s.expires_at,
          s.ip_address,
          s.user_agent
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.client_id = $1
          AND s.revoked_at IS NULL
          AND s.expires_at > NOW()
        ORDER BY s.user_id, s.created_at DESC
      `, [id])
    ]);

    if (clientRes.rowCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      ...clientRes.rows[0],
      user_access: userAccessRes.rows,
      user_active: activeUserRes.rows
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch client details" });
  }
});

// Create new client
router.post("/clients", upload.single('logo'), async (req, res) => {
  const { nama, domain, redirect_uri, active = true } = req.body;
  const logo = req.file ? `/uploads/${req.file.filename}` : null;
  const client_id = crypto.randomBytes(8).toString('hex');

  if (!nama || !domain || !redirect_uri) {
    if (req.file) {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    const existingClient = await db.query(
      "SELECT 1 FROM clients WHERE domain = $1 LIMIT 1",
      [domain]
    );

    if (existingClient.rowCount > 0) {
      return res.status(400).json({ error: "Domain already registered" });
    }

    const cleanRedirectUri = redirect_uri.replace(/^"+|"+$/g, '');
    const result = await db.query(
      `INSERT INTO clients 
       (nama, domain, client_id, redirect_uri, active, logo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [nama, domain, client_id, cleanRedirectUri, active, logo]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        client_id,
        nama,
        domain,
        redirect_uri: cleanRedirectUri,
        active,
        logo_url: logo,
        created_at: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error("Error:", err);

    if (req.file) {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to create client",
      details: err.message
    });
  }
});

// Dashboard stats
router.get("/stats", async (_, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      activeUsers,
      loginsToday,
      weekly,
      monthly
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*) FROM clients`),
      db.query(`
        SELECT COUNT(DISTINCT user_id)
        FROM refresh_tokens
        WHERE expires_at > NOW()
      `),
      db.query(`
        SELECT COUNT(*) FROM login_logs
        WHERE DATE(logged_in_at) = CURRENT_DATE
      `),
      db.query(`
        SELECT TO_CHAR(logged_in_at, 'YYYY-MM-DD') AS date, COUNT(*) AS logins
        FROM login_logs
        WHERE logged_in_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY date
        ORDER BY date
      `),
      db.query(`
        SELECT TO_CHAR(logged_in_at, 'YYYY-MM') AS month, COUNT(*) AS logins
        FROM login_logs
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `)
    ]);

    res.json({
      total_users: Number(totalUsers.rows[0].count),
      total_clients: Number(totalClients.rows[0].count),
      active_users: Number(activeUsers.rows[0].count),
      logins_today: Number(loginsToday.rows[0].count),
      logins_weekly: weekly.rows,
      logins_monthly: monthly.rows
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;