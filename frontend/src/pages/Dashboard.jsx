import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import AIFeedbackCard from "../components/AIFeedbackCard";
import QualityIndicator from "../components/QualityIndicator";
import SessionDetailModal from "../components/SessionDetailModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [previousResults, setPreviousResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    async function loadUserSessions() {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const aiSessions = await apiService.getUserSessions(user.email);
        const localHistory = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");
        
        const aiResults = aiSessions.sessions || [];
        const combined = [...aiResults, ...localHistory];
        
        const unique = combined.reduce((acc, item) => {
          if (!acc.find(x => x.session_id === item.session_id || x.id === item.id)) {
            acc.push(item);
          }
          return acc;
        }, []);
        
        unique.sort((a, b) => {
          const dateA = a.date || a.timestamp || "";
          const dateB = b.date || b.timestamp || "";
          return dateB.localeCompare(dateA);
        });
        
        setPreviousResults(unique);
      } catch (error) {
        console.error("Erro ao carregar sessões:", error);
        const localHistory = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");
        setPreviousResults(localHistory);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAdmin) {
      apiService.getAllUsers().then(setUsersList).catch(console.error);
    }
    
    loadUserSessions();
  }, [user, isAdmin]);

  if (!user) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-mono animate-pulse tracking-[0.5em] text-xs">
      CARREGANDO INTERFACE MÉDICA...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* AMBIENT LIGHTING & GRID */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER: OPERADOR E STATUS DA SESSÃO */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-6 relative">
            <div className="relative">
              <div className={`h-16 w-16 bg-gradient-to-tr ${isAdmin ? 'from-slate-600 to-slate-400' : 'from-blue-600 to-cyan-400'} rounded-2xl flex items-center justify-center text-3xl font-black text-white italic shadow-[0_0_30px_rgba(59,130,246,0.4)]`}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-4 border-[#0f172a] rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">{user.name}</h1>
                <span className={`px-2 py-0.5 ${isAdmin ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'} border text-[8px] font-black uppercase tracking-[0.2em] rounded`}>
                  {isAdmin ? 'MODO INSTRUTOR' : 'SESSÃO ATIVA'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:flex md:items-center gap-x-6 gap-y-1 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                <p><span className="text-blue-500/50">{isAdmin ? 'ID_SISTEMA:' : 'REGISTRO:'}</span> <span className="text-slate-300">{user.crm || (isAdmin ? 'ADMIN-ROOT' : 'ALPHA-001')}</span></p>
                <p><span className="text-blue-500/50">PERFIL:</span> <span className="text-slate-300">{user.role}</span></p>
                <p><span className="text-blue-500/50">{isAdmin ? 'STATUS:' : 'LATÊNCIA:'}</span> <span className="text-emerald-500">{isAdmin ? 'SISTEMA OK' : '12ms'}</span></p>
                <p className="invisible md:visible"><span className="text-blue-500/50">SALA:</span> <span className="text-slate-300 italic">{isAdmin ? 'CONTROL_HUB' : 'CENTRO_04'}</span></p>
              </div>
            </div>
          </div>

          <button onClick={logout} className="mt-6 md:mt-0 px-8 py-3 bg-red-500/5 hover:bg-red-500 border border-red-500/20 hover:border-red-400 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-[0.4em] transition-all rounded-xl">
            [ ENCERRAR SESSÃO ]
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500/40 flex items-center gap-4">
              <span className="h-[1px] w-12 bg-blue-500/20"></span> {isAdmin ? 'Gestão de Operadores' : 'Módulos de Operação'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* TREINAMENTO / PROTOCOLOS */}
              <div onClick={() => navigate("/treinamento")} 
                className="group relative bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] cursor-pointer hover:border-purple-500/40 transition-all duration-500 overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 text-purple-400">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Treinamento Teórico</h3>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-8 opacity-70">Revisão técnica de anatomia renal e tomada de decisão clínica.</p>
                  <div className="text-purple-400 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    {isAdmin ? 'INICIAR ESTUDOS' : 'INICIAR TREINAMENTO TEÓRICO'} <span className="group-hover:translate-x-3 transition-transform duration-500">>>></span>
                  </div>
                </div>
              </div>

              {/* SIMULADOR 3D */}
              <div onClick={() => navigate("/simulador-3d")} 
                className="group relative bg-slate-900/60 border-2 border-blue-500/30 p-8 rounded-[2.5rem] cursor-pointer hover:border-blue-400 transition-all duration-500 overflow-hidden shadow-2xl ring-1 ring-blue-500/20">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/40 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/></svg>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-[8px] font-black text-white rounded-lg uppercase animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]">AMBIENTE IMERSIVO</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Simulador 3D</h3>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-8 opacity-70">Ambiente imersivo de nefrectomia robótica com telemetria analítica em tempo real.</p>
                  <div className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    {isAdmin ? 'INICIAR SIMULAÇÃO' : 'ACESSAR SALA DE TREINAMENTO'} <span className="group-hover:translate-x-3 transition-transform duration-500">>>></span>
                  </div>
                </div>
              </div>

              {/* SIMULADOR 2D  */}
              <div onClick={() => navigate("/simulador-2d")} 
                className="group relative bg-slate-900/20 border border-white/5 p-8 rounded-[2.5rem] cursor-pointer hover:bg-slate-800/40 hover:border-slate-500/30 transition-all duration-500 overflow-hidden shadow-lg opacity-80 hover:opacity-100">
                <div className="relative z-10">
                  <div className="h-14 w-14 bg-slate-700/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 text-slate-500 group-hover:text-slate-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h7"/></svg>
                  </div>
                  <h3 className="text-lg font-black text-slate-400 uppercase italic tracking-tighter mb-2 group-hover:text-slate-200">Terminal 2D (BASE) </h3>
                  <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-8 opacity-60 group-hover:opacity-80">Acesso rápido aos protocolos de telemetria e validação 2D.</p>
                  <div className="text-slate-600 group-hover:text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    EXCUTAR TELEMETRIA BASE <span className="group-hover:translate-x-3 transition-transform duration-500">>>></span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO DINÂMICA: GESTÃO (ADMIN) OU OBJETIVOS (USER) */}
            {isAdmin ? (
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md shadow-inner">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-8 flex items-center gap-4 text-blue-400/80">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] animate-pulse"></span>
                  Operadores Conectados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usersList.length > 0 ? usersList.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/item cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                        <div>
                           <span className="text-[12px] font-black text-white uppercase italic tracking-tight">{u.name}</span>
                           <p className="text-[7px] text-blue-400 font-black tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-opacity">Ver Feedback Detalhado</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase group-hover/item:text-blue-400 transition-colors">{u.role}</span>
                    </div>
                  )) : (
                    <p className="col-span-2 text-center text-slate-600 text-[10px] uppercase font-black tracking-widest py-4 italic">Buscando conexões ativas...</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-6 flex items-center gap-4 text-purple-400/80">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7]"></span>
                  Objetivos de Treinamento
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Concluir Simulação 3D (Nível Médio)</span>
                    <span className="text-[10px] font-black text-purple-500 tracking-tighter">EM CURSO</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 opacity-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Revisar Protocolo de Isquemia</span>
                    <span className="text-emerald-500 text-[10px] font-black italic">CONCLUÍDO</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PERFORMANCE ANALYTICS */}
          <div className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500/40 flex items-center gap-4">
              <span className="h-[1px] w-12 bg-blue-500/20"></span> {isAdmin ? 'Análise de Rede' : 'Performance Geral'}
            </h2>

            <div className={`bg-gradient-to-br ${isAdmin ? 'from-slate-800 to-slate-950' : 'from-blue-700 to-indigo-950'} rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border border-white/10`}>
              <p className="text-blue-200 text-[9px] font-black uppercase tracking-[0.5em] mb-6">
                {isAdmin ? 'Índice de Proficiência da Unidade' : 'Índice de Proficiência Cirúrgica'}
              </p>
              
              <div className="relative flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-8xl font-black text-white italic tracking-tighter">
                    {isAdmin ? '74.2' : '78.4'}
                  </span>
                  <span className="text-xl font-black text-blue-300 opacity-40 italic">PTS</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full mt-10 overflow-hidden backdrop-blur-md border border-white/5">
                  <div className={`h-full bg-gradient-to-r ${isAdmin ? 'from-slate-500 to-slate-300' : 'from-cyan-400 to-blue-500'} shadow-[0_0_20px_#22d3ee] w-[78%] transition-all duration-1000`}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-10">
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-blue-300/40 uppercase tracking-widest mb-1 text-center">
                    {isAdmin ? 'OPERADORES' : 'Eficiência'}
                  </p>
                  <p className="text-xl font-black text-white italic text-center">
                    {isAdmin ? usersList.length : '0.88'}
                  </p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-blue-300/40 uppercase tracking-widest mb-1 text-center">
                    {isAdmin ? 'UPTIME' : 'Isquemia Méd.'}
                  </p>
                  <p className="text-xl font-black text-white italic text-center">
                    {isAdmin ? '99.9%' : '14:22'}
                  </p>
                </div>
              </div>
            </div>

            {/* HISTÓRICO RECENTE */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 ml-2">
                {isAdmin ? 'Logs de Atividade Recente' : 'Sessões Recentes'}
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="text-[9px] text-slate-500 mt-2 uppercase font-black">Carregando...</p>
                  </div>
                ) : previousResults.length === 0 ? (
                  <p className="text-center text-slate-600 text-[10px] uppercase font-black tracking-widest py-4 italic">Nenhuma sessão registrada</p>
                ) : (
                  previousResults.slice(0, 5).map((res, index) => {
                    const isAI = res.session_id && res.ai_prediction;
                    const is3D = res.mode === "3D Surgery" || res.procedure_type?.includes("3d");
                    
                    return (
                      <div 
                        key={res.session_id || res.id || index} 
                        className="group flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-transparent hover:border-blue-500/20 hover:bg-white/[0.05] transition-all cursor-pointer"
                        onClick={() => setSelectedSession(res)}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-white uppercase italic group-hover:text-blue-400 transition-colors">
                              {res.mode || res.procedure_type || "Unknown"}
                            </p>
                            {isAI && (
                              <span className="text-[7px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full uppercase font-black">
                                IA
                              </span>
                            )}
                            {is3D && (
                              <span className="text-[7px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full uppercase font-black">
                                3D
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">{res.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-black text-blue-400">{res.score}%</div>
                          <div className="text-[7px] text-slate-500 uppercase font-black tracking-tighter">{res.status}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <button className="w-full mt-6 py-4 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.5em] text-slate-600 hover:text-cyan-400 transition-all duration-300">
                {isAdmin ? 'BAIXAR RELATÓRIO DE GESTÃO_' : 'EXPORTAR RELATÓRIO COMPLETO_'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedSession && SessionDetailModal && (
        <SessionDetailModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* MODAL DE FEEDBACK */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
          <div className="bg-[#0f172a] border border-blue-500/30 w-full max-w-md rounded-[3rem] p-10 relative shadow-[0_0_80px_rgba(30,58,138,0.5)]">
            <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest">
              [ FECHAR ]
            </button>
            
            <div className="space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Relatório Técnico</p>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedUser.name}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase italic">Status Operacional</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">ONLINE</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase italic">Média de Acerto</span>
                  <span className="text-[10px] font-black text-white uppercase italic">84.2%</span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 italic">Observações da Plataforma:</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 italic">
                    "O cirurgião demonstra excelente tempo de resposta em nefrectomias parciais. Recomenda-se focar no controle de isquemia para otimizar o score final."
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)} 
                className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-xl"
              >
                CONFIRMAR LEITURA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}