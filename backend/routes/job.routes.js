const router = require("express").Router();
const db = require("../db/database");

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // lastID
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// POST /jobs
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "title and description required" });
    }

    const info = await dbRun(
      "INSERT INTO jobs (title, description, required_skills) VALUES (?, ?, ?)",
      [title, description, null]
    );

    res.json({ id: info.lastID });
  } catch (e) {
    res.status(500).json({ message: "Create job failed", error: e.message });
  }
});

// GET /jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await dbAll("SELECT * FROM jobs ORDER BY id DESC");
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ message: "Fetch jobs failed", error: e.message });
  }
});

module.exports = router;
