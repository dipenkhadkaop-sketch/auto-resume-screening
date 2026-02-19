const router = require("express").Router();
const db = require("../db/database");
const auth = require("../middleware/auth");
const { audit } = require("../utils/audit");

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function extractTerms(text) {
  return Array.from(new Set((text || "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2)));
}

// FR-10 feedback
router.post("/", auth, async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;
    if (!jobId || !resumeId) return res.status(400).json({ message: "jobId and resumeId required" });

    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [Number(jobId)]);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const resume = await dbGet("SELECT * FROM resumes WHERE id = ?", [Number(resumeId)]);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    if (resume.user_id !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const jobTerms = extractTerms(job.description);
    const resumeText = (resume.text_content || "").toLowerCase();

    const matched = jobTerms.filter((t) => resumeText.includes(t));
    const missing = jobTerms.filter((t) => !resumeText.includes(t));

    const feedback = {
      strengths: matched.slice(0, 8),
      gaps: missing.slice(0, 8),
      tips: missing.slice(0, 5).map((t) => `Consider adding evidence of: ${t}`),
    };

    audit({ user_id: req.user.id, action: "GENERATE_FEEDBACK", detail: { jobId, resumeId }, ip: req.ip });

    res.json({ jobId: Number(jobId), resumeId: Number(resumeId), feedback });
  } catch (e) {
    res.status(500).json({ message: "Feedback failed", error: e.message });
  }
});

module.exports = router;
