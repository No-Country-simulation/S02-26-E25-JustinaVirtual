import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para navegar após o registro

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    email: "",
    role: "USER",
    comments: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // 1. Persistência Local (Segurança: converte para string com tratamento)
      localStorage.setItem("justina_user", JSON.stringify(formData));
      
      console.log("✅ Integração: Dados prontos para o Backend 8081", formData);

      // 2. Feedback visual rápido
      alert(`Médico ${formData.name} registrado com sucesso! Redirecionando...`);

      // 3. Redirecionamento para o Simulador
      navigate("/simulator"); 
    } catch (error) {
      console.error("Erro ao salvar dados no navegador:", error);
      alert("Erro ao registrar. Por favor, tente novamente.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">
          Registro do Médico
        </h2>
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">DNI / Passaporte</label>
          <input 
            name="dni"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ex: 12345678" 
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Nome Completo</label>
          <input 
            name="name"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Dr. Nome Exemplo" 
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Email Acadêmico</label>
          <input 
            name="email"
            type="email"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="email@instituicao.com" 
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Nível (Role)</label>
          <select 
            name="role"
            className="w-full border rounded-md p-2 bg-gray-50 cursor-pointer"
            onChange={handleChange}
            value={formData.role}
          >
            <option value="ADMIN">ADMIN (Líder/Professor)</option>
            <option value="USER">USER (Médico Residente)</option>
            <option value="TRAINEE">TRAINEE (Estudante)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Observações Clínicas</label>
          <textarea
            name="comments"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Notas sobre a simulação..."
            rows={2}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition-all font-bold shadow-md transform active:scale-95"
        >
          Iniciar Simulação 🚀
        </button>
      </form>
    </div>
  );
}