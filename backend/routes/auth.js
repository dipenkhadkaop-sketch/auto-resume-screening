const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ✅ PUBLIC: /auth/register (NO TOKEN)
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    const info = await dbRun(
      "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
      [full_name || null, email, password_hash]
    );

    return res.status(201).json({
      message: "User created",
      user: { id: info.lastID, full_name: full_name || null, email },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// ✅ PUBLIC: /auth/login (NO TOKEN)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login success",
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;
