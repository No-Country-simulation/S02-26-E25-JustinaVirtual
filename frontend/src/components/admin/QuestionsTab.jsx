// // src/components/admin/QuestionsTab.jsx
// import { useEffect, useState } from "react";
// import { dashboardApi } from "../../services/apiServiceDashboard";
// import { mockQuestions } from "../../mocks/questions";

// export default function QuestionsTab() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dataSource, setDataSource] = useState("api"); // api | mock

//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   const loadQuestions = async () => {
//     setLoading(true);

//     try {
//       const data = await dashboardApi.getQuestions();

//       // If API returned valid array with content
//       if (Array.isArray(data) && data.length > 0) {
//         setQuestions(data);
//         setDataSource("api");
//         console.info("Questions loaded from API");
//       } else {
//         // Fallback to mock
//         console.warn("API returned empty. Using mock data.");
//         setQuestions(mockQuestions);
//         setDataSource("mock");
//       }
//     } catch (error) {
//       console.error("Error fetching questions. Using mock data.", error);
//       setQuestions(mockQuestions);
//       setDataSource("mock");
//     }

//     setLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this question?")) return;

//     try {
//       await dashboardApi.deleteQuestion(id);
//       loadQuestions();
//     } catch (error) {
//       console.error("Delete failed (API). Removing locally (mock mode).");

//       // If running on mock mode, delete locally
//       if (dataSource === "mock") {
//         setQuestions(prev => prev.filter(q => q.id !== id));
//       }
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Questions</h2>

//         {dataSource === "mock" && (
//           <span className="text-xs bg-amber-700 px-3 py-1 rounded-full">
//             MOCK DATA
//           </span>
//         )}
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="overflow-auto rounded-xl border border-slate-800">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-800 text-slate-300">
//               <tr>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Text</th>
//                 <th className="p-4">Topic</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Active</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {questions.map(q => (
//                 <tr key={q.id} className="border-t border-slate-800 hover:bg-slate-900">
//                   <td className="p-4 capitalize">{q.type}</td>
//                   <td className="p-4 max-w-md truncate">{q.text}</td>
//                   <td className="p-4">{q.topic}</td>
//                   <td className="p-4">{q.status}</td>
//                   <td className="p-4">
//                     {q.active ? (
//                       <span className="text-green-400">Yes</span>
//                     ) : (
//                       <span className="text-red-400">No</span>
//                     )}
//                   </td>
//                   <td className="p-4 flex gap-2">
//                     <button className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-500">
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(q.id)}
//                       className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

//src/components/admin/QuestionsTab.jsx

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
import QuestionModal from "./QuestionModal";
import Button from "../ui/Button";
// import { useAuth } from "../../context/AuthContext";  // optional later

export default function QuestionsTab() {
   const [questions, setQuestions] = useState([]);
   const [loading, setLoading] = useState(true);

   const [sorting, setSorting] = useState([]);
   const [expanded, setExpanded] = useState({});
   const [globalFilter, setGlobalFilter] = useState("");

   const [modalOpen, setModalOpen] = useState(false);
   const [editingQuestion, setEditingQuestion] = useState(null);

   const JAVA_API = "https://justina-backend.onrender.com/api";

   // fallback token until AuthContext exists
   const TEMP_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqdXN0aW5hLWFwaSIsInN1YiI6ImNmM2JiMDFjLTZkM2QtNDBkMi05MDc2LTljYTMyNzYzN2I0OCIsInJvbGUiOiJBRE1JTiIsImV4cCI6MTc3MjkxOTM0OX0.BUWvgS42CVBmaSaDC2b2hZrjg7WNgD0F7wE3YbAjaKo";

   // const {token} = useAuth()
   // const authToken = token || TEMP_TOKEN

   const authToken = TEMP_TOKEN;

   useEffect(() => {
      loadQuestions();
   }, []);

   async function loadQuestions() {
      setLoading(true);

      try {
         const res = await fetch(`${JAVA_API}/questions`, {
            method: "GET",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${authToken}`,
            },
         });

         const data = await res.json();

         setQuestions(normalizeQuestions(data));
      } catch (err) {
         console.error("Questions fetch error", err);
      }

      setLoading(false);
   }

   function normalizeQuestions(data) {
      if (!Array.isArray(data)) return [];

      return data.map((q) => ({
         id: q.id,
         type: q.type,
         text: q.text,
         topic: q.topic,
         correct: q.correctIndex,
         hint: q.hint,
         media: q.mediaUrl,
         options: q.options,
      }));
   }

   const columns = useMemo(
      () => [
         {
            header: "Type",
            accessorKey: "type",
         },
         {
            header: "Topic",
            accessorKey: "topic",
         },
         {
            header: "Question",
            accessorKey: "text",
            cell: ({ row }) => (
               <div className="max-w-[500px]">{row.original.text}</div>
            ),
         },
         {
            header: "Correct",
            accessorKey: "correct",
         },
         {
            header: "Media",
            accessorKey: "media",
            cell: ({ row }) => (row.original.media ? "🎬" : "—"),
         },
      ],
      [],
   );

   const table = useReactTable({
      data: questions,
      columns,

      state: {
         sorting,
         expanded,
         globalFilter,
      },

      onSortingChange: setSorting,
      onExpandedChange: setExpanded,
      onGlobalFilterChange: setGlobalFilter,

      getRowId: (row) => row.id,
      getRowCanExpand: () => true,

      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
   });

   if (loading) return <p>Loading...</p>;

   return (
      <div>
         <div className="flex justify-between mb-4 items-center">
            <h2 className="text-xl font-semibold">Questions</h2>

            <div className="flex gap-2">
               <Button
                  className="bg-green-600 px-3 py-1 rounded"
                  onClick={() => {
                     setEditingQuestion(null);
                     setModalOpen(true);
                  }}>
                  New Question
               </Button>

               <Button
                  className="bg-slate-700 px-3 py-1 rounded"
                  onClick={loadQuestions}>
                  Refresh
               </Button>
            </div>
         </div>

         <div className="mb-4">
            <input
               placeholder="Search questions..."
               value={globalFilter ?? ""}
               onChange={(e) => setGlobalFilter(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded"
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
                              onClick={header.column.getToggleSortingHandler()}
                              className="p-4 cursor-pointer select-none">
                              {flexRender(
                                 header.column.columnDef.header,
                                 header.getContext(),
                              )}
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
                           
                              onDoubleClick={() => {
                                 setEditingQuestion(row.original);
                                 setModalOpen(true);
                              }}
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
                              <td colSpan={columns.length} className="p-4">
                                 <div className="grid grid-cols-2 gap-6">
                                    {/* OPTIONS TABLE */}

                                    <div>
                                       <h4 className="font-semibold mb-2">
                                          Options
                                       </h4>

                                       <table className="w-full text-xs border border-border">
                                          <tbody>
                                             {row.original.options.map(
                                                (opt, i) => (
                                                   <tr
                                                      key={i}
                                                      className={`border-t border-border ${
                                                         i ===
                                                         row.original.correct
                                                            ? "bg-green-900/40"
                                                            : ""
                                                      }`}>
                                                      <td className="px-2 py-1 w-8">
                                                         {i}
                                                      </td>

                                                      <td className="px-2 py-1">
                                                         {opt}
                                                      </td>
                                                   </tr>
                                                ),
                                             )}
                                          </tbody>
                                       </table>
                                    </div>

                                    {/* DETAILS TABLE */}

                                    <div>
                                       <h4 className="font-semibold mb-2">
                                          Details
                                       </h4>

                                       <table className="w-full text-xs border border-border">
                                          <tbody>
                                             <tr className="border-t border-border">
                                                <td className="px-2 py-1">
                                                   Hint
                                                </td>
                                                <td className="px-2 py-1">
                                                   {row.original.hint}
                                                </td>
                                             </tr>

                                             <tr className="border-t border-border">
                                                <td className="px-2 py-1">
                                                   Media
                                                </td>
                                                <td className="px-2 py-1">
                                                   {row.original.media}
                                                </td>
                                             </tr>

                                             <tr className="border-t border-border">
                                                <td className="px-2 py-1">
                                                   Question ID
                                                </td>
                                                <td className="px-2 py-1">
                                                   {row.original.id}
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </Fragment>
                  ))}
               </tbody>
            </table>
         </div>

         <QuestionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSaved={loadQuestions}
            question={editingQuestion}
            JAVA_API={JAVA_API}
            token={authToken}
         />
      </div>
   );
}
