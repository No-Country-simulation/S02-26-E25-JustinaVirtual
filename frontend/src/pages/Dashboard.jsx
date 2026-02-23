import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p>Access denied.</p>
      </div>
    );
  }

  // 🔮 MOCK de resultados (depois virá do backend)
  const previousResults = [
    {
      id: 1,
      date: "2026-02-01",
      mode: "Training",
      score: "85%",
      status: "Approved",
    },
    {
      id: 2,
      date: "2026-01-28",
      mode: "Simulator",
      score: "72%",
      status: "Needs Improvement",
    },
  ];

  return (
    <div className="min-h-screen bg-color-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-card p-6 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user.name}
            </h1>
            <p className="text-muted">{user.crm}</p>
            <p className="text-muted">{user.specialty}</p>
          </div>

          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-card p-6 rounded-xl shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Training Mode
            </h2>
            <p className="text-sm text-muted">
              Practice guided procedures and improve technique.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate("/training")}
            >
              Start Training
            </Button>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Simulator Mode
            </h2>
            <p className="text-sm text-muted">
              Simulate real-case scenarios under evaluation.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate("/simulator")}
            >
              Start Simulation
            </Button>
          </div>

        </div>

        {/* PREVIOUS RESULTS */}
        <div className="bg-card p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Previous Results
          </h2>

          {previousResults.length === 0 ? (
            <p className="text-muted">
              No previous results found.
            </p>
          ) : (
            <div className="space-y-4">
              {previousResults.map((result) => (
                <div
                  key={result.id}
                  className="flex justify-between items-center border border-border rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium">
                      {result.mode}
                    </p>
                    <p className="text-sm text-muted">
                      {result.date}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {result.score}
                    </p>
                    <p
                      className={`text-sm ${
                        result.status === "Approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {result.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
