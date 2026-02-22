// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// init DB (creates tables)
require("./db/database");

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/resume", require("./routes/resume.routes"));
app.use("/jobs", require("./routes/job.routes"));
app.use("/analysis", require("./routes/analysis.routes"));
app.use("/feedback", require("./routes/feedback.routes"));

// Optional: health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Debug: show real crash reason instead of dying silently
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const PORT = process.env.PORT || 4000;

// Bind to 0.0.0.0 to avoid IPv6/localhost weirdness
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});