// src/components/admin/ProgramsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";
import { allPrograms } from "../../mocks/programs";
import { mockProgramQuestions } from "../../mocks/programQuestions";

export default function ProgramsTab() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api");

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);

    try {
      const data = await dashboardApi.getPrograms();

      if (Array.isArray(data) && data.length > 0) {
        console.info("Programs loaded from API");
        setPrograms(enrichProgramsWithQuestionCount(data, "api"));
        setDataSource("api");
      } else {
        console.warn("Programs API empty. Using mock.");
        setPrograms(enrichProgramsWithQuestionCount(allPrograms, "mock"));
        setDataSource("mock");
      }
    } catch (err) {
      console.error("Programs API failed. Using mock.", err);
      setPrograms(enrichProgramsWithQuestionCount(allPrograms, "mock"));
      setDataSource("mock");
    }

    setLoading(false);
  };

  /**
   * Adds questionCount field to program
   */
  const enrichProgramsWithQuestionCount = (programList, source) => {
    return programList.map(program => {
      let questionCount = 0;

      // If API eventually provides question_links
      if (program.question_links && Array.isArray(program.question_links)) {
        questionCount = program.question_links.length;
      } else {
        // Use mock relation table
        questionCount = mockProgramQuestions.filter(
          pq => pq.program_id === program.id
        ).length;
      }

      return {
        ...program,
        questionCount,
        __source: source
      };
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Training Programs</h2>

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
                <th className="p-4">Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Version</th>
                <th className="p-4">Active</th>
                <th className="p-4">Questions</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-900">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4">{p.status}</td>
                  <td className="p-4">{p.version}</td>
                  <td className="p-4">
                    {p.active ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-400">No</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{p.questionCount}</td>
                  <td className="p-4">
                    <button className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-500">
                      Edit
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