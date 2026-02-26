import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

export default function StaffLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  function submit(e) {
    e.preventDefault();
    // UI demo only
    if (!email || !password) return setMsg("❌ Please enter email and password.");
    setMsg("✅ Demo staff login successful!");
    setTimeout(() => nav("/recruiter"), 500);
  }

  return (
    <DashboardLayout title="Staff Login">
      <div style={card}>
        <button onClick={() => nav(-1)} style={btnOutline}>← Back</button>

        <h2 style={{ marginTop: 12 }}>Recruiter / Admin Access</h2>
        <p style={{ color: "#6b7280" }}>
          Staff login for recruiters and admins to manage jobs and ranking.
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

          <button type="button" style={linkBtn} onClick={() => nav("/forgot-password")}>
            Forgot password?
          </button>

          <button style={btnPrimary} type="submit">Login</button>

          <button
            type="button"
            style={btnOutline}
            onClick={() => alert("Google OAuth is planned as a future improvement (demo).")}
          >
            Continue with Google
          </button>
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