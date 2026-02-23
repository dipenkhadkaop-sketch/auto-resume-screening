// backend/routes/feedback.routes.js
const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { audit } = require("../utils/audit");

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// Create feedback (admin/hr/recruiter)
router.post("/", auth, requireRole("admin", "hr", "recruiter"), async (req, res) => {
  try {
    const { resume_id, job_id, feedback_text } = req.body;
    if (!resume_id || !job_id || !feedback_text) {
      return res.status(400).json({ message: "resume_id, job_id, feedback_text required" });
    }

    const info = await dbRun(
      "INSERT INTO feedback (resume_id, job_id, feedback_text, created_by) VALUES (?, ?, ?, ?)",
      [Number(resume_id), Number(job_id), String(feedback_text), req.user.id]
    );

    audit({ user_id: req.user.id, action: "CREATE_FEEDBACK", detail: { resume_id, job_id }, ip: req.ip });

    return res.json({ message: "Feedback created", id: info.lastID });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// List feedback by resume id
router.get("/resume/:resumeId", auth, async (req, res) => {
  try {
    const resumeId = Number(req.params.resumeId);
    const rows = await dbAll("SELECT * FROM feedback WHERE resume_id = ? ORDER BY id DESC", [resumeId]);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;