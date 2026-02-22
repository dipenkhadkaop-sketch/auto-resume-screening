import Navbar from "../components/Navbar";

export default function CandidateDashboard() {
  return (
    <div>
      <Navbar
        links={[
          { href: "/candidate", label: "Home" },
          { href: "/candidate/upload", label: "Upload Resume" },
          { href: "/candidate/feedback", label: "View Feedback" },
        ]}
      />

      <div style={{ padding: 30 }}>
        <h1 style={{ marginBottom: 20 }}>Candidate Dashboard</h1>

        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 20,
            maxWidth: 700,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Resume Upload Status</h2>
          <a href="/candidate/upload">
            <button
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#0b4cb8",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Upload New Resume
            </button>
          </a>

          <hr style={{ margin: "20px 0" }} />

          <h2>Latest Feedback Reports</h2>
          <ul style={{ marginTop: 10 }}>
            <li><a href="/candidate/feedback">Feedback Report 1</a></li>
            <li><a href="/candidate/feedback">Feedback Report 2</a></li>
            <li><a href="/candidate/feedback">Feedback Report 3</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}