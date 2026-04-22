import { BarChart3, Bus, ChevronDown, FileText, LogOut, Map, Menu, Package, Ticket, User, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";

interface NavbarProps {
  onNavigate: (page: any) => void;
  userRole: "admin" | "conductor" | "passenger" | "qr_tracking";
  logout?: () => void;
}

export function Navbar({ onNavigate, userRole, logout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isConductor = userRole === "conductor";

  const getCurrentPage = () => {
    const path = location.pathname;

    if (path.includes("/fleet")) return "fleet";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/reports")) return "reports";
    if (path.includes("/lostandfound")) return "lostandfound";
    if (path.includes("/conductor")) return "conductor";
    if (path.includes("/passenger")) return "passenger";
    if (path.includes("/tracking")) return "tracking";
    if (path.includes("bus/track/:busId")) return "qr_tracking";

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
        ? [{ id: "conductor", label: "Conductor Portal", icon: Ticket }]
        : userRole === "qr_tracking"
          ? [
              { id: "qr_tracking", label: "QR Tracking", icon: Map },
              { id: "lostandfound", label: "Lost & Found", icon: Package },
              { id: "feedback", label: "Feedback", icon: FileText },
            ]
          : [
              { id: "passenger", label: "Track Buses", icon: Map },
              { id: "lostandfound", label: "Lost & Found", icon: Package },
            ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 shadow-lg backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex min-w-0 cursor-pointer items-center gap-3"
            onClick={() => onNavigate(isConductor ? "conductor" : "/")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-white shadow-lg">
              <img src="/logo-no-bg.png" alt="Logo" />
            </div>

            {isConductor ? (
              <>
                <div className="block min-w-0 sm:hidden">
                  <h2 className="truncate text-base font-semibold text-gray-900">Conductor Portal</h2>
                </div>

                <div className="hidden sm:block">
                  <h2 className="text-gray-900">Dasvan Dotscoop</h2>
                  <p className="text-xs text-gray-500">Smart Transport System</p>
                </div>
              </>
            ) : (
              <div className="hidden sm:block">
                <h2 className="text-gray-900">Dasvan Dotscoop</h2>
                <p className="text-xs text-gray-500">Smart Transport System</p>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                    activePage === item.id
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (userRole === "admin") {
                  setUserMenuOpen((prev) => !prev);
                }
              }}
              className="hidden cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 transition-all hover:bg-gray-100 sm:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <User className="h-4 w-4 text-white" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm capitalize text-gray-900">{userRole}</p>
                <p className="text-xs text-gray-500">Dasmariñas-Alabang Route</p>
              </div>

              {userRole === "admin" && (
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 hidden w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:block">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout?.();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {!isConductor && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isConductor && mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    activePage === item.id
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
