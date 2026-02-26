// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";

export default function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadUsers();
    loadJobs();
  }, []);

  async function loadUsers() {
    try {
      const data = await request("/auth/users");
      setUsers(data);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function loadJobs() {
    try {
      const data = await request("/jobs");
      setJobs(data);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function updateRole(id, role) {
    try {
      await request("/auth/set-role", {
        method: "POST",
        body: JSON.stringify({ userId: id, role }),
      });
      loadUsers();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await request(`/auth/users/${id}`, { method: "DELETE" });
      setMsg("✅ User deleted");
      loadUsers();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("Delete this job?")) return;
    try {
      await request(`/jobs/${id}`, { method: "DELETE" });
      setMsg("✅ Job deleted");
      loadJobs();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Admin Dashboard</h1>
      <p>
        Logged in as <b>{user.full_name}</b> ({user.role})
      </p>

      <button onClick={onLogout} style={btn}>
        Logout
      </button>

      {msg && (
        <div style={{ marginTop: 14, padding: 12, background: "#f3f4f6", borderRadius: 10 }}>
          {msg}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <h2>Manage Users</h2>

      {users.map((u) => (
        <div key={u.id} style={card}>
          <div>
            <strong>{u.email}</strong>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {u.full_name || "No name"} | role: {u.role} | id: {u.id}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} style={select}>
              <option value="candidate">candidate</option>
              <option value="recruiter">recruiter</option>
              <option value="hr">hr</option>
              <option value="admin">admin</option>
            </select>

            <button onClick={() => deleteUser(u.id)} style={dangerBtn}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <hr style={{ margin: "30px 0" }} />

      <h2>Manage Jobs</h2>

      {jobs.map((j) => (
        <div key={j.id} style={card}>
          <div>
            <strong>
              #{j.id} — {j.title}
            </strong>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {j.company || "-"} | {j.location || "-"} | closing: {j.closing_date || "none"}
            </div>
          </div>

          <button onClick={() => deleteJob(j.id)} style={dangerBtn}>
            Delete Job
          </button>
        </div>
      ))}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const select = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
};

const dangerBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "white",
  color: "#ef4444",
  fontWeight: 700,
  cursor: "pointer",
};