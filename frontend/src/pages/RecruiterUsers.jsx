import Navbar from "../components/Navbar";

export default function RecruiterUsers() {
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
        <h1>Manage Users</h1>
        <p>Next: list users from database.</p>
      </div>
    </div>
  );
}