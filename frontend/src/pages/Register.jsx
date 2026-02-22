import { useState } from "react";
import { request } from "../api/request";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      alert("✅ Registered! Now login.");
      window.location.href = "/";
    } catch (err) {
      alert("❌ Register failed: " + (err.message || "no message"));
      console.error(err);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f7fc", padding: 20 }}>
      <div style={{ width: 420, maxWidth: "95vw", background: "white", padding: 28, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>Create an account</h2>

        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <button
            type="submit"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#2f6fed", color: "white", fontWeight: 700, cursor: "pointer" }}
          >
            Register
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <a href="/" style={{ color: "#2f6fed", textDecoration: "none", fontWeight: 600 }}>
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
}