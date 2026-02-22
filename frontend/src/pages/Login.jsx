import { useState } from "react";
import { request } from "../api/request";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email typed here
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: identifier, // ✅ backend expects email
          password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ Redirect based on role
      if (data.role === "candidate") window.location.href = "/candidate";
      else if (data.role === "recruiter") window.location.href = "/recruiter";
      else if (data.role === "admin") window.location.href = "/admin";
      else alert("✅ Login successful (no role redirect)");

    } catch (err) {
      alert("❌ Login failed: " + (err.message || "no message"));
      console.error(err);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f7fc", padding: 20 }}>
      <div style={{ width: 420, maxWidth: "95vw", background: "white", padding: 28, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 700 }}>Resume Screening Tool</div>
          <h2 style={{ marginTop: 10 }}>Login to Resume Screening Tool</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email"
            style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, color: "#2f6fed", textDecoration: "none" }}>
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#2f6fed", color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            Login
          </button>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <a href="/register" style={{ color: "#2f6fed", textDecoration: "none", fontWeight: 600 }}>
              Register
            </a>
          </div>
        </form>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18, color: "#667085" }}>
          <span style={{ fontSize: 12 }}>Terms</span>
          <span style={{ fontSize: 12 }}>Privacy</span>
        </div>
      </div>
    </div>
  );
}