import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

export default function RecruiterDashboard() {
  const nav = useNavigate();

  return (
    <DashboardLayout title="Recruiter Dashboard">
      {/* Top summary cards */}
      <div style={grid3}>
        <div style={card}>
          <h3 style={h3}>Active Jobs</h3>
          <div style={bigNumber}>4</div>
          <p style={muted}>Jobs currently open</p>
          <button style={btnLight} onClick={() => nav("/recruiter/job-editor")}>
            + Create / Edit Job
          </button>
        </div>

        <div style={card}>
          <h3 style={h3}>Applications Received</h3>
          <div style={bigNumber}>24</div>
          <p style={muted}>Total resumes submitted</p>
          <button style={btnLight} onClick={() => nav("/ranking")}>
            View Ranked Candidates
          </button>
        </div>

        <div style={card}>
          <h3 style={h3}>System Status</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <span style={badge}>🛡 PII Removal Enabled</span>
            <span style={badge}>🧾 Audit Logging Enabled</span>
            <span style={badge}>⚡ Avg Analysis: ~2.1s</span>
          </div>
          <p style={{ ...muted, marginTop: 12 }}>
            These indicators support fairness and transparency.
          </p>
        </div>
      </div>

      {/* Quick actions + analytics */}
      <div style={grid2}>
        <div style={card}>
          <h3 style={h3}>Quick Actions</h3>
          <p style={muted}>Common recruiter tasks.</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button style={btnPrimary} onClick={() => nav("/recruiter/job-editor")}>
              Create Job
            </button>

            <button style={btnOutline} onClick={() => nav("/ranking")}>
              View Ranking List
            </button>

            <button style={btnOutline} onClick={() => nav("/recruiter/analyze")}>
              Analyse Resumes
            </button>
          </div>

          <div style={{ marginTop: 18, padding: 12, borderRadius: 12, background: "#f9fafb", border: "1px solid #eee" }}>
            <strong>Shareable Job Link (Demo)</strong>
            <div style={{ marginTop: 6, fontSize: 13, color: "#374151" }}>
              https://yourapp.com/jobs/123
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Recruiters can post this link on LinkedIn, email, or company career pages.
            </div>
          </div>
        </div>

        <div style={card}>
          <h3 style={h3}>Summary Analytics</h3>
          <p style={muted}>Simple metrics to match your proposal section on dashboards.</p>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <Metric title="Average Match Score" value="78%" sub="Across all applicants" />
            <Metric title="Top Skill Frequency" value="React" sub="Most common skill found" />
            <Metric title="Highest Ranked Candidate" value="Alex Johnson" sub="Score: 92%" />
            <Metric title="Jobs Closing Soon" value="1" sub="Within 3 days" />
          </div>

          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "#eef6ff", border: "1px solid #cfe6ff" }}>
            <strong>Explainability Note</strong>
            <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
              “Ranking is computed using TF-IDF similarity with score breakdown and keyword matches.”
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ title, value, sub }) {
  return (
    <div style={metricCard}>
      <div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

/* -------- styles -------- */

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const h3 = { margin: 0 };

const bigNumber = { fontSize: 34, fontWeight: 900, marginTop: 10 };

const muted = { color: "#6b7280", marginTop: 8 };

const badge = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnOutline = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnLight = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fafafa",
  fontWeight: 700,
  cursor: "pointer",
};

const metricCard = {
  padding: 14,
  borderRadius: 12,
  border: "1px solid #eee",
  background: "#fff",
};