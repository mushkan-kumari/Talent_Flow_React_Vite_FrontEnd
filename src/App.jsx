import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { JobsBoard } from "./features/jobs/JobsBoard";
import { CandidatesBoard } from "./features/candidates/candidatesBoard";
import { CandidateProfile } from "./features/candidates/candidateProfile";
import { AssessmentsPage } from "./features/assessments/AssessmentsPage";
import { ensureSeed, db } from "./db/indexedDB";
import { makeServer } from "./api/server"; // MirageJS server
import logo from "./assets/talent_flow_logo2.jpg"; 

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-violet-900 ${
    isActive ? "bg-violet-800 font-semibold" : "text-white"
  }`;

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start MirageJS server
    const server = makeServer({ environment: "development" });

    const initDB = async () => {
      try {
        await ensureSeed(); // Seed IndexedDB.js (if empty)
        setDbReady(true);
      } catch (err) {
        console.error("DB Seeding Error:", err);
        setError(err.message);
      }
    };
    initDB();

    // Cleanup on unmount
    return () => {
      server.shutdown();
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-700 text-lg">
        Error initializing database: {error}
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 text-lg font-medium">Setting up data...</span>
      </div>
    );
  }

  return (
    <Router>
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-violet-950 shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Portal Logo" className="w-20 h-10" />
          <span className="text-3xl font-bold text-white">TalentFlow</span>
        </div>

        <div className="flex space-x-2 text-white">
          <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
          <NavLink to="/candidates" className={linkClass}>Candidates</NavLink>
          <NavLink to="/assessments" className={linkClass}>Assessments</NavLink>
        </div>
      </nav>

      {/* Page Content */}
      <div className="p-6 min-h-screen bg-violet-200 flex justify-center items-start">
        <Routes>
          <Route path="/jobs" element={<JobsBoard />} />
          <Route path="/candidates" element={<CandidatesBoard />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="*" element={<JobsBoard />} />
        </Routes>
      </div>
    </Router>
  );
}


