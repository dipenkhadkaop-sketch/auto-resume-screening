// backend/routes/job.routes.js
const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { audit } = require("../utils/audit");

// Create Job (admin/hr/recruiter)
router.post("/", auth, requireRole("admin", "hr", "recruiter"), (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) return res.status(400).json({ message: "title and description required" });

  db.run(
    "INSERT INTO jobs (title, description, created_at) VALUES (?, ?, ?)",
    [title, description, new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });

      audit({ user_id: req.user.id, action: "CREATE_JOB", detail: { jobId: this.lastID, title }, ip: req.ip });

      res.json({ id: this.lastID });
    }
  );
});

// Edit Job (admin/hr/recruiter)
router.put("/:id", auth, requireRole("admin", "hr", "recruiter"), (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;

  if (!id) return res.status(400).json({ message: "invalid id" });
  if (!title || !description) return res.status(400).json({ message: "title and description required" });

  db.run(
    "UPDATE jobs SET title = ?, description = ? WHERE id = ?",
    [title, description, id],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });

      audit({ user_id: req.user.id, action: "EDIT_JOB", detail: { jobId: id, title }, ip: req.ip });

      res.json({ message: "Job updated", id });
    }
  );
});

// List Jobs (public)
router.get("/", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json(rows);
  });
});

module.exports = router;