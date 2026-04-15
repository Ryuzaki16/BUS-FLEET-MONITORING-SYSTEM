import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Toaster } from "./ui/sonner";

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to passenger portal by default when at root
    if (location.pathname === "/") {
      navigate("/conductor", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Outlet />
      <Toaster />
    </div>
  );
}
