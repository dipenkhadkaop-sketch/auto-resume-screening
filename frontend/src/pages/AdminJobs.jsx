import React, { useEffect, useState } from "react";
import { request } from "../api/request";
import { useNavigate } from "react-router-dom";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const data = await request("/jobs");
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  async function del(jobId) {
    if (!confirm("Delete this job?")) return;
    setMsg("");
    try {
      await request(`/jobs/${jobId}`, { method: "DELETE" });
      setMsg("✅ Job deleted");
      load();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Admin Jobs</h2>
      {msg && <p>{msg}</p>}

      <button onClick={() => navigate("/admin/jobs/new")} style={{ padding: "10px 16px" }}>
        + Create Job
      </button>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {jobs.map((j) => (
          <div key={j.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
            <b>{j.title}</b>
            <div>{j.company} • {j.location}</div>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button onClick={() => navigate(`/admin/jobs/${j.id}/edit`)}>Edit</button>
              <button onClick={() => del(j.id)}>Delete</button>
            </div>
          </div>
        ))}

        {jobs.length === 0 && <p>No jobs found.</p>}
      </div>
    </div>
  );
}