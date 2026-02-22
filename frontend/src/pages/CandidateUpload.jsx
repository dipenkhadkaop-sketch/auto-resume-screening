import { useState } from "react";
import Navbar from "../components/Navbar";
import { request } from "../api/request";

export default function CandidateUpload() {
  const [file, setFile] = useState(null);

  async function handleUpload() {
    if (!file) return alert("Please choose a file first");

    const formData = new FormData();
    formData.append("resume", file);

    // ✅ If your backend needs user_id, keep this:
    formData.append("user_id", "1"); // we will auto-fix later using token

    try {
      const data = await request("/resume/upload", {
        method: "POST",
        body: formData,
      });

      alert("✅ Uploaded: " + (data.original_name || "resume"));
    } catch (err) {
      alert("❌ Upload failed: " + err.message);
      console.error(err);
    }
  }

  return (
    <div>
      <Navbar
        links={[
          { href: "/candidate", label: "Home" },
          { href: "/candidate/upload", label: "Upload Resume" },
          { href: "/candidate/feedback", label: "View Feedback" },
        ]}
      />

      <div style={{ padding: 30 }}>
        <h1>Upload Resume</h1>

        <div
          style={{
            marginTop: 18,
            background: "white",
            padding: 20,
            borderRadius: 14,
            maxWidth: 700,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#0b4cb8",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  );
}