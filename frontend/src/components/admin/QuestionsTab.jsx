// src/components/admin/QuestionsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";
import { mockQuestions } from "../../mocks/questions";

export default function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api"); // api | mock

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);

    try {
      const data = await dashboardApi.getQuestions();

      // If API returned valid array with content
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setDataSource("api");
        console.info("Questions loaded from API");
      } else {
        // Fallback to mock
        console.warn("API returned empty. Using mock data.");
        setQuestions(mockQuestions);
        setDataSource("mock");
      }
    } catch (error) {
      console.error("Error fetching questions. Using mock data.", error);
      setQuestions(mockQuestions);
      setDataSource("mock");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await dashboardApi.deleteQuestion(id);
      loadQuestions();
    } catch (error) {
      console.error("Delete failed (API). Removing locally (mock mode).");

      // If running on mock mode, delete locally
      if (dataSource === "mock") {
        setQuestions(prev => prev.filter(q => q.id !== id));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Questions</h2>

        {dataSource === "mock" && (
          <span className="text-xs bg-amber-700 px-3 py-1 rounded-full">
            MOCK DATA
          </span>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Text</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Status</th>
                <th className="p-4">Active</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} className="border-t border-slate-800 hover:bg-slate-900">
                  <td className="p-4 capitalize">{q.type}</td>
                  <td className="p-4 max-w-md truncate">{q.text}</td>
                  <td className="p-4">{q.topic}</td>
                  <td className="p-4">{q.status}</td>
                  <td className="p-4">
                    {q.active ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-400">No</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-500">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}