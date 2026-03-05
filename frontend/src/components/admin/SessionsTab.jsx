// src/components/admin/SessionsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";
import { mockSessions } from "../../mocks/sessions";

export default function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);

    try {
      const data = await dashboardApi.getSessions();

      if (Array.isArray(data) && data.length > 0) {
        console.info("Sessions loaded from API");
        setSessions(normalizeSessions(data));
        setDataSource("api");
      } else {
        console.warn("Sessions API empty. Using mock.");
        setSessions(mockSessions);
        setDataSource("mock");
      }
    } catch (err) {
      console.error("Sessions API failed. Using mock.", err);
      setSessions(mockSessions);
      setDataSource("mock");
    }

    setLoading(false);
  };

  /**
   * Normalize backend snake_case → frontend camelCase
   */
  const normalizeSessions = (data) => {
    return data.map(s => ({
      id: s.id,
      traineeId: s.traineeId || s.trainee_id,
      programId: s.programId || s.program_id,
      startTime: s.startTime || s.start_time,
      endTime: s.endTime || s.end_time,
      totalTimeMs: s.totalTimeMs || s.total_time_ms,
      totalScore: s.totalScore || s.total_score,
      totalQuestions:
        s.totalQuestions ||
        s.total_questions ||
        (s.answers ? s.answers.length : 0),
      majorErrors: s.majorErrors || s.major_errors,
      status: s.status,
      answers: s.answers || []
    }));
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const filteredSessions =
    statusFilter === "all"
      ? sessions
      : sessions.filter(s => s.status === statusFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Training Sessions Administration
        </h2>

        {dataSource === "mock" && (
          <span className="text-xs bg-amber-700 px-3 py-1 rounded-full">
            MOCK DATA
          </span>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-4">Trainee</th>
                <th className="p-4">Program</th>
                <th className="p-4">Score</th>
                <th className="p-4">Errors</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map(s => (
                <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-900">
                  <td className="p-4">{s.traineeId}</td>
                  <td className="p-4">{s.programId}</td>
                  <td className="p-4">
                    {s.totalScore}/{s.totalQuestions}
                  </td>
                  <td className="p-4">{s.majorErrors}</td>
                  <td className="p-4">{formatDuration(s.totalTimeMs)}</td>
                  <td className="p-4 capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}