import Navbar from "./Navbar";

export default function DashboardLayout({ title, children }) {
  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1 style={{ marginBottom: "20px" }}>{title}</h1>

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}