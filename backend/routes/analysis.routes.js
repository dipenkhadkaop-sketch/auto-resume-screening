const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const { audit } = require("../utils/audit");

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

router.post("/rank", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId required" });

    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [Number(jobId)]);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const resumes = await dbAll("SELECT * FROM resumes WHERE user_id = ?", [req.user.id]);
    if (!resumes.length) return res.status(400).json({ message: "No resumes uploaded" });

    await dbRun("DELETE FROM rankings WHERE job_id = ?", [Number(jobId)]);

    for (const r of resumes) {
      const s = scoreSimple(job.description, r.text_content);
      await dbRun(
        `INSERT INTO rankings (job_id, resume_id, score, score_percent, top_terms)
         VALUES (?, ?, ?, ?, ?)`,
        [Number(jobId), r.id, s.score, s.scorePercent, JSON.stringify(s.topTerms)]
      );
    }

    const results = resumes
      .map((r) => {
        const s = scoreSimple(job.description, r.text_content);
        return { resumeId: r.id, resumeName: r.original_name, scorePercent: s.scorePercent, topTerms: s.topTerms };
      })
      .sort((a, b) => b.scorePercent - a.scorePercent);

    audit({ user_id: req.user.id, action: "RANK_RESUMES", detail: { jobId: Number(jobId) }, ip: req.ip });

    res.json({ jobId: Number(jobId), results });
  } catch (e) {
    res.status(500).json({ message: "Rank failed", error: e.message });
  }
});

router.get("/rankings/:jobId", auth, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);

    const rows = await dbAll(
      `
      SELECT rankings.*, resumes.original_name AS resumeName, resumes.user_id AS ownerId
      FROM rankings
      JOIN resumes ON resumes.id = rankings.resume_id
      WHERE rankings.job_id = ?
      ORDER BY rankings.score_percent DESC
      `,
      [jobId]
    );

    const filtered = rows.filter((r) => r.ownerId === req.user.id);

    res.json(
      filtered.map((r) => ({
        resumeId: r.resume_id,
        resumeName: r.resumeName,
        scorePercent: r.score_percent,
        topTerms: r.top_terms ? JSON.parse(r.top_terms) : [],
      }))
    );
  } catch (e) {
    res.status(500).json({ message: "Fetch rankings failed", error: e.message });
  }
});

module.exports = router;
