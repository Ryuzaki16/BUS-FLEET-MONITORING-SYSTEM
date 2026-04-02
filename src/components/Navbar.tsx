import { BarChart3, Bus, ChevronDown, FileText, LogOut, Map, Menu, Package, Ticket, User, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";

interface NavbarProps {
  onNavigate: (page: any) => void;
  userRole: "admin" | "conductor" | "passenger";
  logout?: () => void;
}

export function Navbar({ onNavigate, userRole, logout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // Determine active page from current route
  const getCurrentPage = () => {
    const path = location.pathname;

    if (path.includes("/fleet")) return "fleet";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/reports")) return "reports";
    if (path.includes("/lostandfound")) return "lostandfound";
    if (path.includes("/conductor")) return "conductor";
    if (path.includes("/passenger")) return "passenger";
    if (path.includes("/tracking")) return "tracking";

    return "tracking";
  };

  const activePage = getCurrentPage();

  const navItems =
    userRole === "admin"
      ? [
          { id: "tracking", label: "Live Tracking", icon: Map },
          { id: "fleet", label: "Fleet Management", icon: Bus },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "reports", label: "Reports", icon: FileText },
          { id: "lostandfound", label: "Lost & Found", icon: Package },
        ]
      : userRole === "conductor"
        ? [{ id: "conductor", label: "My Dashboard", icon: Ticket }]
        : [
            { id: "passenger", label: "Track Buses", icon: Map },
            { id: "lostandfound", label: "Lost & Found", icon: Package },
          ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-gray-900">Dasvan Dotscoop</h2>
                <p className="text-gray-500 text-xs">Smart Transport System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activePage === item.id
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 "
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="cursor-pointer hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-gray-900 text-sm capitalize">{userRole}</p>
                  <p className="text-gray-500 text-xs">Dasmariñas-Alabang Route</p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50 hidden sm:block">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout?.();
                      }}
                      className="w-full cursor-pointer flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activePage === item.id
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
