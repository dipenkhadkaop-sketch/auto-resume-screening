import React, { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import { request, clearToken, getToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // Candidate upload
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);

  // Jobs / Analyze (Recruiter/HR/Admin)
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("Junior Developer");
  const [jobDescription, setJobDescription] = useState("React, Node.js, Express, SQLite, Git");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [ranking, setRanking] = useState(null);

  // Admin users
  const [users, setUsers] = useState([]);
  const [roleEdits, setRoleEdits] = useState({});

  const role = user?.role;
  const tokenExists = useMemo(() => Boolean(getToken()), [user]);

  const isCandidate = role === "candidate";
  const isStaff = role === "recruiter" || role === "hr" || role === "admin";
  const isAdmin = role === "admin";

  useEffect(() => {
    (async () => {
      try {
        const h = await request("/health");
        setHealth(h);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  async function refreshJobs() {
    const list = await request("/jobs");
    setJobs(list);
    if (!selectedJobId && list?.[0]?.id) setSelectedJobId(String(list[0].id));
  }

  async function refreshUsers() {
    const list = await request("/auth/users");
    setUsers(list);
    const next = {};
    list.forEach((u) => (next[u.id] = u.role));
    setRoleEdits(next);
  }

  useEffect(() => {
    if (!user) return;
    refreshJobs().catch(() => {});
    if (isAdmin) refreshUsers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function logout() {
    clearToken();
    localStorage.removeItem("user");
    setUser(null);
    setTab("dashboard");
    setToast("Logged out");
    setUploadedResume(null);
    setAnalysis(null);
    setRanking(null);
    setError("");
  }

  async function uploadResume() {
    setError("");
    if (!resumeFile) return setToast("Choose a PDF/DOCX file first");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);

      const r = await request("/resume/upload", { method: "POST", body: fd });
      setUploadedResume(r);
      setToast("Resume uploaded ✅");
      setTab("dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createJob() {
    setError("");
    if (!jobTitle.trim() || !jobDescription.trim()) return setToast("Enter title + description");
    setBusy(true);
    try {
      const r = await request("/jobs", {
        method: "POST",
        body: JSON.stringify({ title: jobTitle, description: jobDescription }),
      });
      setToast(`Job created ✅ (id ${r.id})`);
      await refreshJobs();
      setSelectedJobId(String(r.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function runScore() {
    setError("");
    if (!uploadedResume?.resume_id) return setError("No resume uploaded yet (need candidate upload).");
    if (!selectedJobId) return setError("Select a job first.");

    setBusy(true);
    try {
      const r = await request(`/analysis/score/${uploadedResume.resume_id}/${Number(selectedJobId)}`);
      setAnalysis(r);
      setToast("Scored ✅");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function runRank() {
    setError("");
    if (!selectedJobId) return setError("Select a job first.");

    setBusy(true);
    try {
      const r = await request(`/analysis/rank/${Number(selectedJobId)}`);
      setRanking(r);
      setToast("Ranked ✅");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveRole(userId) {
    setError("");
    setBusy(true);
    try {
      await request("/auth/set-role", {
        method: "POST",
        body: JSON.stringify({ userId, role: roleEdits[userId] }),
      });
      setToast("Role updated ✅");
      await refreshUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const Card = ({ title, children }) => (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, background: "#fff", marginTop: 12 }}>
      <h3 style={{ margin: 0, marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );

  if (!user) {
    return (
      <div>
        <div style={{ padding: 12 }}>
          <strong>Backend health:</strong>{" "}
          {health?.ok ? "✅ OK" : error ? `❌ ${error}` : "Loading..."}
        </div>
        <Login onLogin={(u) => setUser(u)} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Auto Resume Screening</h1>

      {toast && (
        <div style={{ background: "#111", color: "#fff", padding: 10, borderRadius: 10, display: "inline-block" }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
        <div>
          Logged in as <b>{user.full_name || "User"}</b> ({user.email}) — role: <b>{role}</b>
          <div style={{ fontSize: 12, marginTop: 4 }}>Token stored: {tokenExists ? "✅" : "❌"}</div>
        </div>
        <button onClick={logout} style={{ padding: "8px 12px", borderRadius: 10 }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "crimson" }}>
          <b>Error:</b> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button onClick={() => setTab("dashboard")} style={tabBtn(tab === "dashboard")}>Dashboard</button>

        {isCandidate && <button onClick={() => setTab("upload")} style={tabBtn(tab === "upload")}>Upload Resume</button>}

        {isStaff && <button onClick={() => setTab("jobs")} style={tabBtn(tab === "jobs")}>Jobs</button>}
        {isStaff && <button onClick={() => setTab("analyze")} style={tabBtn(tab === "analyze")}>Analyze & Rank</button>}

        {isAdmin && <button onClick={() => setTab("admin")} style={tabBtn(tab === "admin")}>Admin</button>}
      </div>

      {tab === "dashboard" && (
        <Card title="Dashboard">
          {isCandidate ? (
            <>
              <p>✅ You are a Candidate. You can upload your resume.</p>
              <p>Uploaded resume: <b>{uploadedResume?.resume_id || "None"}</b></p>
            </>
          ) : (
            <>
              <p>✅ You are Staff ({role}). You can create jobs and rank candidates.</p>
              <p>Note: Candidate must upload resume first.</p>
            </>
          )}
        </Card>
      )}

      {tab === "upload" && isCandidate && (
        <Card title="Candidate: Upload Resume (PDF/DOCX ≤10MB)">
          <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 10 }}>
            <button onClick={uploadResume} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
              {busy ? "Uploading..." : "Upload"}
            </button>
          </div>
          {uploadedResume && (
            <div style={{ marginTop: 10 }}>
              Resume ID: <b>{uploadedResume.resume_id}</b> <br />
              File: {uploadedResume.original_name}
            </div>
          )}
        </Card>
      )}

      {tab === "jobs" && isStaff && (
        <Card title="Staff: Create Job + Select Job">
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Title
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={input} />
            </label>
            <label>
              Description / Skills (comma or new line separated)
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} style={input} />
            </label>
            <button onClick={createJob} disabled={busy} style={primaryBtn}>
              {busy ? "Creating..." : "Create Job"}
            </button>

            <hr />

            <button onClick={() => refreshJobs()} disabled={busy} style={secondaryBtn}>
              Refresh Jobs
            </button>

            <label>
              Select Job
              <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} style={input}>
                <option value="">-- choose --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    #{j.id} — {j.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>
      )}

      {tab === "analyze" && isStaff && (
        <Card title="Staff: Analyze Score + Rank Candidates">
          <div style={{ marginBottom: 10 }}>
            Selected Job: <b>{selectedJobId || "None"}</b>
          </div>

          <button onClick={runScore} disabled={busy} style={primaryBtn}>
            {busy ? "Working..." : "Score (uploaded resume vs selected job)"}
          </button>

          <button onClick={runRank} disabled={busy} style={{ ...secondaryBtn, marginLeft: 8 }}>
            {busy ? "Working..." : "Rank ALL resumes for selected job"}
          </button>

          {analysis && (
            <div style={{ marginTop: 12 }}>
              <b>Score:</b> {analysis.score_percentage}% <br />
              <b>Matched:</b> {analysis.matched_skills?.join(", ") || "-"}
            </div>
          )}

          {ranking && (
            <div style={{ marginTop: 12 }}>
              <b>Ranking Top 10:</b>
              <div style={{ marginTop: 8, border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                {ranking.ranked?.slice(0, 10).map((r, idx) => (
                  <div key={r.resume_id} style={{ padding: "8px 0", borderBottom: "1px solid #f2f2f2" }}>
                    <b>#{idx + 1}</b> Resume {r.resume_id} — <b>{r.score_percentage}%</b>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      Matched: {r.matched_skills?.join(", ") || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === "admin" && isAdmin && (
        <Card title="Admin: Manage Users & Roles">
          <button onClick={() => refreshUsers()} disabled={busy} style={secondaryBtn}>
            Refresh Users
          </button>

          <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            {users.map((u) => (
              <div key={u.id} style={{ padding: "10px 0", borderBottom: "1px solid #f2f2f2" }}>
                <div>
                  <b>{u.full_name || "No name"}</b> — {u.email} (id {u.id})
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <select
                    value={roleEdits[u.id] || u.role}
                    onChange={(e) => setRoleEdits((p) => ({ ...p, [u.id]: e.target.value }))}
                    style={{ padding: 6 }}
                  >
                    <option value="admin">admin</option>
                    <option value="hr">hr</option>
                    <option value="recruiter">recruiter</option>
                    <option value="candidate">candidate</option>
                  </select>

                  <button onClick={() => saveRole(u.id)} disabled={busy} style={primarySmall}>
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function tabBtn(active) {
  return {
    padding: "8px 12px",
    borderRadius: 10,
    border: active ? "2px solid #111" : "1px solid #ddd",
    background: active ? "#f3f3f3" : "#fff",
    cursor: "pointer",
  };
}

const input = { width: "100%", padding: 8, marginTop: 6 };
const primaryBtn = { padding: "8px 12px", borderRadius: 10, background: "#111", color: "#fff", border: "1px solid #111" };
const secondaryBtn = { padding: "8px 12px", borderRadius: 10, background: "#fff", border: "1px solid #ddd" };
const primarySmall = { padding: "6px 10px", borderRadius: 10, background: "#111", color: "#fff", border: "1px solid #111" };