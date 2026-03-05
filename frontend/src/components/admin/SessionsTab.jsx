// src/components/admin/SessionsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";

export default function SessionsTab() {

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    dashboardApi.getSessions().then(setSessions);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Training Sessions Administration
      </h2>

      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4">Trainee</th>
              <th className="p-4">Program</th>
              <th className="p-4">Score</th>
              <th className="p-4">Errors</th>
              <th className="p-4">Total Time (ms)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-t border-slate-800">
                <td className="p-4">{s.traineeId}</td>
                <td className="p-4">{s.programId}</td>
                <td className="p-4">{s.totalScore}/{s.totalQuestions}</td>
                <td className="p-4">{s.majorErrors}</td>
                <td className="p-4">{s.totalTimeMs}</td>
                <td className="p-4">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}