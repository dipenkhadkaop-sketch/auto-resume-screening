import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { request } from "../api/request";

export default function CandidateFeedback() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Example based on your curl:
        // GET /resume/score/:resume_id/:job_id
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
          { href: "/candidate", label: "Home" },
          { href: "/candidate/upload", label: "Upload Resume" },
          { href: "/candidate/feedback", label: "View Feedback" },
        ]}
      />

      <div style={{ padding: 30 }}>
        <h1>View Feedback</h1>

        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        {!data && !error && <p>Loading...</p>}

        {data && (
          <div
            style={{
              marginTop: 18,
              background: "white",
              padding: 20,
              borderRadius: 14,
              maxWidth: 700,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <p><b>Score:</b> {data.score_percentage}%</p>
            <p><b>Matched Skills:</b> {data.matched_skills?.join(", ")}</p>
            <p>
              <b>Matched Count:</b> {data.matched_count} / {data.total_required}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}