require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => res.json({ status: "API OK" }));

app.use("/auth", require("./routes/auth.routes"));
app.use("/jobs", require("./routes/job.routes"));
app.use("/resume", require("./routes/resume.routes"));
app.use("/analysis", require("./routes/analysis.routes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
