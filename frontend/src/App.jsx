import React, { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import { request, getToken, clearToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState("upload"); // upload | jobs | analyze | feedback | admin

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("Junior Developer");
  const [jobDescription, setJobDescription] = useState("React, Node.js, Express, SQLite, Git");
  const [selectedJobId, setSelectedJobId] = useState("");

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [ranked, setRanked] = useState(null);

  // Feedback state
  const [feedbackText, setFeedbackText] = useState("Great match on core skills. Consider adding more project examples.");
  const [feedbackList, setFeedbackList] = useState([]);

  // Admin state
  const [users, setUsers] = useState([]);
  const [roleEdits, setRoleEdits] = useState({}); // userId -> role

  const tokenExists = useMemo(() => Boolean(getToken()), [user]);
  const canCreateJob = useMemo(() => Boolean(user && (user.role === "admin" || user.role === "hr" || user.role === "recruiter")), [user]);
  const isAdmin = useMemo(() => Boolean(user && user.role === "admin"), [user]);

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

  async function refreshJobs() {
    try {
      const list = await request("/jobs");
      setJobs(list);
      if (!selectedJobId && list?.[0]?.id) setSelectedJobId(String(list[0].id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function refreshAdminUsers() {
    if (!isAdmin) return;
    try {
      const list = await request("/auth/users");
      setUsers(list);
      const next = {};
      list.forEach((u) => (next[u.id] = u.role));
      setRoleEdits(next);
    } catch (e) {
      setError(e.message);
    }
  }

  // Load jobs after login
  useEffect(() => {
    if (!user) return;
    refreshJobs();
    refreshAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function logout() {
    clearToken();
    setUser(null);
    setTab("upload");
    setToast("Logged out");
    setError("");
    setUploadedResume(null);
    setAnalysisResult(null);
    setRanked(null);
    setUsers([]);
    setJobs([]);
  }

  async function uploadResume() {
    if (!resumeFile) return setToast("Choose a PDF/DOCX resume first");
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      // server uses auth token, but also accepts user_id; we can omit user_id safely
      const data = await request("/resume/upload", { method: "POST", body: fd });
      setUploadedResume(data);
      setToast("Resume uploaded ✅");
      setTab("analyze");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createJob() {
    if (!canCreateJob) return setError("Only logged-in recruiter/hr/admin can create jobs");
    if (!jobTitle.trim() || !jobDescription.trim()) return setToast("Enter title and description");
    setBusy(true);
    setError("");
    try {
      const data = await request("/jobs", {
        method: "POST",
        body: JSON.stringify({ title: jobTitle, description: jobDescription }),
      });
      setToast(`Job created ✅ (id ${data.id})`);
      await refreshJobs();
      setSelectedJobId(String(data.id));
      setTab("analyze");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function analyzeScore() {
    const resume_id = uploadedResume?.resume_id;
    const job_id = Number(selectedJobId);

    if (!resume_id) return setError("Upload a resume first.");
    if (!job_id) return setError("Select a job first.");

    setBusy(true);
    setError("");
    try {
      const data = await request(`/analysis/score/${resume_id}/${job_id}`);
      setAnalysisResult(data);
      setToast("Analysis complete ✅");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function analyzeRank() {
    const job_id = Number(selectedJobId);
    if (!job_id) return setError("Select a job first.");

    setBusy(true);
    setError("");
    try {
      const data = await request(`/analysis/rank/${job_id}`);
      setRanked(data);
      setToast("Ranking loaded ✅");
      setTab("analyze");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadFeedback() {
    const resume_id = uploadedResume?.resume_id;
    if (!resume_id) return setError("Upload a resume first.");
    setBusy(true);
    setError("");
    try {
      const list = await request(`/feedback/resume/${resume_id}`);
      setFeedbackList(list);
      setToast("Feedback loaded ✅");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createFeedback() {
    const resume_id = uploadedResume?.resume_id;
    const job_id = Number(selectedJobId);
    if (!resume_id) return setError("Upload a resume first.");
    if (!job_id) return setError("Select a job first.");
    if (!feedbackText.trim()) return setToast("Write feedback text");

    setBusy(true);
    setError("");
    try {
      await request("/feedback", {
        method: "POST",
        body: JSON.stringify({ resume_id, job_id, feedback_text: feedbackText }),
      });
      setToast("Feedback created ✅");
      await loadFeedback();
      setTab("feedback");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveRole(userId) {
    const role = roleEdits[userId];
    if (!role) return;
    setBusy(true);
    setError("");
    try {
      await request("/auth/set-role", {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
      setToast("Role updated ✅");
      await refreshAdminUsers();
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

  const TabBtn = ({ id, label, show = true }) => {
    if (!show) return null;
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          border: active ? "2px solid #111" : "1px solid #ddd",
          background: active ? "#f3f3f3" : "#fff",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Auto Resume Screening</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Backend:</strong>{" "}
        {health?.ok ? "✅ OK" : error ? `❌ ${error}` : "Loading..."}
      </div>

      {toast && (
        <div style={{ background: "#111", color: "#fff", display: "inline-block", padding: 10, borderRadius: 10, marginBottom: 10 }}>
          {toast}
        </div>
      )}

      {!user ? (
        <Login
          onLogin={(u) => {
            setUser(u);
            setToast(`Logged in as ${u.role} ✅`);
          }}
        />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              Logged in as <b>{user.full_name}</b> ({user.email}) — role: <b>{user.role}</b>
              <div style={{ fontSize: 12, marginTop: 4 }}>Token: {tokenExists ? "✅ stored" : "❌ missing"}</div>
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
            <TabBtn id="upload" label="Upload Resume" />
            <TabBtn id="jobs" label="Jobs" />
            <TabBtn id="analyze" label="Analyze & Ranking" />
            <TabBtn id="feedback" label="Feedback" />
            <TabBtn id="admin" label="Admin Panel" show={isAdmin} />
          </div>

          {/* Upload */}
          {tab === "upload" && (
            <Card title="Upload Resume (PDF/DOCX, max 10MB)">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <div style={{ marginTop: 10 }}>
                <button onClick={uploadResume} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Uploading..." : "Upload"}
                </button>
              </div>

              {uploadedResume && (
                <div style={{ marginTop: 10, fontSize: 14 }}>
                  <b>Resume ID:</b> {uploadedResume.resume_id} <br />
                  <b>File:</b> {uploadedResume.original_name}
                </div>
              )}
            </Card>
          )}

          {/* Jobs */}
          {tab === "jobs" && (
            <Card title="Jobs (Create + List)">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Title</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ padding: 8 }} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Description / Skills (comma or new line separated)</label>
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} style={{ padding: 8 }} />
                </div>
                <button onClick={createJob} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Creating..." : "Create Job"}
                </button>

                <hr />

                <button onClick={refreshJobs} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  Refresh Job List
                </button>

                <div>
                  <label>Select Job</label>
                  <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                    <option value="">-- choose --</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        #{j.id} — {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: 12, color: "#555" }}>
                  Tip: Admin/HR/Recruiter can create jobs. Recruiter can still analyze using existing jobs.
                </div>
              </div>
            </Card>
          )}

          {/* Analyze */}
          {tab === "analyze" && (
            <Card title="Analyze Score + Ranking">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <b>Selected Job:</b> {selectedJobId || "None"}
                </div>
                <div>
                  <b>Uploaded Resume:</b> {uploadedResume?.resume_id || "None"}
                </div>

                <button onClick={analyzeScore} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Analyzing..." : "Score this Resume vs Job"}
                </button>

                <button onClick={analyzeRank} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Loading..." : "Rank ALL Resumes for this Job"}
                </button>

                {analysisResult && (
                  <div style={{ marginTop: 10 }}>
                    <h4 style={{ marginBottom: 6 }}>Score Result</h4>
                    <div>Score: <b>{analysisResult.score_percentage}%</b></div>
                    <div>Matched: {analysisResult.matched_skills?.join(", ") || "-"}</div>
                  </div>
                )}

                {ranked && (
                  <div style={{ marginTop: 10 }}>
                    <h4 style={{ marginBottom: 6 }}>Ranked List</h4>
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      {ranked.ranked?.slice(0, 10).map((r, idx) => (
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
              </div>
            </Card>
          )}

          {/* Feedback */}
          {tab === "feedback" && (
            <Card title="Feedback">
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={loadFeedback} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Loading..." : "Load Feedback for Uploaded Resume"}
                </button>

                <div style={{ display: "grid", gap: 6 }}>
                  <label>Write Feedback (for selected job + uploaded resume)</label>
                  <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={5} style={{ padding: 8 }} />
                </div>

                <button onClick={createFeedback} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  {busy ? "Saving..." : "Create Feedback"}
                </button>

                <div>
                  <h4 style={{ marginBottom: 6 }}>Feedback History</h4>
                  {feedbackList.length === 0 ? (
                    <div style={{ color: "#555" }}>No feedback yet.</div>
                  ) : (
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      {feedbackList.map((f) => (
                        <div key={f.id} style={{ padding: "8px 0", borderBottom: "1px solid #f2f2f2" }}>
                          <div style={{ fontSize: 12, color: "#555" }}>
                            #{f.id} — resume {f.resume_id} job {f.job_id}
                          </div>
                          <div>{f.feedback_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Admin */}
          {tab === "admin" && isAdmin && (
            <Card title="Admin Panel (Manage Users & Roles)">
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={refreshAdminUsers} disabled={busy} style={{ padding: "8px 12px", borderRadius: 10 }}>
                  Refresh Users
                </button>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                  {users.map((u) => (
                    <div key={u.id} style={{ padding: "10px 0", borderBottom: "1px solid #f2f2f2" }}>
                      <div>
                        <b>{u.full_name || "No name"}</b> — {u.email} (id: {u.id})
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                        <select
                          value={roleEdits[u.id] || u.role}
                          onChange={(e) => setRoleEdits((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          style={{ padding: 6 }}
                        >
                          <option value="admin">admin</option>
                          <option value="hr">hr</option>
                          <option value="recruiter">recruiter</option>
                        </select>
                        <button onClick={() => saveRole(u.id)} disabled={busy} style={{ padding: "6px 10px", borderRadius: 10 }}>
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}