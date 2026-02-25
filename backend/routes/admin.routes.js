const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

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

// list users (admin only)
router.get("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    const users = await dbAll("SELECT id, full_name, email, role FROM users ORDER BY id DESC");
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// delete user (admin only)
router.delete("/users/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself." });
    }

    // delete related data if tables exist (safe)
    try { await dbRun("DELETE FROM applications WHERE user_id = ?", [userId]); } catch {}
    try { await dbRun("DELETE FROM resumes WHERE user_id = ?", [userId]); } catch {}

    await dbRun("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;