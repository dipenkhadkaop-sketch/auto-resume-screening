// backend/routes/resume.routes.js
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const db = require("../db/database");

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { audit } = require("../utils/audit");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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

// ✅ Candidate uploads resume only
router.post("/upload", auth, requireRole("candidate"), (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    try {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "File too large (max 10MB)" });
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) return res.status(400).json({ message: "resume file required" });

      const user_id = req.user.id;
      const file = req.file;

      let extracted_text = "";
      try {
        extracted_text = await parseFileToText(file.path, file.originalname);
      } catch (parseErr) {
        console.error("❌ Parse error:", parseErr);
        try {
          fs.unlinkSync(file.path);
        } catch {}
        return res.status(400).json({ message: `Parse failed: ${parseErr.message}` });
      }

      const file_type = path.extname(file.originalname).replace(".", "").toLowerCase();

      // ✅ FIX: store into text_content (your DB column)
      const info = await dbRun(
        "INSERT INTO resumes (user_id, original_name, stored_name, file_type, text_content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
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
      console.error("❌ Upload handler error:", e);
      return res.status(500).json({ message: "Server error", error: e.message });
    }
  });
});

module.exports = router;