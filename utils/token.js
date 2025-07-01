import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { importSPKI, exportJWK } from "jose";

dotenv.config();

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8");

export function generateAccessToken(payload) {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "15m"
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d"
  });
}

export function verifyToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"]
  });
}

export async function getPublicJWK() {
  const key = await importSPKI(publicKey, "RS256");
  const jwk = await exportJWK(key);

  return {
    ...jwk,
    use: "sig",
    kid: "sso-key-1",
    alg: "RS256"
  };
}