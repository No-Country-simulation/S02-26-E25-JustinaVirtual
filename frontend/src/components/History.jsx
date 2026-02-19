import { useEffect, useState } from "react";

export default function History() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // No futuro, aqui faremos o fetch para o endpoint do Dev 3: GET /historico
    // Por enquanto, podemos simular um dado local
    const mockData = [
      {
        id: 1,
        date: "10/02/2026",
        duration: "45s",
        points: 1250,
        status: "Concluído",
        feedback: "Excelente precisão no rim."
      }
    ];
    setSessions(mockData);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Histórico de Simulações</h2>
      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s.id} className="border-l-4 border-blue-500 p-4 bg-gray-50 rounded">
            <p className="font-semibold text-gray-700">Sessão em {s.date}</p>
            <div className="text-sm text-gray-500 flex gap-4 mt-2">
              <span>⏱ Duração: {s.duration}</span>
              <span>📍 Pontos: {s.points}</span>
              <span className="text-green-600 font-medium">✓ {s.status}</span>
            </div>
            <p className="mt-2 text-gray-600 italic">"{s.feedback}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}