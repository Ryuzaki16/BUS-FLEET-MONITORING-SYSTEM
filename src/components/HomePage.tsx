import { Bus, Shield, Ticket, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onRoleSelect: (role: 'admin' | 'conductor' | 'passenger') => void;
}

export function HomePage({ onRoleSelect }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-20 h-20 bg-blue /20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl">
                <Bus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-white">DASVAN DOTSCOOP</h1>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-1g text-white mb-6"
            >
              Smart Transportation Management System
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-x1 text-white max-w-5xl mx-auto mb-20"
            >
              Integrated Bus Fleet Monitoring with QR Code Tracking for Passengers on the Dasmariñas, Cavite to Alabang,
              Muntinlupa City route
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={() => onRoleSelect('admin')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Portal
                </span>
              </button>
              <button
                onClick={() => onRoleSelect('conductor')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Conductor Portal
                </span>
              </button>
              <button
                onClick={() => onRoleSelect('passenger')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Passenger Portal
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
