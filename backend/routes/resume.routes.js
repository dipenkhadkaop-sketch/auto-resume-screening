// backend/routes/resume.routes.js
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const db = require("../db/database");
const auth = require("../middleware/auth");
const { audit } = require("../utils/audit");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx)$/i.test(file.originalname);
    if (!ok) return cb(new Error("Only PDF and DOCX supported"));
    cb(null, true);
  },
});

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

async function parseFileToText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  throw new Error("Only PDF and DOCX supported");
}

// Upload resume (any logged-in user)
router.post("/upload", auth, (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    try {
      if (err) {
        // multer file size error
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "File too large (max 10MB)" });
        }
        return res.status(400).json({ message: err.message });
      }

      const user_id = Number(req.body?.user_id || req.user.id);
      if (!user_id) return res.status(400).json({ message: "user_id required" });

      const file = req.file;
      if (!file) return res.status(400).json({ message: "resume file required" });

      const extracted_text = await parseFileToText(file.path, file.originalname);
      const file_type = path.extname(file.originalname).replace(".", "").toLowerCase();

      const info = await dbRun(
        "INSERT INTO resumes (user_id, original_name, stored_name, file_type, extracted_text, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, file.originalname, file.filename, file_type, extracted_text, new Date().toISOString()]
      );

      audit({
        user_id: req.user.id,
        action: "UPLOAD_RESUME",
        detail: { resumeId: info.lastID, original: file.originalname },
        ip: req.ip,
      });

      return res.json({
        message: "Resume uploaded successfully.",
        resume_id: info.lastID,
        original_name: file.originalname,
        file_type,
        preview: extracted_text.slice(0, 400),
      });
    } catch (e) {
      return res.status(500).json({ message: "Server error", error: e.message });
    }
  });
});

// Score a resume vs a job (GET /resume/score/:resumeId/:jobId)
router.get("/score/:resumeId/:jobId", async (req, res) => {
  try {
    const resumeId = Number(req.params.resumeId);
    const jobId = Number(req.params.jobId);
    if (!resumeId || !jobId) return res.status(400).json({ message: "invalid ids" });

    const resume = await dbGet("SELECT * FROM resumes WHERE id = ?", [resumeId]);
    const job = await dbGet("SELECT * FROM jobs WHERE id = ?", [jobId]);
    if (!resume) return res.status(404).json({ message: "resume not found" });
    if (!job) return res.status(404).json({ message: "job not found" });

    const text = (resume.extracted_text || "").toLowerCase();
    const required = (job.description || "")
      .split(/[,;\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const matched_skills = required.filter((skill) => text.includes(skill));
    const matched_count = matched_skills.length;
    const total_required = required.length || 1;
    const score_percentage = Math.round((matched_count / total_required) * 100);

    return res.json({
      resume_id: resumeId,
      job_id: jobId,
      matched_skills,
      matched_count,
      total_required,
      score_percentage,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;