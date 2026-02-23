import React, { useState } from "react";
import { request, setToken } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      if (mode === "register") {
        await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ full_name: fullName, email, password }),
        });
        setMsg("✅ Registered as candidate. Now login.");
        setMode("login");
      } else {
        const r = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(r.token);
        localStorage.setItem("user", JSON.stringify(r.user));
        onLogin(r.user);
      }
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Auto Resume Screening</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode("login")} style={mode === "login" ? btnOn : btnOff}>Login</button>
        <button onClick={() => setMode("register")} style={mode === "register" ? btnOn : btnOff}>Register</button>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        {mode === "register" && (
          <label style={{ display: "grid", gap: 6 }}>
            <span>Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} />
          </label>
        )}

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
        </label>

        <button disabled={busy} type="submit" style={primary}>
          {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>

        {msg && <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>{msg}</div>}
      </form>

      <div style={{ fontSize: 12, color: "#555", marginTop: 12 }}>
        Demo: admin/hr/recruiter accounts are created by admin using role change.
      </div>
    </div>
  );
}

const input = { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" };
const primary = { padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 700 };
const btnOn = { flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" };
const btnOff = { flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" };