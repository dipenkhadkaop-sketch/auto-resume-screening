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

  // Jobs / Analyze
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  // Create job (staff)
  const [jobTitle, setJobTitle] = useState("Frontend Developer");
  const [jobDescription, setJobDescription] = useState("react, node.js, express, sqlite, git");

  // Analysis
  const [analysis, setAnalysis] = useState(null);
  const [ranking, setRanking] = useState(null);

  // Admin users (optional)
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

    if (!selectedJobId && list?.length) {
      setSelectedJobId(String(list[0].id));
    }
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

    if (isStaff) refreshJobs().catch(() => {});
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

      const newId = r.job_id ?? r.id; // supports either
      setToast(`Job created ✅ (id ${newId ?? "?"})`);

      await refreshJobs();
      if (newId) setSelectedJobId(String(newId));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function runScore() {
    setError("");
    if (!selectedJobId) return setError("Select a job first.");
    if (!uploadedResume?.resume_id) return setError("No uploaded resume found (upload as candidate first).");

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
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 16, background: "#fff", marginTop: 12 }}>
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
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth: 1050, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8, fontSize: 56, letterSpacing: -1 }}>Auto Resume Screening</h1>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 18 }}>
          Logged in as <b>{user.full_name || "User"}</b> ({user.email}) — role: <b>{role}</b>
          <div style={{ fontSize: 13, marginTop: 6 }}>Token stored: {tokenExists ? "✅" : "❌"}</div>
        </div>
        <button onClick={logout} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #eee", background: "#f7f7f7" }}>
          Logout
        </button>
      </div>

      {toast && (
        <div style={{ marginTop: 10, background: "#111", color: "#fff", padding: 10, borderRadius: 12, display: "inline-block" }}>
          {toast}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, color: "crimson", fontSize: 18 }}>
          <b>Error:</b> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button onClick={() => setTab("dashboard")} style={tabBtn(tab === "dashboard")}>Dashboard</button>

        {isCandidate && <button onClick={() => setTab("upload")} style={tabBtn(tab === "upload")}>Upload Resume</button>}

        {isStaff && <button onClick={() => setTab("jobs")} style={tabBtn(tab === "jobs")}>Jobs</button>}
        {isStaff && <button onClick={() => setTab("rank")} style={tabBtn(tab === "rank")}>Analyze & Rank</button>}

        {isAdmin && <button onClick={() => setTab("admin")} style={tabBtn(tab === "admin")}>Admin</button>}
      </div>

      {tab === "dashboard" && (
        <Card title="Dashboard">
          {isCandidate ? (
            <>
              <p style={{ marginTop: 0 }}>✅ Candidate account. Upload your resume to be screened.</p>
              <p>Latest uploaded resume: <b>{uploadedResume?.resume_id || "None"}</b></p>
            </>
          ) : (
            <>
              <p style={{ marginTop: 0 }}>✅ Staff account ({role}). Create jobs and rank candidates.</p>
              <p style={{ color: "#666" }}>Ranking uses resumes already uploaded in the database.</p>
            </>
          )}
        </Card>
      )}

      {tab === "upload" && isCandidate && (
        <Card title="Candidate: Upload Resume (PDF/DOCX ≤10MB)">
          <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 12 }}>
            <button onClick={uploadResume} disabled={busy} style={primaryBtn}>
              {busy ? "Uploading..." : "Upload"}
            </button>
          </div>
        </Card>
      )}

      {tab === "jobs" && isStaff && (
        <Card title="Staff: Create Job + Select Job">
          <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <b>Job Title</b>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={input} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <b>Description / Skills (comma or newline separated)</b>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} style={input} />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={createJob} disabled={busy} style={primaryBtn}>
                {busy ? "Creating..." : "Create Job"}
              </button>
              <button onClick={() => refreshJobs()} disabled={busy} style={secondaryBtn}>
                Refresh Jobs
              </button>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <b>Select Job</b>
              <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} style={input}>
                {jobs.length === 0 && <option value="">No jobs yet</option>}
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    #{j.id} — {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {tab === "rank" && isStaff && (
        <Card title="Staff: Analyze & Rank">
          <div style={{ marginBottom: 10 }}>
            Selected Job: <b>{selectedJobId || "None"}</b>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={runRank} disabled={busy} style={primaryBtn}>
              {busy ? "Working..." : "Rank ALL resumes"}
            </button>

            <button onClick={runScore} disabled={busy} style={secondaryBtn}>
              {busy ? "Working..." : "Score last uploaded resume"}
            </button>
          </div>

          {analysis && (
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
              <div style={{ fontWeight: 800 }}>Score result</div>
              <div style={{ marginTop: 6 }}>
                Resume <b>{analysis.resume_id}</b> vs Job <b>{analysis.job_id}</b> — <b>{analysis.score_percentage}%</b>
              </div>
            </div>
          )}

          {ranking?.ranked?.length ? (
            <div style={{ marginTop: 14 }}>
              {ranking.ranked.slice(0, 15).map((r, idx) => (
                <div key={r.resume_id} style={{ padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>
                    #{idx + 1} Resume {r.resume_id} — {r.score_percentage}%
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      )}

      {tab === "admin" && isAdmin && (
        <Card title="Admin: Manage Users & Roles">
          <button onClick={() => refreshUsers()} disabled={busy} style={secondaryBtn}>Refresh Users</button>

          <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            {users.map((u) => (
              <div key={u.id} style={{ padding: "12px 0", borderBottom: "1px solid #f2f2f2" }}>
                <div style={{ fontWeight: 700 }}>
                  {u.full_name || "No name"} — {u.email} (id {u.id})
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                  <select
                    value={roleEdits[u.id] || u.role}
                    onChange={(e) => setRoleEdits((p) => ({ ...p, [u.id]: e.target.value }))}
                    style={{ padding: 8, borderRadius: 10, border: "1px solid #ddd" }}
                  >
                    <option value="admin">admin</option>
                    <option value="hr">hr</option>
                    <option value="recruiter">recruiter</option>
                    <option value="candidate">candidate</option>
                  </select>

                  <button onClick={() => saveRole(u.id)} disabled={busy} style={primaryBtn}>Save</button>
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
    padding: "10px 14px",
    borderRadius: 14,
    border: active ? "2px solid #111" : "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  };
}

const input = { width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd" };
const primaryBtn = { padding: "10px 14px", borderRadius: 14, background: "#111", color: "#fff", border: "1px solid #111", cursor: "pointer" };
const secondaryBtn = { padding: "10px 14px", borderRadius: 14, background: "#fff", border: "1px solid #ddd", cursor: "pointer" };