// src/pages/Home.jsx
import Navbar from "../components/Navbar";
import MainSection from "../components/MainSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <MainSection />
      <Footer />
    </div>
  );
}
