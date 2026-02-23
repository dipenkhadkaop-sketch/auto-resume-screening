import React from "react";

export default function CandidateDashboard() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Candidate Dashboard</h2>
      <p style={{ color: "#6b7280" }}>
        Upload your resume, view feedback reports, and track your screening status.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <Card title="Upload Resume" text="Upload PDF/DOCX (≤10MB) and track status." />
        <Card title="Feedback Reports" text="View strengths and skill gaps after screening." />
        <Card title="Notifications" text="See system messages and next steps." />
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f9fafb" }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#6b7280" }}>{text}</div>
    </div>
  );
}