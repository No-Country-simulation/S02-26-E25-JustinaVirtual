// src/layouts/AppLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar fixed at top */}
      <header className="
          fixed top-0 left-0 right-0 z-50
          border-b border-border
          shadow-md                
        ">
        <Navbar />
      </header>

      {/* Main content scrolls underneath */}
      <main className="flex-1 pt-[--navbar-height] md:pt-24 bg-background overflow-y-auto">
        <Outlet />  {/* pages render here */}
      </main>

      {/* Optional: Footer if you want it on all app pages */}
      {/* <Footer /> */}
    </div>
  );
}