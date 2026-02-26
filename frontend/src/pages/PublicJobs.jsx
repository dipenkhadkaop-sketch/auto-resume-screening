import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";
import DashboardLayout from "../components/DashboardLayout";

export default function PublicJobs() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // If backend not running, it will just show “No open jobs.”
    request("/jobs")
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]));
  }, []);

  const now = new Date();

  const openJobs = jobs.filter(
    (j) => !j.closing_date || new Date(j.closing_date) > now
  );

  return (
    <DashboardLayout title="Auto Resume Screening">
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Open Positions</h2>
        <p style={{ color: "#6b7280" }}>
          Browse active jobs publicly. Candidates can apply after login.
        </p>

        {openJobs.length === 0 && <p style={{ marginTop: 12 }}>No open jobs.</p>}

        {openJobs.map((job) => (
          <div key={job.id} style={jobCard}>
            <div>
              <h3 style={{ margin: 0 }}>{job.title}</h3>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                Closing: {job.closing_date || "Not set"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={btnOutline} onClick={() => nav(`/jobs/${job.id}`)}>
                View Details
              </button>
              <button style={btnPrimary} onClick={() => nav(`/candidate/login`)}>
                Apply
              </button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btnOutline} onClick={() => nav("/candidate/login")}>
            Candidate Login
          </button>
          <button style={btnOutline} onClick={() => nav("/staff/login")}>
            Staff Login
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---- styles ---- */

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const jobCard = {
  border: "1px solid #eee",
  padding: 16,
  borderRadius: 12,
  marginTop: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  background: "#fff",
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