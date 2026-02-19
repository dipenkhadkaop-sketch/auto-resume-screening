const router = require("express").Router();
const db = require("../db/database");
const authMiddleware = require("../middleware/auth"); // optional but recommended

// Simple scoring
function scoreSimple(jobText, resumeText) {
  const job = (jobText || "").toLowerCase();
  const res = (resumeText || "").toLowerCase();

  const terms = Array.from(new Set(job.split(/[^a-z0-9]+/).filter((w) => w.length > 2)));

  let hit = 0;
  const topTerms = [];

  for (const t of terms) {
    if (res.includes(t)) {
      hit++;
      if (topTerms.length < 10) topTerms.push({ term: t, weight: 1 });
    }
  }

  const scorePercent = terms.length ? Math.round((hit / terms.length) * 100) : 0;
  return { score: hit, scorePercent, topTerms };
}

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

// POST /analysis/rank
router.post("/rank", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId required" });

    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [Number(jobId)]);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only rank resumes owned by logged-in user
    const userId = req.user.id;
    const resumes = await dbAll("SELECT * FROM resumes WHERE user_id = ?", [userId]);
    if (!resumes.length) return res.status(400).json({ message: "No resumes uploaded" });

    await dbRun("DELETE FROM rankings WHERE job_id = ?", [Number(jobId)]);

    // Insert rankings
    for (const r of resumes) {
      const s = scoreSimple(job.description, r.text_content);

      await dbRun(
        `INSERT INTO rankings (job_id, resume_id, score, score_percent, top_terms)
         VALUES (?, ?, ?, ?, ?)`,
        [Number(jobId), r.id, s.score, s.scorePercent, JSON.stringify(s.topTerms)]
      );
    }

    // Return results sorted
    const results = resumes
      .map((r) => {
        const s = scoreSimple(job.description, r.text_content);
        return {
          resumeId: r.id,
          resumeName: r.original_name,
          scorePercent: s.scorePercent,
          topTerms: s.topTerms,
        };
      })
      .sort((a, b) => b.scorePercent - a.scorePercent);

    res.json({ jobId: Number(jobId), results });
  } catch (e) {
    res.status(500).json({ message: "Rank failed", error: e.message });
  }
});

// GET /analysis/rankings/:jobId
router.get("/rankings/:jobId", authMiddleware, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const userId = req.user.id;

    const rows = await dbAll(
      `
      SELECT rankings.*, resumes.original_name AS resumeName
      FROM rankings
      JOIN resumes ON resumes.id = rankings.resume_id
      WHERE rankings.job_id = ? AND resumes.user_id = ?
      ORDER BY rankings.score_percent DESC
      `,
      [jobId, userId]
    );

    const formatted = rows.map((r) => ({
      resumeId: r.resume_id,
      resumeName: r.resumeName,
      scorePercent: r.score_percent,
      topTerms: r.top_terms ? JSON.parse(r.top_terms) : [],
    }));

    res.json(formatted);
  } catch (e) {
    res.status(500).json({ message: "Fetch rankings failed", error: e.message });
  }
});

module.exports = router;
