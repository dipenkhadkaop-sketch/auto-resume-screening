const analysisRoutes = require("./routes/analysis.routes");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");
const jobRoutes = require("./routes/job.routes"); // ← keep this

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "API OK" }));

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/jobs", jobRoutes); // ← THIS WAS MISSING

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
