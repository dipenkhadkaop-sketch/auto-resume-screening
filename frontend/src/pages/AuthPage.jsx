// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { request, setToken } from "../api";

export default function AuthPage({ health, error, onLogin, loginType }) {
  const [mode, setMode] = useState("login"); // login | register
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      // 🔒 Role restriction
      if (loginType === "candidate" && r.user.role !== "candidate") {
        setMsg("❌ This login is for candidates only.");
        return;
      }

      if (loginType === "staff" && r.user.role === "candidate") {
        setMsg("❌ This login is for staff only.");
        return;
      }

      onLogin(r.user);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
        
        <h2 style={{ margin: 0 }}>
          {loginType === "staff" ? "Staff Login" : "Candidate Login"}
        </h2>

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
            style={tabBtn(mode === "login")}
          >
            Login
          </button>

          {loginType === "candidate" && (
            <button
              onClick={() => setMode("register")}
              style={tabBtn(mode === "register")}
            >
              Register
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          {mode === "register" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span>Full name</span>
              <input
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
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

          <button type="submit" style={primaryBtn}>
            {mode === "login" ? "Login" : "Create account"}
          </button>

          {msg && (
            <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function tabBtn(active) {
  return {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: active ? "#111827" : "white",
    color: active ? "white" : "#111827",
  };
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 600,
};