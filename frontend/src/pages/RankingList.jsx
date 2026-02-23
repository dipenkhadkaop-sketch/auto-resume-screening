import React, { useState } from "react";
import { request } from "../api";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function upload() {
    setMsg("");
    if (!file) return setMsg("❌ Please choose a PDF/DOCX first");

    try {
      const fd = new FormData();
      fd.append("resume", file);
      // If your backend requires user_id, you can add it too:
      // fd.append("user_id", "1");

      const r = await request("/resume/upload", { method: "POST", body: fd });
      setMsg(`✅ Uploaded: resume_id=${r.resume_id || r.id || "OK"}`);
      setFile(null);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Resume Upload</h2>
      <p style={{ color: "#6b7280" }}>
        Matches the “Resume Upload Page” wireframe listed in the proposal:contentReference[oaicite:6]{index=6}.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 600 }}>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} style={primaryBtn}>
          Upload
        </button>
        {msg && <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>{msg}</div>}
      </div>
    </div>
  );
}

const primaryBtn = { padding: "10px 12px", borderRadius: 10, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 700 };