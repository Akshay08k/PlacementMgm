import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

