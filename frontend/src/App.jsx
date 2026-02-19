import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ===== LocalStorage helpers =====
function getToken() {
  return localStorage.getItem("token");
}
function setToken(t) {
  localStorage.setItem("token", t);
}
function clearToken() {
  localStorage.removeItem("token");
}

function getSavedUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function setSavedUser(u) {
  localStorage.setItem("user", JSON.stringify(u));
}
function clearSavedUser() {
  localStorage.removeItem("user");
}

// ===== request helper =====
async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  // JSON body => set content-type
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // ✅ IMPORTANT: don't attach token to /auth routes
  if (token && !path.startsWith("/auth")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export default function App() {
  const [page, setPage] = useState(getToken() ? "upload" : "login");
  const [user, setUser] = useState(getSavedUser());

  // auth form
  const [fullName, setFullName] = useState("Dipen");
  const [email, setEmail] = useState("dipen@test.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // upload
  const [file, setFile] = useState(null);

  // jobs + ranking
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("Junior Developer");
  const [jobDesc, setJobDesc] = useState("JavaScript, Node.js, SQL, Git, REST APIs");
  const [jobId, setJobId] = useState("");
  const [results, setResults] = useState([]);

  // Load jobs when entering rank page
  useEffect(() => {
    if (page !== "rank") return;

    (async () => {
      try {
        setErr("");
        const list = await request("/jobs", { method: "GET" });
        const safe = Array.isArray(list) ? list : [];
        setJobs(safe);
        if (safe.length && !jobId) setJobId(String(safe[0].id));
      } catch (e) {
        setErr(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function doRegister(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      setMsg(`${data.message} ✅ Now login.`);
      setPage("login");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function doLogin(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      setSavedUser(data.user);

      setMsg("Logged in ✅");
      setPage("upload");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function doUpload(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!file) return setErr("Choose a PDF/DOCX first");

    try {
      const form = new FormData();
      form.append("resume", file);

      const data = await request("/resume/upload", {
        method: "POST",
        body: form,
      });

      const rid = data.id ?? data.resume_id ?? "OK";
      setMsg(`Resume uploaded ✅ (id: ${rid})`);
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function createJob(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      await request("/jobs", {
        method: "POST",
        body: JSON.stringify({ title: jobTitle, description: jobDesc }),
      });

      setMsg("Job created ✅");

      const list = await request("/jobs", { method: "GET" });
      const safe = Array.isArray(list) ? list : [];
      setJobs(safe);
      if (safe.length) setJobId(String(safe[0].id));
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function rankResumes(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setResults([]);

    try {
      const data = await request("/analysis/rank", {
        method: "POST",
        body: JSON.stringify({ jobId: Number(jobId) }),
      });

      setResults(data.results || []);
      setMsg("Ranking complete ✅");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  function logout() {
    clearToken();
    clearSavedUser();
    setUser(null);
    setPage("login");
    setMsg("Logged out ✅");
    setErr("");
  }

  function hardReset() {
    localStorage.clear();
    setUser(null);
    setMsg("LocalStorage cleared ✅");
    setErr("");
    setPage("login");
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          gap: 10,
          padding: 12,
          borderBottom: "1px solid #eee",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setPage("register")}>Register</button>
        <button onClick={() => setPage("login")}>Login</button>
        <button onClick={() => setPage("upload")}>Upload Resume</button>
        <button onClick={() => setPage("rank")}>Jobs & Rank</button>

        <button onClick={hardReset} style={{ marginLeft: "auto" }}>
          Clear Storage
        </button>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ padding: 16 }}>
        <div style={{ opacity: 0.8, marginBottom: 10 }}>
          API: {API} | {user ? `Logged in: ${user.email}` : "Not logged in"}
        </div>

        {msg && <p style={{ color: "green" }}>{msg}</p>}
        {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

        {page === "register" && (
          <form onSubmit={doRegister} style={{ maxWidth: 420 }}>
            <h2>Register</h2>

            <label>Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            />

            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            />

            <button style={{ padding: "10px 14px" }}>Create account</button>
          </form>
        )}

        {page === "login" && (
          <form onSubmit={doLogin} style={{ maxWidth: 420 }}>
            <h2>Login</h2>

            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            />

            <button style={{ padding: "10px 14px" }}>Login</button>
          </form>
        )}

        {page === "upload" && (
          <form onSubmit={doUpload} style={{ maxWidth: 520 }}>
            <h2>Upload Resume</h2>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div style={{ marginTop: 12 }}>
              <button style={{ padding: "10px 14px" }}>Upload</button>
            </div>
          </form>
        )}

        {page === "rank" && (
          <div>
            <h2>Jobs & Ranking</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <form onSubmit={createJob}>
                <h3>Create Job</h3>

                <label>Title</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
                />

                <label>Description</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={6}
                  style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
                />

                <button style={{ padding: "10px 14px" }}>Create</button>
              </form>

              <form onSubmit={rankResumes}>
                <h3>Rank Resumes</h3>

                <label>Select Job</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} — {j.title}
                    </option>
                  ))}
                </select>

                <button style={{ padding: "10px 14px" }}>Rank</button>
              </form>
            </div>

            <h3 style={{ marginTop: 20 }}>Results</h3>
            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              {results.length === 0 ? (
                <p>No results yet.</p>
              ) : (
                <ol>
                  {results.map((r, idx) => (
                    <li key={r.resumeId ?? idx} style={{ marginBottom: 10 }}>
                      <b>{r.resumeName ?? "Resume"}</b> — {r.scorePercent ?? r.score ?? 0}%
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        Top terms: {(r.topTerms || []).map((t) => `${t.term}(${t.weight})`).join(", ")}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
