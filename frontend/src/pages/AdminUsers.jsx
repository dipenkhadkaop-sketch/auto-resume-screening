import React, { useEffect, useState } from "react";
import { request } from "../api/request";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadUsers() {
    try {
      const data = await request("/admin/users");
      setUsers(data);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await request(`/admin/users/${id}`, { method: "DELETE" });
      setMsg("✅ User deleted");
      loadUsers();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Admin Users</h2>
      {msg && <p>{msg}</p>}

      {users.map((u) => (
        <div key={u.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
          <b>{u.full_name}</b> — {u.email} ({u.role})
          <div style={{ marginTop: 8 }}>
            <button onClick={() => deleteUser(u.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}