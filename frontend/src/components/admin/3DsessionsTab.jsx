//src/components/admin/3DsessionsTab.jsx
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

import Button from "../ui/Button";

export default function ThreeDSessionsTab() {

  const [sessions,setSessions] = useState([])
  const [users,setUsers] = useState([])
  const [selectedUser,setSelectedUser] = useState("all")
  const [loading,setLoading] = useState(true)

  const [sorting,setSorting] = useState([])
  const [expanded,setExpanded] = useState({})
  const [globalFilter,setGlobalFilter] = useState("")

//   const PYTHON_API = import.meta.env.VITE_PYTHON_API
//   const JAVA_API = import.meta.env.VITE_JAVA_API

    const PYTHON_API ="https://s02-26-e25-justinavirtual.onrender.com"
    const JAVA_API = "https://justina-backend.onrender.com/api"
    // temporary until auth context is implemented
const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqdXN0aW5hLWFwaSIsInN1YiI6ImNmM2JiMDFjLTZkM2QtNDBkMi05MDc2LTljYTMyNzYzN2I0OCIsInJvbGUiOiJBRE1JTiIsImV4cCI6MTc3MjkxOTM0OX0.BUWvgS42CVBmaSaDC2b2hZrjg7WNgD0F7wE3YbAjaKo";

  useEffect(()=>{
    loadUsers()
    loadAllSessions()
  },[])

//   async function loadUsers(){
//     try{
//       const res = await fetch(`${JAVA_API}/usuarios`)
//       const data = await res.json()
//       setUsers(data)
//     }catch(err){
//       console.error("Users fetch error",err)
//     }
//   }

async function loadUsers() {
  try {

    const res = await fetch(`${JAVA_API}/usuarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEMP_TOKEN}`
      }
    });

    if (!res.ok) {
      console.error("Users fetch failed:", res.status);
      return;
    }

    const data = await res.json();
    setUsers(data);

  } catch (err) {
    console.error("Users fetch error", err);
  }
}

  async function loadAllSessions(){
    setLoading(true)
    try{

      const res = await fetch(`${PYTHON_API}/sessions/all`)
      const data = await res.json()

      const normalized = normalizeSessions(data)
      setSessions(normalized)

    }catch(err){
      console.error("Sessions fetch error",err)
    }

    setLoading(false)
  }

  async function loadUserSessions(email){

    setSelectedUser(email)

    if(email === "all"){
      loadAllSessions()
      return
    }

    setLoading(true)

    try{
      const res = await fetch(`${PYTHON_API}/sessions/user/${email}`)
      const data = await res.json()

      const normalized = normalizeSessions(data)
      setSessions(normalized)

    }catch(err){
      console.error("User sessions error",err)
    }

    setLoading(false)
  }

  function normalizeSessions(data){

    if(data.sessions){

      return data.sessions.map(s=>({
        id:s.session_id,
        user:s.user_id ?? data.user_id,
        date:s.date,
        procedure:s.procedure_type,
        mode:s.mode,
        score:s.score,
        status:s.status,
        duration:s.duration,
        tremor:s.tremor_detected,
        metrics:s.metrics,
        ai_prediction:s.ai_prediction
      }))

    }

    if(Array.isArray(data)){

      return data.flatMap(u =>
        u.sessions.map(s=>({
          id:s.session_id,
          user:u.user_id,
          date:s.date,
          procedure:s.procedure_type,
          mode:s.mode,
          score:s.score,
          status:s.status,
          duration:s.duration,
          tremor:s.tremor_detected,
          metrics:s.metrics,
          ai_prediction:s.ai_prediction
        }))
      )

    }

    return []
  }

  const columns = useMemo(()=>[
    {header:"User",accessorKey:"user"},
    {header:"Date",accessorKey:"date"},
    {header:"Procedure",accessorKey:"procedure"},
    {header:"Mode",accessorKey:"mode"},
    {header:"Score",accessorKey:"score"},
    {header:"Status",accessorKey:"status"},
    {header:"Duration (s)",accessorKey:"duration"},
    {header:"Tremor",accessorKey:"tremor",
      cell:({row}) => row.original.tremor ? "⚠️" : "—"
    }
  ],[])

  const table = useReactTable({
    data:sessions,
    columns,
    state:{sorting,expanded,globalFilter},
    onSortingChange:setSorting,
    onExpandedChange:setExpanded,
    onGlobalFilterChange:setGlobalFilter,

    getRowId:(row)=>row.id,
    getRowCanExpand:()=>true,

    getCoreRowModel:getCoreRowModel(),
    getSortedRowModel:getSortedRowModel(),
    getFilteredRowModel:getFilteredRowModel(),
    getPaginationRowModel:getPaginationRowModel(),
    getExpandedRowModel:getExpandedRowModel()
  })

  if(loading) return <p>Loading...</p>

  return(
  <div>

    <div className="flex justify-between mb-4 items-center">

      <h2 className="text-xl font-semibold">
        3D Surgery Sessions
      </h2>

      <Button onClick={loadAllSessions} className="bg-slate-700 px-3 py-1 rounded">
        Refresh
      </Button>

    </div>

    <div className="flex gap-3 mb-4">

      <input
        placeholder="Search sessions..."
        value={globalFilter ?? ""}
        onChange={e=>setGlobalFilter(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded"
      />

      <select
        value={selectedUser}
        onChange={e=>loadUserSessions(e.target.value)}
        className="bg-slate-900 border border-slate-700 px-3 py-2 rounded"
      >

        <option value="all">All Users</option>

        {users.map(u=>(
          <option key={u.id} value={u.email}>
            {u.email}
          </option>
        ))}

      </select>

    </div>

    <div className="overflow-auto rounded-xl border border-slate-800">

      <table className="w-full text-xs text-left">

        <thead className="bg-slate-800 text-slate-300">
          {table.getHeaderGroups().map(headerGroup=>(
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header=>(
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="p-4 cursor-pointer select-none"
                >
                  {flexRender(header.column.columnDef.header,header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>

          {table.getRowModel().rows.map(row=>(
          <Fragment key={row.id}>

            <tr
              onClick={row.getToggleExpandedHandler()}
              className="border-t border-slate-800 hover:bg-slate-900 cursor-pointer"
            >
              {row.getVisibleCells().map(cell=>(
                <td key={cell.id} className="p-4">
                  {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey,cell.getContext())}
                </td>
              ))}
            </tr>

            {row.getIsExpanded() && (

              <tr>
                <td colSpan={columns.length} className="p-4">

                  <div className="grid grid-cols-2 gap-6">

                    <div>
                      <h4 className="font-semibold mb-2">Metrics</h4>
                      <table className="w-full text-xs border border-border">
                        <tbody>
                          {Object.entries(row.original.metrics).map(([k,v])=>(
                            <tr key={k} className="border-t border-border">
                              <td className="px-2 py-1">{k}</td>
                              <td className="px-2 py-1">{String(v)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Prediction</h4>
                      <table className="w-full text-xs border border-border">
                        <tbody>
                          {Object.entries(row.original.ai_prediction).map(([k,v])=>(
                            <tr key={k} className="border-t border-border">
                              <td className="px-2 py-1">{k}</td>
                              <td className="px-2 py-1">{String(v)}</td>
                            </tr>
                          ))}
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

  </div>
  )
}