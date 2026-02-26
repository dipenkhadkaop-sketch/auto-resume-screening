import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <div style={navWrap}>
      <div style={brand}>Auto Resume Screening</div>

      <div style={links}>
        <NavBtn to="/jobs" active={pathname.startsWith("/jobs")}>
          Public Jobs
        </NavBtn>

        <NavBtn to="/candidate" active={pathname.startsWith("/candidate")}>
          Candidate
        </NavBtn>

        <NavBtn to="/candidate/login" active={pathname === "/candidate/login"}>
          Candidate Login
        </NavBtn>

        <NavBtn to="/recruiter" active={pathname.startsWith("/recruiter")}>
          Recruiter
        </NavBtn>

        <NavBtn to="/ranking" active={pathname === "/ranking"}>
          Ranking
        </NavBtn>

        <NavBtn to="/admin" active={pathname.startsWith("/admin")}>
          Admin
        </NavBtn>

        <NavBtn to="/staff/login" active={pathname === "/staff/login"}>
          Staff Login
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "10px 12px",
        borderRadius: 12,
        border: active ? "1px solid #111827" : "1px solid #e5e7eb",
        background: active ? "#111827" : "#fafafa",
        color: active ? "white" : "#111827",
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}

const navWrap = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "white",
  borderBottom: "1px solid #eee",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand = { fontWeight: 900 };

const links = { display: "flex", gap: 12, flexWrap: "wrap" };