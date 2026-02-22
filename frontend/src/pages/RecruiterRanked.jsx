import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { request } from "../api/request";

export default function RecruiterRanked() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Change 1/1 later when we make it dynamic
        const res = await request("/resume/score/1/1");
        setData(res);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

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
        <h1>Ranked Candidates</h1>

        {error && <p style={{ color: "red" }}>❌ {error}</p>}
        {!data && !error && <p>Loading...</p>}

        {data && (
          <div
            style={{
              marginTop: 20,
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              maxWidth: 900,
            }}
          >
            <table width="100%">
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th>Resume ID</th>
                  <th>Score</th>
                  <th>Matched Skills</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.resume_id}</td>
                  <td>
                    <span
                      style={{
                        background:
                          data.score_percentage > 70
                            ? "#16a34a"
                            : "#f59e0b",
                        color: "white",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                      }}
                    >
                      {data.score_percentage}%
                    </span>
                  </td>
                  <td>{data.matched_skills?.join(", ")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}