// src/pages/AdminDashboard.jsx

import { useState } from "react";
import QuestionsTab from "../components/admin/QuestionsTab";
import ProgramsTab from "../components/admin/ProgramsTab";
import SessionsTab from "../components/admin/SessionsTab";

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("questions");

  const tabs = [
    { key: "questions", label: "Questions" },
    { key: "programs", label: "Training Programs" },
    { key: "sessions", label: "Training Sessions" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "questions" && <QuestionsTab />}
      {activeTab === "programs" && <ProgramsTab />}
      {activeTab === "sessions" && <SessionsTab />}
    </div>
  );
}