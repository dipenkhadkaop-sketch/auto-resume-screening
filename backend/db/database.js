const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "database.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("❌ DB connection error:", err.message);
  else console.log("✅ Connected to SQLite:", DB_PATH);
});

db.serialize(() => {
  // Users table (auth + RBAC)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'recruiter',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Jobs table
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      required_skills TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Resumes table (IMPORTANT: correct columns)
  db.run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_name TEXT,
      file_type TEXT,
      stored_name TEXT,
      text_content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Rankings table
  db.run(`
    CREATE TABLE IF NOT EXISTS rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      resume_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      score_percent INTEGER NOT NULL,
      top_terms TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    )
  `);

  // Password reset tokens (demo-friendly reset)
  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Audit logs
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      detail TEXT,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
});

module.exports = db;
