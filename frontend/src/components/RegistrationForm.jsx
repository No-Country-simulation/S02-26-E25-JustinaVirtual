export default function RegistrationForm() {
  return (
    <form className="max-w-md mx-auto space-y-3">
      <input className="w-full border p-2" placeholder="DNI / Passport" />
      <input className="w-full border p-2" placeholder="Name" />
      <input className="w-full border p-2" placeholder="Nick" />
      <input className="w-full border p-2" placeholder="Email" />
      <select className="w-full border p-2">
        <option>ADMIN</option>
        <option>USER</option>
        <option>TRAINEE</option>
      </select>
      <textarea className="w-full border p-2" placeholder="Comments" />
      <button className="w-full bg-blue-600 text-white p-2">
        Register
      </button>
    </form>
  );
}
