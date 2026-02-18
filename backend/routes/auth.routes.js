const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const stmt = db.prepare(`
        INSERT INTO users (username, email, passwordHash, role, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      const info = stmt.run(username, email, passwordHash, "user", new Date().toISOString());

      return res.json({
        id: info.lastInsertRowid,
        message: "Account created"
      });
    } catch (err) {
      if (String(err.message).includes("UNIQUE")) {
        return res.status(409).json({ error: "User already exists" });
      }
      return res.status(500).json({ error: "DB error", detail: err.message });
    }
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET missing in backend .env" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
});

module.exports = router;
