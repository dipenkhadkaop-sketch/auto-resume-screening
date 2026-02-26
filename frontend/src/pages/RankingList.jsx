import { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function RankingList() {
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("score_desc");

  // Dummy UI data (safe for frontend only)
  const candidates = [
    {
      id: 1,
      name: "Alex Johnson",
      score: 92,
      skillMatch: 90,
      expMatch: 85,
      eduMatch: 80,
      submittedAt: "2026-02-20",
      matched: ["React", "Node", "SQL", "Communication"],
      missing: ["Docker", "AWS"],
    },
    {
      id: 2,
      name: "Samira Khan",
      score: 84,
      skillMatch: 82,
      expMatch: 78,
      eduMatch: 88,
      submittedAt: "2026-02-21",
      matched: ["JavaScript", "APIs", "Teamwork"],
      missing: ["Testing", "CI/CD"],
    },
    {
      id: 3,
      name: "Chris Lee",
      score: 71,
      skillMatch: 70,
      expMatch: 62,
      eduMatch: 75,
      submittedAt: "2026-02-22",
      matched: ["IT Support", "Networking"],
      missing: ["Python", "Linux"],
    },
  ];

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => c.score >= minScore);

    if (sortBy === "score_desc") list.sort((a, b) => b.score - a.score);
    if (sortBy === "score_asc") list.sort((a, b) => a.score - b.score);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [minScore, sortBy]);

  return (
    <DashboardLayout title="Ranked Candidates">

      {/* Top Info */}
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Job: Junior Developer</h2>
        <p style={{ color: "#6b7280" }}>
          Ranking calculated using TF-IDF similarity (Explainable AI).
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <span style={badge}>🛡 PII Removed</span>
          <span style={badge}>🧾 Audit Logging Enabled</span>
        </div>
      </div>

      {/* Filters */}
      <div style={card}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={label}>Minimum Score: {minScore}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={label}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={input}
            >
              <option value="score_desc">Score High → Low</option>
              <option value="score_asc">Score Low → High</option>
              <option value="name">Name A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Candidate</th>
              <th style={th}>Score</th>
              <th style={th}>Skill Match</th>
              <th style={th}>Experience</th>
              <th style={th}>Education</th>
              <th style={th}>Top Matches</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Submitted: {c.submittedAt}
                  </div>
                </td>

                <td style={td}>
                  <span style={scorePill}>{c.score}%</span>
                </td>

                <td style={td}>{c.skillMatch}%</td>
                <td style={td}>{c.expMatch}%</td>
                <td style={td}>{c.eduMatch}%</td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {c.matched.map((m) => (
                      <span key={m} style={chip}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                    Missing: {c.missing.join(", ")}
                  </div>
                </td>

                <td style={td}>
                  <button style={btn}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </DashboardLayout>
  );
}

/* ---------- STYLES ---------- */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const badge = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  background: "#eef6ff",
  border: "1px solid #cfe6ff",
};

const label = { display: "block", marginBottom: 8, fontSize: 13 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
};

const th = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #eee",
};

const td = {
  padding: "14px 10px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "top",
};

const scorePill = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#ecfdf3",
  border: "1px solid #b7f0cd",
  fontWeight: 700,
};

const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
};

const btn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
};