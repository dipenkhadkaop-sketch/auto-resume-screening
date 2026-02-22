export default function AdminDashboard() {
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>
      <p>✅ Logged in as Admin</p>
      <button
        onClick={logout}
        style={{ padding: 10, borderRadius: 8, border: "none", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
}