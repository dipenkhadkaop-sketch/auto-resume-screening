import React, { useState } from "react";
import { request, setToken } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "register") {
        await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ full_name: fullName, email, password }),
        });
        setMode("login");
      } else {
        const data = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        onLogin?.(data.user);
      }
    } catch (err) {
      setError(err.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>
        {mode === "login" ? "Login" : "Register"}
      </h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setMode("login")} style={{ padding: "6px 10px" }}>
          Login
        </button>
        <button onClick={() => setMode("register")} style={{ padding: "6px 10px" }}>
          Register
        </button>
      </div>

      <form onSubmit={submit}>
        {mode === "register" && (
          <div style={{ marginBottom: 10 }}>
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button type="submit" disabled={busy} style={{ padding: "8px 12px" }}>
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p style={{ fontSize: 12, color: "#555", marginTop: 12 }}>
        Demo accounts: admin@gmail.com / hr@gmail.com / test@gmail.com (password: 123456)
      </p>
    </div>
  );
}