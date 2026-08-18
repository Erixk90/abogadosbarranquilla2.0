import Database from "better-sqlite3";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");

export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export const generateToken = () => randomBytes(32).toString("base64url");

const defaultSessionTtlMs = Number(process.env.SESSION_TTL_HOURS || 24 * 7) * 60 * 60 * 1000;

export const createSessionStore = ({ dbPath, ttlMs = defaultSessionTtlMs } = {}) => {
  const resolvedDbPath = dbPath || process.env.SESSION_DB_PATH || path.join(dataDir, "sessions.db");
  mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

  const db = new Database(resolvedDbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = FULL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);
  db.exec("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);");

  const pruneExpired = () => {
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  };

  const createSession = (ttl = ttlMs) => {
    const token = generateToken();
    const now = Date.now();
    db.prepare(
      "INSERT INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)"
    ).run(hashToken(token), now, now + ttl);
    return token;
  };

  const getSession = (token) => {
    if (!token) return null;
    const row = db
      .prepare("SELECT token_hash FROM sessions WHERE token_hash = ? AND expires_at > ?")
      .get(hashToken(token), Date.now());
    return row || null;
  };

  const deleteSession = (token) => {
    if (!token) return;
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  };

  const clearSessions = () => {
    db.exec("DELETE FROM sessions;");
  };

  const close = () => {
    try {
      db.close();
    } catch {
      // already closed
    }
  };

  return { createSession, getSession, deleteSession, clearSessions, pruneExpired, close };
};
