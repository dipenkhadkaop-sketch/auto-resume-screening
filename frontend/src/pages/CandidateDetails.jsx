import React from "react";

export default function CandidateDetails() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Candidate Details & Feedback</h2>
      <p style={{ color: "#6b7280" }}>
        Matches the “Candidate Details and Feedback” wireframe listed in the proposal:contentReference[oaicite:8]{index=8}.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Panel title="Extracted Profile">
          <Line k="Name" v="Test User" />
          <Line k="Email" v="test@gmail.com" />
          <Line k="Top Skills" v="networking, troubleshooting, communication" />
          <Line k="Education" v="Bachelor of IT (In progress)" />
        </Panel>

        <Panel title="Feedback Report (Example)">
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Strengths</div>
          <ul style={{ marginTop: 0, color: "#374151" }}>
            <li>Strong match on required technical skills</li>
            <li>Relevant education background</li>
          </ul>

          <div style={{ fontWeight: 800, marginBottom: 6 }}>Areas for improvement</div>
          <ul style={{ marginTop: 0, color: "#374151" }}>
            <li>Add more measurable project outcomes</li>
            <li>Include certifications if available</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f9fafb" }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Line({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0" }}>
      <div style={{ color: "#6b7280" }}>{k}</div>
      <div style={{ fontWeight: 700 }}>{v}</div>
    </div>
  );
}