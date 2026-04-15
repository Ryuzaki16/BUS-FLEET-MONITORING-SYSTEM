import { CheckCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BOARDING_POINTS, COMMON_ROUTES, DESTINATIONS } from "../../constants/conductor";

interface TicketFormModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onIssueTicket: (ticket: TicketFormData) => Promise<boolean>;
}

export interface TicketFormData {
  ticketNumber: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  paymentMethod: "cash" | "digital";
}

export function TicketFormModal({ isOpen, isLoading, onClose, onIssueTicket }: TicketFormModalProps) {
  const [boardingPoint, setBoardingPoint] = useState<string>(BOARDING_POINTS[0]);
  const [destination, setDestination] = useState<string>(DESTINATIONS[0]);
  const [fare, setFare] = useState(45);

  const handleDestinationChange = (newDestination: string) => {
    setDestination(newDestination);

    // Auto-calculate fare based on route
    const route = COMMON_ROUTES.find((r) => r.from === boardingPoint && r.to === newDestination);
    if (route) {
      setFare(route.fare);
    }
  };

  const handleSubmit = async () => {
    const ticketData: TicketFormData = {
      ticketNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
      boardingPoint,
      destination,
      fare,
      paymentMethod: "cash",
    };

    const success = await onIssueTicket(ticketData);
    if (success) {
      // Reset form
      setBoardingPoint(BOARDING_POINTS[0]);
      setDestination(DESTINATIONS[0]);
      setFare(45);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="cursor-pointer flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Issue New Ticket</h3>
              <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Boarding Point</label>
                <select
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                >
                  {BOARDING_POINTS.map((point) => (
                    <option key={point} value={point}>
                      {point}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Destination</label>
                <select
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                >
                  {DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Fare</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={fare}
                    onChange={(e) => setFare(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Issuing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Issue Ticket
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
