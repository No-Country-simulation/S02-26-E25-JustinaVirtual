// Teste de integração
import { useState } from "react";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    email: "",
    role: "USER",
    comments: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Salva no navegador (LocalStorage) para o simulador ler
    localStorage.setItem("justina_user", JSON.stringify(formData));
    
    // 2. Mensagem de sucesso (Pode ser em português ou inglês .)
    alert(`Usuário ${formData.name} registrado com sucesso!`);
    
    console.log("Integração: Dados prontos para o Java do Fábio", formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-800">User Registration</h2>
      
      {/* O DNI é essencial para o projeto  */}
      <input 
        name="dni"
        className="w-full border rounded-md p-2" 
        placeholder="DNI / Passport" 
        onChange={handleChange}
        required
      />
      
      <input 
        name="name"
        className="w-full border rounded-md p-2" 
        placeholder="Full Name" 
        onChange={handleChange}
        required
      />
      
      <input 
        name="email"
        type="email"
        className="w-full border rounded-md p-2" 
        placeholder="Email" 
        onChange={handleChange}
        required
      />
      
      {/* Seleção de Role conforme solicitado */}
      <label className="block text-sm font-medium text-gray-700">Role:</label>
      <select 
        name="role"
        className="w-full border rounded-md p-2 bg-white"
        onChange={handleChange}
        value={formData.role}
      >
        <option value="ADMIN">ADMIN</option>
        <option value="USER">USER</option>
        <option value="TRAINEE">TRAINEE</option>
      </select>

      <textarea
        name="comments"
        className="w-full border rounded-md p-2"
        placeholder="Comments"
        rows={3}
        onChange={handleChange}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition font-bold"
      >
        Register
      </button>
    </form>
  );
}