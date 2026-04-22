import { Outlet, useNavigate } from "react-router";
import { Navbar } from "../Navbar";

export default function ConductorLayout() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/conductor");
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      <Navbar currentPage="conductor" onNavigate={handleNavigate} userRole="conductor" onLogout={handleLogout} />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}
