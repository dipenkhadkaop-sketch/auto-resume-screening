import React from "react";

export default function RecruiterDashboard() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Recruiter Dashboard</h2>
      <p style={{ color: "#6b7280" }}>
        Create/edit job descriptions, analyze resumes, and review candidate rankings.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <Card title="Create / Edit Jobs" text="Manage job descriptions and keywords." />
        <Card title="Analyse & Rank" text="Generate ranked candidate lists." />
        <Card title="Candidate Details" text="Open a candidate profile and feedback." />
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