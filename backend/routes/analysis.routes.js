const router = require("express").Router();
const db = require("../db/database");

// helper: skill scoring (same logic style as your /resume/score)
function scoreResumeAgainstJob(resumeText, requiredSkillsStr) {
  const text = (resumeText || "").toLowerCase();

  const requiredSkills = (requiredSkillsStr || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (requiredSkills.length === 0) {
    return { score: 0, matchedSkills: [], totalRequired: 0 };
  }

  const matchedSkills = requiredSkills.filter((skill) => text.includes(skill));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return { score, matchedSkills, totalRequired: requiredSkills.length };
}

// ✅ Rank all resumes for a job
router.get("/rank/:job_id", (req, res) => {
  const job_id = Number(req.params.job_id);

  db.get(`SELECT * FROM jobs WHERE id = ?`, [job_id], (err, job) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    if (!job) return res.status(404).json({ message: "Job not found" });

    db.all(`SELECT * FROM resumes ORDER BY id DESC`, [], (err2, resumes) => {
      if (err2) return res.status(500).json({ message: "DB error", error: err2.message });
      if (!resumes || resumes.length === 0) {
        return res.status(400).json({ message: "No resumes uploaded yet." });
      }

      const results = resumes.map((r) => {
        const { score, matchedSkills, totalRequired } = scoreResumeAgainstJob(
          r.extracted_text,
          job.required_skills
        );

        return {
          resume_id: r.id,
          original_name: r.original_name,
          score_percentage: score,
          matched_skills: matchedSkills,
          total_required: totalRequired,
        };
      });

      results.sort((a, b) => b.score_percentage - a.score_percentage);

      res.json({
        job_id,
        job_title: job.title,
        results,
      });
    });
  });
});

module.exports = router;
