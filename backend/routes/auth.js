const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { audit } = require("../utils/audit");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
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

// PUBLIC: Register (NORMAL USERS => candidate)
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [String(email).toLowerCase()]);
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    const info = await dbRun(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name || null, String(email).toLowerCase(), password_hash, "candidate"]
    );

    audit({ user_id: info.lastID, action: "REGISTER", detail: { email }, ip: req.ip });

    return res.status(201).json({
      message: "User created",
      user: { id: info.lastID, full_name: full_name || null, email: String(email).toLowerCase(), role: "candidate" },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// PUBLIC: Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await dbGet("SELECT * FROM users WHERE email = ?", [String(email).toLowerCase()]);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const role = user.role || "candidate";

    const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    audit({ user_id: user.id, action: "LOGIN", detail: { email }, ip: req.ip });

    return res.json({
      message: "Login success",
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// ADMIN: List users (for UI)
router.get("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    const rows = await dbAll("SELECT id, full_name, email, role FROM users ORDER BY id DESC");
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// FR-03: Forgot password (demo returns token)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email required" });

    const user = await dbGet("SELECT id, email FROM users WHERE email = ?", [String(email).toLowerCase()]);
    if (!user) return res.json({ message: "If the email exists, a reset token was generated." });

    const resetToken = crypto.randomBytes(24).toString("hex");
    const token_hash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await dbRun(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, token_hash, expiresAt]
    );

    audit({ user_id: user.id, action: "PASSWORD_RESET_REQUEST", detail: { email }, ip: req.ip });

    return res.json({ message: "Reset token generated (demo).", resetToken, expiresAt });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// FR-03: Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "email, resetToken, newPassword required" });
    }

    const user = await dbGet("SELECT id FROM users WHERE email = ?", [String(email).toLowerCase()]);
    if (!user) return res.status(400).json({ message: "Invalid reset request" });

    const token_hash = crypto.createHash("sha256").update(resetToken).digest("hex");

    const row = await dbGet(
      `SELECT * FROM password_reset_tokens
       WHERE user_id = ? AND token_hash = ? AND used = 0
       ORDER BY id DESC LIMIT 1`,
      [user.id, token_hash]
    );

    if (!row) return res.status(400).json({ message: "Invalid or used token" });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ message: "Token expired" });

    const password_hash = await bcrypt.hash(newPassword, 10);

    await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, user.id]);
    await dbRun("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [row.id]);

    audit({ user_id: user.id, action: "PASSWORD_RESET_SUCCESS", detail: {}, ip: req.ip });

    return res.json({ message: "Password reset successful" });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// FR-04: Admin sets role (NOW includes candidate)
router.post("/set-role", auth, requireRole("admin"), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: "userId and role required" });

    const allowed = ["admin", "hr", "recruiter", "candidate"];
    if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });

    await dbRun("UPDATE users SET role = ? WHERE id = ?", [role, Number(userId)]);

    audit({ user_id: req.user.id, action: "SET_ROLE", detail: { userId, role }, ip: req.ip });

    return res.json({ message: "Role updated" });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;