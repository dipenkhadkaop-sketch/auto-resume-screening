const router = require("express").Router();
const db = require("../db/database");

// Create a new job
router.post("/create", (req, res) => {
  const { title, description, required_skills } = req.body;

  if (!title || !description || !required_skills) {
    return res.status(400).json({ message: "title, description, required_skills are required." });
  }

  db.run(
    `INSERT INTO jobs (title, description, required_skills)
     VALUES (?, ?, ?)`,
    [title, description, required_skills],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });

      res.json({
        message: "Job created",
        job_id: this.lastID,
      });
    }
  );
});

// Get all jobs
router.get("/all", (req, res) => {
  db.all(`SELECT * FROM jobs ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json(rows);
  });
});

module.exports = router;
