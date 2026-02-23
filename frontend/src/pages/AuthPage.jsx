// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { request, setToken } from "../api";

export default function AuthPage({ health, error, onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    try {
      if (mode === "register") {
        const r = await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ full_name, email, password }),
        });
        setMsg(`✅ Registered: ${r.user.email}. Now login.`);
        setMode("login");
        return;
      }

      const r = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(r.token);
      onLogin(r.user);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
        <h2 style={{ margin: 0 }}>Auto Resume Screening</h2>
        <p style={{ marginTop: 6, color: "#6b7280" }}>
          {mode === "login" ? "Login to continue" : "Create your account"}
        </p>

        <div style={{ marginBottom: 10 }}>
          <strong>Backend health:</strong>{" "}
          {health?.ok ? "✅ OK" : error ? `❌ ${error}` : "Loading..."}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: mode === "login" ? "#111827" : "white",
              color: mode === "login" ? "white" : "#111827",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: mode === "register" ? "#111827" : "white",
              color: mode === "register" ? "white" : "#111827",
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          {mode === "register" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span>Full name</span>
              <input
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dipen Khadka"
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              fontWeight: 600,
            }}
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>

          {msg && <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>{msg}</div>}
        </form>

        <p style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
          Tip: Login as <b>admin@gmail.com</b>, <b>hr@gmail.com</b>, or a normal user.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};