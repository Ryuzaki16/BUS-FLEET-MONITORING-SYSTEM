import { AlertTriangle, Package, Plus, Ticket, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface TripActionsProps {
  passengerCount: number;
  totalRevenue: number;
  onIssueTicket: () => void;
  onUpdateStatus: () => void;
  onReportLostItem: () => void;
}

export function TripActions({
  passengerCount,
  totalRevenue,
  onIssueTicket,
  onUpdateStatus,
  onReportLostItem,
}: TripActionsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
        {/* Issue Ticket Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={onIssueTicket}
          className="col-span-1 sm:col-span-2 lg:col-span-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] sm:hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white text-lg sm:text-xl md:text-2xl mb-0.5 sm:mb-1">Issue New Ticket</h3>
              <p className="text-green-100 text-sm sm:text-base md:text-lg">Tap to add a passenger</p>
            </div>
          </div>
        </motion.button>

        {/* Stats Cards */}
        <StatCard
          icon={<Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />}
          value={passengerCount}
          label="Total Passengers"
          delay={0.2}
        />

        <StatCard
          icon={<Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />}
          value={`₱${totalRevenue}`}
          label="Total Revenue"
          delay={0.3}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 md:mb-6">
        <ActionButton
          icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          label="Update Status"
          gradient="from-yellow-500 to-orange-500"
          onClick={onUpdateStatus}
          delay={0.4}
        />

        <ActionButton
          icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          label="Report Lost Item"
          gradient="from-purple-500 to-indigo-500"
          onClick={onReportLostItem}
          delay={0.5}
        />
      </div>
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delay: number;
}

function StatCard({ icon, value, label, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div className="text-2xl sm:text-3xl text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm sm:text-base">{label}</div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  gradient: string;
  onClick: () => void;
  delay: number;
}

function ActionButton({ icon, label, gradient, onClick, delay }: ActionButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2 sm:gap-3"
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <span className="text-gray-900 text-sm sm:text-base font-medium text-center">{label}</span>
    </motion.button>
  );
}
