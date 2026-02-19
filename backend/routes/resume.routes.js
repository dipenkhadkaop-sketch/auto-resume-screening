const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const db = require("../db/database");

// optional: protect upload with JWT (recommended)
// If you don't want auth yet, comment authMiddleware out and set userId=1 below.
const authMiddleware = require("../middleware/auth");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

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

// ✅ POST /resume/upload  (expects form-data key: resume)
router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const textContent = await parseFileToText(file.path, file.originalname);
    if (!textContent.trim()) return res.status(400).json({ message: "Could not extract text" });

    const userId = req.user.id; // from JWT
    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = ext === ".pdf" ? "pdf" : ext === ".docx" ? "docx" : "unknown";

    const info = await dbRun(
      `INSERT INTO resumes (user_id, original_name, file_type, stored_name, text_content)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, file.originalname, fileType, file.filename, textContent]
    );

    res.json({ resume_id: info.lastID, original_name: file.originalname });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

// ✅ GET /resume  (list resumes)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await dbAll(
      "SELECT id, original_name, file_type, created_at FROM resumes WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Fetch failed", error: e.message });
  }
});

module.exports = router;
