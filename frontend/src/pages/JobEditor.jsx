import React, { useState } from "react";
import { request } from "../api";

export default function JobEditor() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  async function save() {
    setMsg("");
    try {
      const r = await request("/jobs", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setMsg(`✅ Job created with id: ${r.id}`);
      setTitle("");
      setDescription("");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Job Description Editor</h2>
      <p style={{ color: "#6b7280" }}>
        Matches the “Job Description Editor” wireframe in the proposal:contentReference[oaicite:5]{index=5}.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 800 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Job Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        <button onClick={save} style={primaryBtn}>
          Save Job
        </button>

        {msg && <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>{msg}</div>}
      </div>
    </div>
  );
}

const inputStyle = { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" };
const primaryBtn = { padding: "10px 12px", borderRadius: 10, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 700 };