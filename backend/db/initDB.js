const db = require("./database");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  originalName TEXT NOT NULL,
  textContent TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jobId INTEGER NOT NULL,
  resumeId INTEGER NOT NULL,
  score REAL NOT NULL,
  scorePercent REAL NOT NULL,
  topTerms TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(jobId) REFERENCES jobs(id),
  FOREIGN KEY(resumeId) REFERENCES resumes(id)
);
`);

console.log("✅ DB initialized");
