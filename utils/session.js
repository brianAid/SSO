import { db } from "./db.js";

export async function saveSession({ user_id, client_id, access_token, refresh_token, expires_at, user_agent, ip_address }) {
  await db.query(`
    INSERT INTO sessions (user_id, client_id, access_token, refresh_token, expires_at, user_agent, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [user_id, client_id, access_token, refresh_token, expires_at, user_agent, ip_address]);
}

export async function getUserActiveSession(user_id, client_id) {
  const result = await db.query(`
    SELECT * FROM sessions
    WHERE user_id = $1 AND client_id = $2 AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  `, [user_id, client_id]);
  return result.rows[0];
}