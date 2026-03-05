// src/components/admin/ProgramsTab.jsx

import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/apiServiceDashboard";

export default function ProgramsTab() {

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    dashboardApi.getPrograms().then(setPrograms);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Training Programs</h2>

      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Version</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.status}</td>
                <td className="p-4">{p.version}</td>
                <td className="p-4">
                  <button className="bg-amber-600 px-3 py-1 rounded">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}