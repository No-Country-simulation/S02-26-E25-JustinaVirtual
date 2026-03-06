//src/components/admin/SessionsTab.jsx
import { Fragment, useEffect, useMemo, useState } from "react";
import {
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getExpandedRowModel,
   flexRender,
} from "@tanstack/react-table";

import { dashboardApi } from "../../services/apiServiceDashboard";
import { mockSessions } from "../../mocks/sessions";
import Button from "./../ui/Button";

export default function SessionsTab() {
   const [sessions, setSessions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [dataSource, setDataSource] = useState("api");

   const [sorting, setSorting] = useState([]);
   const [globalFilter, setGlobalFilter] = useState("");
   const [columnFilters, setColumnFilters] = useState([]);
   const [expanded, setExpanded] = useState({});

   useEffect(() => {
      loadSessions();
   }, []);

   const loadSessions = async () => {
      setLoading(true);

      try {
         const data = await dashboardApi.getSessions();

         if (Array.isArray(data) && data.length > 0) {
            setSessions(normalizeSessions(data));
            setDataSource("api");
         } else {
            setSessions(mockSessions);
            setDataSource("mock");
         }
      } catch {
         setSessions(mockSessions);
         setDataSource("mock");
      }

      setLoading(false);
   };

   const normalizeSessions = (data) =>
      data.map((s) => ({
         id: s.id,
         traineeId: s.traineeId || s.trainee_id,
         programId: s.programId || s.program_id,
         totalTimeMs: s.totalTimeMs || s.total_time_ms,
         totalScore: s.totalScore || s.total_score,
         totalQuestions:
            s.totalQuestions ||
            s.total_questions ||
            (s.answers ? s.answers.length : 0),
         majorErrors: s.majorErrors || s.major_errors,
         status: s.status,
         answers: s.answers || [],
      }));

   const formatDuration = (ms) => {
      const sec = Math.floor(ms / 1000);
      const min = Math.floor(sec / 60);
      return `${min}m ${sec % 60}s`;
   };

   const columns = useMemo(
      () => [
         {
            header: "Trainee",
            accessorKey: "traineeId",
         },
         {
            header: "Program",
            accessorKey: "programId",
         },
         {
            header: "Score",
            accessorFn: (row) => row.totalScore / row.totalQuestions,
            cell: ({ row }) =>
               `${row.original.totalScore}/${row.original.totalQuestions}`,
         },
         {
            header: "Errors",
            accessorKey: "majorErrors",
         },
         {
            header: "Duration",
            accessorKey: "totalTimeMs",
            cell: ({ row }) => formatDuration(row.original.totalTimeMs),
         },
         {
            header: "Status",
            accessorKey: "status",
         },
      ],
      [],
   );

   const table = useReactTable({
      data: sessions,
      columns,
      state: { sorting, globalFilter, columnFilters, expanded },
      onSortingChange: setSorting,
      onGlobalFilterChange: setGlobalFilter,
      onColumnFiltersChange: setColumnFilters,
      onExpandedChange: setExpanded,

      getRowId: (row) => row.id, // important for stable expansion
      getRowCanExpand: () => true, // ⭐ THIS ENABLES EXPANSION

      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
   });

   const exportCSV = () => {
      const rows = table.getFilteredRowModel().rows;

      const csv = [
         ["Trainee", "Program", "Score", "Errors", "Duration", "Status"],
         ...rows.map((r) => [
            r.original.traineeId,
            r.original.programId,
            `${r.original.totalScore}/${r.original.totalQuestions}`,
            r.original.majorErrors,
            formatDuration(r.original.totalTimeMs),
            r.original.status,
         ]),
      ]
         .map((e) => e.join(","))
         .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "sessions.csv";
      a.click();
   };

   if (loading) return <p>Loading...</p>;

   return (
      <div>
         <div className="flex justify-between mb-4 items-center">
            <h2 className="text-xl font-semibold">
               Training Sessions Administration
            </h2>

            <div className="flex gap-2">
               <Button
                  onClick={exportCSV}
                  className="bg-slate-700 px-3 py-1 rounded">
                  Export CSV
               </Button>

               {dataSource === "mock" && (
                  <span className=" bg-amber-700 px-3 py-2 rounded">
                     MOCK DATA
                  </span>
               )}
            </div>
         </div>

         <div className="flex justify-between gap-2 mb-4 items-center">
            {/* Global search */}
            <input
               placeholder="Search sessions..."
               value={globalFilter ?? ""}
               onChange={(e) => setGlobalFilter(e.target.value)}
               className="mb-3 w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded"
            />

            {/* Column filter */}
            <input
               placeholder="Filter status..."
               onChange={(e) =>
                  table.getColumn("status")?.setFilterValue(e.target.value)
               }
               className="mb-3 bg-slate-900 border border-slate-700 px-3 py-2 rounded"
            />
         </div>

         <div className="overflow-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
               <thead className="bg-slate-800 text-slate-300">
                  {table.getHeaderGroups().map((headerGroup) => (
                     <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <th
                              key={header.id}
                              className="p-4 cursor-pointer select-none"
                              onClick={header.column.getToggleSortingHandler()}>
                              <div className="flex items-center gap-1">
                                 {{
                                    asc: "▲ ",
                                    desc: "▼ ",
                                 }[header.column.getIsSorted()] ?? "  "}
                                 {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                 )}
                              </div>
                           </th>
                        ))}
                     </tr>
                  ))}
               </thead>

               <tbody>
                  {table.getRowModel().rows.map((row) => (
                     <Fragment key={row.id}>
                        <tr
                           onClick={row.getToggleExpandedHandler()}
                           className="border-t border-slate-800 hover:bg-slate-900 cursor-pointer">
                           {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="p-4">
                                 {flexRender(
                                    cell.column.columnDef.cell ??
                                       cell.column.columnDef.accessorKey,
                                    cell.getContext(),
                                 )}
                              </td>
                           ))}
                        </tr>

                        {row.getIsExpanded() && (
                           <tr>
                              <td
                                 colSpan={columns.length}
                                 className="bg-inherit p-3">
                                 <table className="w-full text-sm border border-border">
                                    <thead className="bg-muted">
                                       <tr>
                                          <th className="text-left px-2 py-1">
                                             Question
                                          </th>
                                          <th className="text-left px-2 py-1">
                                             Type
                                          </th>
                                          <th className="text-left px-2 py-1">
                                             Selected
                                          </th>
                                          <th className="text-left px-2 py-1">
                                             Correct
                                          </th>
                                          <th className="text-left px-2 py-1">
                                             Time (ms)
                                          </th>
                                          <th className="text-left px-2 py-1">
                                             Answered At
                                          </th>
                                       </tr>
                                    </thead>

                                    <tbody>
                                       {row.original.answers?.map(
                                          (ans, idx) => (
                                             <tr
                                                key={idx}
                                                className="border-t border-border hover:bg-muted/50">
                                                <td className="px-2 py-1">
                                                   {ans.questionId}
                                                </td>
                                                <td className="px-2 py-1">
                                                   {ans.questionType}
                                                </td>
                                                <td className="px-2 py-1">
                                                   {ans.selectedIndex}
                                                </td>

                                                <td
                                                   className={
                                                      ans.isCorrect
                                                         ? "text-green-500 px-2 py-1"
                                                         : "text-red-500 px-2 py-1"
                                                   }>
                                                   {ans.isCorrect ? "✔" : "✖"}
                                                </td>

                                                <td className="px-2 py-1">
                                                   {ans.timeSpentMs}
                                                </td>

                                                <td className="px-2 py-1">
                                                   {new Date(
                                                      ans.answeredAt,
                                                   ).toLocaleTimeString()}
                                                </td>
                                             </tr>
                                          ),
                                       )}
                                    </tbody>
                                 </table>
                              </td>
                           </tr>
                        )}
                     </Fragment>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination + page size */}
         <div className="flex gap-3 mt-4 items-center">
            <button
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
               className="bg-slate-700 px-3 py-1 rounded">
               Prev
            </button>

            <button
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
               className="bg-slate-700 px-3 py-1 rounded">
               Next
            </button>

            <select
               value={table.getState().pagination.pageSize}
               onChange={(e) => table.setPageSize(Number(e.target.value))}
               className="bg-slate-900 border border-slate-700 px-2 py-1 rounded">
               {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                     {size} rows
                  </option>
               ))}
            </select>
         </div>
      </div>
   );
}