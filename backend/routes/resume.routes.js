const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const db = require("../db/database");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Allow only PDF and DOCX
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf" && ext !== ".docx") {
    return cb(new Error("Only PDF and DOCX files are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Extract text
async function parseFile(filePath, originalName) {
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

  return "";
}

// Upload endpoint
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const user_id = req.body.user_id ? Number(req.body.user_id) : null;
    const original_name = req.file.originalname;
    const stored_name = req.file.filename;
    const file_type = path.extname(original_name).replace(".", "").toLowerCase();

    const extracted_text = await parseFile(req.file.path, original_name);

    db.run(
      `INSERT INTO resumes (user_id, original_name, stored_name, file_type, extracted_text)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, original_name, stored_name, file_type, extracted_text],
      function (err) {
        if (err) return res.status(500).json({ message: "Database error.", error: err.message });

        res.json({
          message: "Resume uploaded successfully.",
          resume_id: this.lastID,
          original_name,
          file_type,
          preview: extracted_text.slice(0, 300)
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Upload failed.", error: error.message });
  }
});

// Friendly errors
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
  next();
});

module.exports = router;
