import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RegistrationForm from "./components/RegistrationForm";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <main className="p-6">
        <RegistrationForm />
      </main>
      <Footer />
    </>
  );
}

export default App;

