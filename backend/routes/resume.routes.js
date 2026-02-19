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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) return cb(new Error("Only PDF and DOCX supported"));
    cb(null, true);
  },
});

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

// Upload resume (protected)
router.post("/upload", auth, upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const textContent = await parseFileToText(file.path, file.originalname);
    if (!textContent.trim()) return res.status(400).json({ message: "Could not extract text" });

    const userId = req.user.id;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    db.run(
      `INSERT INTO resumes (user_id, original_name, file_type, stored_name, text_content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, file.originalname, ext, file.filename, textContent, new Date().toISOString()],
      function (err) {
        if (err) return res.status(500).json({ message: "DB error", error: err.message });

        audit({ user_id: userId, action: "UPLOAD_RESUME", detail: { resumeId: this.lastID }, ip: req.ip });

        res.json({ id: this.lastID, originalName: file.originalname });
      }
    );
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

// List my resumes (protected)
router.get("/", auth, (req, res) => {
  db.all(
    "SELECT id, original_name, created_at FROM resumes WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
