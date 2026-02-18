const router = require("express").Router();
const db = require("../db/database");

// Simple scoring (works, no extra service needed)
function scoreSimple(jobText, resumeText) {
  const job = (jobText || "").toLowerCase();
  const res = (resumeText || "").toLowerCase();

  const terms = Array.from(
    new Set(job.split(/[^a-z0-9]+/).filter(w => w.length > 2))
  );

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

router.post("/rank", (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId required" });

    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(Number(jobId));
    if (!job) return res.status(404).json({ error: "Job not found" });

    const resumes = db.prepare("SELECT * FROM resumes").all();
    if (!resumes.length) return res.status(400).json({ error: "No resumes uploaded" });

    db.prepare("DELETE FROM rankings WHERE job_id = ?").run(Number(jobId));

    const insert = db.prepare(`
      INSERT INTO rankings (job_id, resume_id, score, score_percent, top_terms, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const results = resumes.map(r => {
      const s = scoreSimple(job.description, r.text_content);
      insert.run(
        Number(jobId),
        r.id,
        s.score,
        s.scorePercent,
        JSON.stringify(s.topTerms),
        new Date().toISOString()
      );

      return {
        resumeId: r.id,
        resumeName: r.original_name,
        scorePercent: s.scorePercent,
        topTerms: s.topTerms
      };
    }).sort((a, b) => b.scorePercent - a.scorePercent);

    res.json({ jobId: Number(jobId), results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/rankings/:jobId", (req, res) => {
  const jobId = Number(req.params.jobId);
  const rows = db.prepare(`
    SELECT rankings.*, resumes.original_name AS resumeName
    FROM rankings
    JOIN resumes ON resumes.id = rankings.resume_id
    WHERE rankings.job_id = ?
    ORDER BY rankings.score_percent DESC
  `).all(jobId);

  const formatted = rows.map(r => ({
    resumeId: r.resume_id,
    resumeName: r.resumeName,
    scorePercent: r.score_percent,
    topTerms: JSON.parse(r.top_terms)
  }));

  res.json(formatted);
});

module.exports = router;
