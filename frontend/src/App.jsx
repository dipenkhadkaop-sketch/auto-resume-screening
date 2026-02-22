import React, { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import { request, getToken, clearToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  // UI
  const [tab, setTab] = useState("upload"); // upload | job | analyze | results
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  // Resume
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUserId, setResumeUserId] = useState(1);
  const [uploadedResume, setUploadedResume] = useState(null);

  // Job
  const [jobTitle, setJobTitle] = useState("Junior Developer");
  const [jobDescription, setJobDescription] = useState(
    "React, Node.js, Express, SQLite, Git, API integration"
  );
  const [createdJob, setCreatedJob] = useState(null);

  // Analysis
  const [analysisResult, setAnalysisResult] = useState(null);

  const tokenExists = useMemo(() => Boolean(getToken()), [user]);
  const canCreateJob = useMemo(
    () => Boolean(user && (user.role === "admin" || user.role === "hr")),
    [user]
  );

  // Health check
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

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function logout() {
    clearToken();
    setUser(null);
    setTab("upload");
    setUploadedResume(null);
    setCreatedJob(null);
    setAnalysisResult(null);
    setError("");
    setToast("Logged out");
  }

  async function handleUploadResume() {
    if (!resumeFile) return setToast("Please choose a resume file first");
    setBusy(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("user_id", String(resumeUserId));

      const data = await request("/resume/upload", {
        method: "POST",
        body: fd,
      });

      setUploadedResume(data);
      setToast("Resume uploaded ✅");
      setTab(canCreateJob ? "job" : "analyze"); // recruiter can skip job creation
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateJob() {
    if (!canCreateJob) {
      setError("Only admin or hr can create jobs.");
      return;
    }

    if (!jobTitle.trim() || !jobDescription.trim()) {
      return setToast("Please enter job title + description");
    }

    setBusy(true);
    setError("");

    try {
      // ✅ Your backend route is POST /jobs (see job.routes.js)
      const data = await request("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
        }),
      });

      // backend returns { id: lastID }
      setCreatedJob(data);
      setToast("Job created ✅");
      setTab("analyze");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalyze() {
    const resume_id =
      uploadedResume?.resume_id ?? uploadedResume?.id ?? uploadedResume?.resumeId ?? null;

    const job_id = createdJob?.id ?? createdJob?.job_id ?? createdJob?.jobId ?? null;

    if (!resume_id) return setToast("Upload a resume first");

    // If recruiter didn’t create a job, they must select an existing job ID
    if (!job_id) {
      return setError(
        "No Job ID found. Admin/HR must create a job first, or you need to select an existing job."
      );
    }

    setBusy(true);
    setError("");

    try {
      // try analysis route first, fallback to resume score
      let data;
      try {
        data = await request(`/analysis/score/${resume_id}/${job_id}`);
      } catch {
        data = await request(`/resume/score/${resume_id}/${job_id}`);
      }

      setAnalysisResult(data);
      setToast("Analysis complete ✅");
      setTab("results");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // UI helpers
  const Card = ({ title, children }) => (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        background: "#fff",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );

  const TabButton = ({ id, label, disabled }) => (
    <button
      onClick={() => setTab(id)}
      disabled={disabled}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: tab === id ? "2px solid #111" : "1px solid #ddd",
        background: tab === id ? "#f3f3f3" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Auto Resume Screening</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Backend health:</strong>{" "}
        {health?.ok ? "✅ OK" : error ? `❌ ${error}` : "Loading..."}
      </div>

      {toast && (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            display: "inline-block",
            marginBottom: 12,
          }}
        >
          {toast}
        </div>
      )}

      {!user ? (
        <Login
          onLogin={(u) => {
            setUser(u);
            setToast(`Logged in as ${u.role} ✅`);
            setTab("upload");
          }}
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              Logged in as <b>{user.full_name}</b> ({user.email}) — role: <b>{user.role}</b>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Token: {tokenExists ? "✅ stored" : "❌ missing"}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Job permission: {canCreateJob ? "✅ Can create jobs (Admin/HR)" : "❌ Recruiter/User"}
              </div>
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

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <TabButton id="upload" label="1) Upload Resume" disabled={!user} />
            <TabButton
              id="job"
              label="2) Create Job (Admin/HR)"
              disabled={!user || !canCreateJob}
            />
            <TabButton id="analyze" label="3) Analyze" disabled={!user} />
            <TabButton id="results" label="4) Results" disabled={!user} />
          </div>

          {/* Upload */}
          {tab === "upload" && (
            <Card title="Upload Resume">
              <div style={{ display: "grid", gap: 10 }}>
                <label>
                  User ID (demo):
                  <input
                    type="number"
                    value={resumeUserId}
                    onChange={(e) => setResumeUserId(Number(e.target.value))}
                    style={{ width: "100%", padding: 8, marginTop: 6 }}
                  />
                </label>

                <label>
                  Choose PDF/DOCX resume:
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    style={{ width: "100%", padding: 8, marginTop: 6 }}
                  />
                </label>

                <button
                  onClick={handleUploadResume}
                  disabled={busy}
                  style={{ padding: "10px 12px", borderRadius: 10 }}
                >
                  {busy ? "Uploading..." : "Upload Resume"}
                </button>

                {uploadedResume && (
                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    <b>Resume ID:</b>{" "}
                    {uploadedResume.resume_id ?? uploadedResume.id ?? uploadedResume.resumeId}
                    <br />
                    <b>File:</b> {uploadedResume.original_name || uploadedResume.originalName || "—"}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Job */}
          {tab === "job" && (
            <Card title="Create Job (Admin/HR only)">
              {!canCreateJob ? (
                <div style={{ color: "#444" }}>
                  You are logged in as <b>{user.role}</b>. Only <b>admin</b> or <b>hr</b> can create
                  jobs.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <label>
                    Job Title
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      style={{ width: "100%", padding: 8, marginTop: 6 }}
                    />
                  </label>

                  <label>
                    Job Description / Required Skills
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                      style={{ width: "100%", padding: 8, marginTop: 6 }}
                    />
                  </label>

                  <button
                    onClick={handleCreateJob}
                    disabled={busy}
                    style={{ padding: "10px 12px", borderRadius: 10 }}
                  >
                    {busy ? "Creating..." : "Create Job"}
                  </button>

                  {createdJob && (
                    <div style={{ marginTop: 8, fontSize: 14 }}>
                      <b>Created Job ID:</b> {createdJob.id}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Analyze */}
          {tab === "analyze" && (
            <Card title="Analyze Resume vs Job">
              <div style={{ fontSize: 14, marginBottom: 10 }}>
                <div>
                  <b>Resume ID:</b>{" "}
                  {uploadedResume?.resume_id ?? uploadedResume?.id ?? uploadedResume?.resumeId ?? "—"}
                </div>
                <div>
                  <b>Job ID:</b> {createdJob?.id ?? "—"}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={busy}
                style={{ padding: "10px 12px", borderRadius: 10 }}
              >
                {busy ? "Analyzing..." : "Run Analysis"}
              </button>

              <div style={{ fontSize: 13, color: "#444", marginTop: 10 }}>
                Uses <code>/analysis/score</code> (fallback: <code>/resume/score</code>)
              </div>
            </Card>
          )}

          {/* Results */}
          {tab === "results" && (
            <Card title="Results">
              {!analysisResult ? (
                <div>Run analysis first.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontSize: 18 }}>
                    Score:{" "}
                    <b>
                      {analysisResult.score_percentage ??
                        analysisResult.score ??
                        analysisResult.scorePercentage ??
                        "—"}
                      %
                    </b>
                  </div>

                  {analysisResult.matched_skills && (
                    <div>
                      <b>Matched skills:</b> {analysisResult.matched_skills.join(", ")}
                    </div>
                  )}

                  <details>
                    <summary>Raw JSON</summary>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}