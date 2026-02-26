import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicJobs from "./pages/PublicJobs";
import RankingList from "./pages/RankingList";
import CandidateDashboard from "./pages/CandidateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";

import CandidateLogin from "./pages/CandidateLogin";
import StaffLogin from "./pages/StaffLogin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />

        <Route path="/jobs" element={<PublicJobs />} />

        <Route path="/candidate" element={<CandidateDashboard />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />

        <Route path="/recruiter" element={<RecruiterDashboard />} />

        <Route path="/ranking" element={<RankingList />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/staff/login" element={<StaffLogin />} />

        <Route path="*" element={<Navigate to="/jobs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}