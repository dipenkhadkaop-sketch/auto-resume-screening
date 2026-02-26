import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

export default function CandidateLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  function submit(e) {
    e.preventDefault();
    // UI demo: no backend auth
    if (!email || !password) return setMsg("❌ Please enter email and password.");
    setMsg("✅ Demo login successful!");
    setTimeout(() => nav("/candidate"), 500);
  }

  return (
    <DashboardLayout title="Candidate Login">
      <div style={card}>
        <button onClick={() => nav(-1)} style={btnOutline}>← Back</button>

        <h2 style={{ marginTop: 12 }}>Welcome back</h2>
        <p style={{ color: "#6b7280" }}>
          Login to apply for jobs, upload your resume and view feedback reports.
        </p>

        <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <input
            style={input}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button type="button" style={linkBtn} onClick={() => nav("/forgot-password")}>
              Forgot password?
            </button>

            <button type="button" style={linkBtn} onClick={() => alert("Demo: Registration page can be added if needed.")}>
              Create account
            </button>
          </div>

          <button style={btnPrimary} type="submit">Login</button>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={btnOutline}
              onClick={() => alert("Google OAuth is planned as a future improvement (demo).")}
            >
              Continue with Google
            </button>
          </div>
        </form>

        {msg && <div style={msgBox}>{msg}</div>}
      </div>
    </DashboardLayout>
  );
}

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const input = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
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

const linkBtn = {
  border: "none",
  background: "transparent",
  color: "#111827",
  textDecoration: "underline",
  cursor: "pointer",
  padding: 0,
  fontWeight: 700,
};

const msgBox = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#f9fafb",
  border: "1px solid #eee",
};