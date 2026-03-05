// src/components/admin/QuestionsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";

export default function QuestionsTab() {

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await dashboardApi.getQuestions();
    setQuestions(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await dashboardApi.deleteQuestion(id);
    loadQuestions();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Questions</h2>

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
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} className="border-t border-slate-800">
                  <td className="p-4">{q.type}</td>
                  <td className="p-4">{q.text}</td>
                  <td className="p-4">{q.topic}</td>
                  <td className="p-4">{q.status}</td>
                  <td className="p-4 flex gap-2">
                    <button className="bg-amber-600 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-600 px-3 py-1 rounded"
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