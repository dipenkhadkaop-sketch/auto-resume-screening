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

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

// Bind to 0.0.0.0 to avoid localhost IPv6 weirdness
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});