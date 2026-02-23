// src/components/Layout.jsx
import React from "react";
import { getToken } from "../api";

export default function Layout({
  appTitle,
  user,
  healthOk,
  healthError,
  navItems,
  activeKey,
  onNav,
  onLogout,
  children,
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #e5e7eb", padding: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{appTitle}</div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#f9fafb" }}>
          <div style={{ fontWeight: 700 }}>{user.full_name || "User"}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{user.email}</div>
          <div style={{ marginTop: 6, fontSize: 12 }}>
            Role: <b>{user.role}</b>
          </div>
          <div style={{ marginTop: 6, fontSize: 12 }}>
            Token: <b>{getToken() ? "✅" : "❌"}</b>
          </div>
          <div style={{ marginTop: 6, fontSize: 12 }}>
            Health: <b>{healthOk ? "✅" : `❌ ${healthError || ""}`}</b>
          </div>
        </div>

        <nav style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {navItems.map((it) => (
            <button
              key={it.key}
              onClick={() => onNav(it.key)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: activeKey === it.key ? "#111827" : "white",
                color: activeKey === it.key ? "white" : "#111827",
                cursor: "pointer",
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ef4444",
            background: "white",
            color: "#ef4444",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ padding: 18 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "white" }}>
          {children}
        </div>
      </main>
    </div>
  );
}