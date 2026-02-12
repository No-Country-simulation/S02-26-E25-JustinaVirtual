import { Link } from "react-router-dom";
import { Button, Card, Alert, Input } from '../components/ui';

export default function Library() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login - Justina Simulator
        </h2>

              <div>
                 <br />
                 <Card title="Treinamento">
                       <p className="text-gray-600 mb-8">Sessão de treinamento.</p>
                    <div className="space-y-5">
                       <Input
                          label="Nome"
                          type="text"
                          placeholder="Nome de usuario"
                       />
                       <Input
                          label="Rol"
                          type="Text"
                          placeholder="Ex: Médico, Enfermeiro, Estudante"
                       />

                       <div className="flex gap-4 mt-6">
                          <Button className="flex-1">Entrar</Button>
                          <Button variant="outline" className="flex-1">
                             Criar conta
                          </Button>
                       </div>

                       {/* {error && <Alert variant="danger">{error}</Alert>} */}
                 <Link
                    to="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition">
                    Home
                 </Link>
                    </div>
                 </Card>

              </div>
      </div>
    </div>
  );
}
