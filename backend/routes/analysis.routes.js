// backend/routes/analysis.routes.js
const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { audit } = require("../utils/audit");

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

function scoreTextAgainstJob(textRaw, jobDescRaw) {
  const text = (textRaw || "").toLowerCase();
  const required = (jobDescRaw || "")
    .split(/[,;\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const matched_skills = required.filter((skill) => text.includes(skill));
  const matched_count = matched_skills.length;
  const total_required = required.length || 1;
  const score_percentage = Math.round((matched_count / total_required) * 100);

  return { matched_skills, matched_count, total_required, score_percentage };
}

// ✅ Recruiter/HR/Admin can score 1 resume vs 1 job
router.get("/score/:resumeId/:jobId", auth, requireRole("admin", "hr", "recruiter"), async (req, res) => {
  try {
    const resumeId = Number(req.params.resumeId);
    const jobId = Number(req.params.jobId);
    if (!resumeId || !jobId) return res.status(400).json({ message: "invalid ids" });

    const resume = await dbGet("SELECT * FROM resumes WHERE id = ?", [resumeId]);
    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [jobId]);
    if (!resume) return res.status(404).json({ message: "resume not found" });
    if (!job) return res.status(404).json({ message: "job not found" });

    const s = scoreTextAgainstJob(resume.extracted_text, job.description);

    audit({ user_id: req.user.id, action: "ANALYZE_SCORE", detail: { resumeId, jobId }, ip: req.ip });

    return res.json({
      resume_id: resumeId,
      job_id: jobId,
      ...s,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// ✅ Recruiter/HR/Admin can rank ALL resumes for a job
router.get("/rank/:jobId", auth, requireRole("admin", "hr", "recruiter"), async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    if (!jobId) return res.status(400).json({ message: "invalid jobId" });

    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [jobId]);
    if (!job) return res.status(404).json({ message: "job not found" });

    const resumes = await dbAll("SELECT id, user_id, original_name, extracted_text FROM resumes ORDER BY id DESC");
    if (!resumes.length) return res.status(400).json({ message: "No resumes available" });

    const ranked = resumes
      .map((r) => {
        const s = scoreTextAgainstJob(r.extracted_text, job.description);
        return {
          resume_id: r.id,
          user_id: r.user_id,
          original_name: r.original_name,
          ...s,
        };
      })
      .sort((a, b) => b.score_percentage - a.score_percentage);

    audit({ user_id: req.user.id, action: "ANALYZE_RANK", detail: { jobId, count: ranked.length }, ip: req.ip });

    return res.json({ job_id: jobId, ranked });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;