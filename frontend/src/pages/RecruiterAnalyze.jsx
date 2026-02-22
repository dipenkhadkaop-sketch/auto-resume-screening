import Navbar from "../components/Navbar";

export default function RecruiterAnalyze() {
  return (
    <div>
      <Navbar
        links={[
          { href: "/recruiter", label: "Jobs" },
          { href: "/recruiter/analyze", label: "Analyze Resumes" },
          { href: "/recruiter/ranked", label: "Ranked Candidates" },
          { href: "/recruiter/users", label: "Manage Users" },
        ]}
      />

      <div style={{ padding: 30 }}>
        <h1>Analyze Resumes</h1>
        <p>Next: we connect this to backend scoring.</p>
      </div>
    </div>
  );
}