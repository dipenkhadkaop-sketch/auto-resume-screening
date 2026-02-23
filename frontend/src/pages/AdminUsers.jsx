import React, { useState } from "react";
import { request } from "../api";

export default function AdminUsers() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("hr");
  const [msg, setMsg] = useState("");

  async function setRoleApi() {
    setMsg("");
    try {
      await request("/auth/set-role", {
        method: "POST",
        body: JSON.stringify({ userId: Number(userId), role }),
      });
      setMsg("✅ Role updated");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Manage Users & Roles</h2>
      <p style={{ color: "#6b7280" }}>
        Admin-only panel to update user roles.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>User ID</span>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
            <option value="admin">admin</option>
            <option value="hr">hr</option>
            <option value="recruiter">recruiter</option>
          </select>
        </label>

        <button onClick={setRoleApi} style={primaryBtn}>
          Update Role
        </button>

        {msg && <div style={{ padding: 10, borderRadius: 10, background: "#f3f4f6" }}>{msg}</div>}
      </div>
    </div>
  );
}

const inputStyle = { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" };
const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
};