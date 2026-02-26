import React from "react";

export default function JobDetails({ job, onBack, onApply }) {
  if (!job) return <div>No job selected.</div>;

  const isClosed =
    job.closing_date && new Date(job.closing_date) < new Date();

  return (
    <div style={{ padding: 40 }}>
      <button onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <h2>{job.title}</h2>
      <p><strong>Closing Date:</strong> {job.closing_date || "Not set"}</p>

      <div style={{ marginTop: 20 }}>
        <h4>Description</h4>
        <p>{job.description}</p>
      </div>

      {isClosed ? (
        <div style={{ marginTop: 20, color: "red" }}>
          ❌ Applications Closed
        </div>
      ) : (
        <button
          onClick={onApply}
          style={{
            marginTop: 20,
            padding: "10px 16px",
            borderRadius: 8,
            background: "#111",
            color: "white",
            border: "none",
          }}
        >
          Apply Now
        </button>
      )}
    </div>
  );
}