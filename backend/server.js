const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

require("./db/database");

// PUBLIC routes (NO TOKEN)
app.use("/auth", require("./routes/auth"));

// PROTECTED routes (inside route files)
app.use("/resume", require("./routes/resume.routes"));
app.use("/jobs", require("./routes/job.routes"));
app.use("/analysis", require("./routes/analysis.routes"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log("✅ Server running on port", PORT)
);
