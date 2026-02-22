export default function Navbar({ links = [] }) {
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  }

  return (
    <div
      style={{
        background: "#0b4cb8",
        color: "white",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 800 }}>Resume Screening Tool</div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {l.label}
          </a>
        ))}

        <button
          onClick={logout}
          style={{
            background: "white",
            color: "#0b4cb8",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}