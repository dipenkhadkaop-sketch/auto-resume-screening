// frontend/src/pages/CandidateApply.jsx
import React, { useState } from "react";
import { request } from "../api";

export default function CandidateApply({ user, job, onDone, onLogout }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploaded, setUploaded] = useState(null); // { resume_id, preview, ... }

  async function uploadResume() {
    setMsg("");
    if (!resumeFile) return setMsg("❌ Please choose a PDF/DOCX first.");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);

      // ✅ This matches your backend upload style
      const r = await request("/resume/upload", { method: "POST", body: fd });
      setUploaded(r);
      setMsg("✅ Resume uploaded successfully!");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitApplication() {
    setMsg("");

    if (!job?.id) return setMsg("❌ No job selected.");
    if (!uploaded?.resume_id) return setMsg("❌ Upload resume first.");

    setBusy(true);
    try {
      /**
       * OPTIONAL: If your backend has an applications endpoint, this will work.
       * If it DOES NOT exist, the try/catch will show a message instead of crashing.
       */
      try {
        await request("/applications/apply", {
          method: "POST",
          body: JSON.stringify({
            job_id: job.id,
            resume_id: uploaded.resume_id,
          }),
        });
        setMsg("✅ Application submitted!");
      } catch (err) {
        // If endpoint doesn't exist yet, we still allow “Apply flow” to complete.
        setMsg(
          "✅ Resume uploaded. (Application endpoint not added yet — next we’ll create it in backend.)"
        );
      }

      // go back to dashboard / done
      onDone?.();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!job) {
    return (
      <div style={wrap}>
        <h1 style={{ marginTop: 0 }}>Apply</h1>
        <p>❌ No job selected. Go back and choose a job first.</p>
        <button onClick={onDone} style={btn}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Apply for Job</h1>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            Logged in as <b>{user?.full_name || "Candidate"}</b> ({user?.email})
          </div>
        </div>

        <button onClick={onLogout} style={{ ...btn, borderColor: "#ef4444", color: "#ef4444" }}>
          Logout
        </button>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>{job.title}</h2>
        <p style={{ color: "#374151", whiteSpace: "pre-wrap" }}>{job.description}</p>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>1) Upload Resume (PDF/DOCX)</h3>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={uploadResume} disabled={busy} style={primaryBtn}>
            {busy ? "Uploading..." : "Upload Resume"}
          </button>
        </div>

        {uploaded?.preview && (
          <div style={{ marginTop: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Extract Preview</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{uploaded.preview}</pre>
          </div>
        )}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>2) Submit Application</h3>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          This links your uploaded resume to this job (we’ll add backend endpoint next if missing).
        </p>

        <button onClick={submitApplication} disabled={busy} style={primaryBtn}>
          {busy ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f3f4f6" }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button onClick={onDone} style={btn}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const wrap = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 18,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const card = {
  marginTop: 14,
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  background: "white",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};