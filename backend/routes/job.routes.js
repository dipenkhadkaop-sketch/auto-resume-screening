const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

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

// Helper: check open jobs (closing_date is NULL or >= today)
const OPEN_JOB_WHERE = `(closing_date IS NULL OR date(closing_date) >= date('now'))`;

/**
 * PUBLIC: list OPEN job ads only
 */
router.get("/", async (req, res) => {
  try {
    const jobs = await dbAll(
      `SELECT id, title, company, location, description, requirements, closing_date, created_at
       FROM jobs
       WHERE ${OPEN_JOB_WHERE}
       ORDER BY id DESC`
    );
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * PUBLIC: view job (includes closed too)
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [id]);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * ADMIN/RECRUITER: create job
 * Body: { title, company, location, description, requirements, closing_date }
 */
router.post("/", auth, requireRole("admin", "recruiter", "hr"), async (req, res) => {
  try {
    const { title, company, location, description, requirements, closing_date } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    // Optional validation: closing date must be today or future if provided
    if (closing_date) {
      const cd = new Date(closing_date);
      if (Number.isNaN(cd.getTime())) {
        return res.status(400).json({ message: "closing_date must be a valid date (YYYY-MM-DD)" });
      }
    }

    const r = await dbRun(
      `INSERT INTO jobs (title, company, location, description, requirements, closing_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        (company || "").trim(),
        (location || "").trim(),
        description.trim(),
        (requirements || "").trim(),
        closing_date || null,
        req.user.id,
      ]
    );

    res.json({ message: "Job created", job_id: r.lastID });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * ADMIN/RECRUITER: update job
 */
router.put("/:id", auth, requireRole("admin", "recruiter", "hr"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, company, location, description, requirements, closing_date } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const exists = await dbGet("SELECT id FROM jobs WHERE id = ?", [id]);
    if (!exists) return res.status(404).json({ message: "Job not found" });

    await dbRun(
      `UPDATE jobs
       SET title=?, company=?, location=?, description=?, requirements=?, closing_date=?
       WHERE id=?`,
      [
        title.trim(),
        (company || "").trim(),
        (location || "").trim(),
        description.trim(),
        (requirements || "").trim(),
        closing_date || null,
        id,
      ]
    );

    res.json({ message: "Job updated" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * ADMIN/RECRUITER: delete job
 */
router.delete("/:id", auth, requireRole("admin", "recruiter", "hr"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await dbRun("DELETE FROM jobs WHERE id = ?", [id]);
    res.json({ message: "Job deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;