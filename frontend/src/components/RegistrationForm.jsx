export default function RegistrationForm() {
  return (
    <form className="space-y-4">
      <input className="w-full border rounded-md p-2" placeholder="DNI / Passport" />
      <input className="w-full border rounded-md p-2" placeholder="Name" />
      <input className="w-full border rounded-md p-2" placeholder="Email" />
      
      <select className="w-full border rounded-md p-2">
        <option>ADMIN</option>
        <option>USER</option>
        <option>TRAINEE</option>
      </select>

      <textarea
        className="w-full border rounded-md p-2"
        placeholder="Comments"
        rows={3}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"
      >
        Register
      </button>
    </form>
  );
}
