import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function RegistrationForm() {
  return (
    <form className="space-y-4">

      <Input
        label="CRM / Passport"
        placeholder="Enter document number"
      />

      <Input
        label="Name"
        placeholder="Enter full name"
      />

      <Input
        label="Email"
        type="email"
        placeholder="Enter email"
      />

      {/* Select padronizado */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted">
          Role
        </label>
        <select
          className="
            flex h-10 w-full rounded-md border border-border
            bg-input px-3 py-2 text-sm text-foreground
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          "
        >
          <option>ADMIN</option>
          <option>USER</option>
          <option>TRAINEE</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        Register
      </Button>

    </form>
  );
}
