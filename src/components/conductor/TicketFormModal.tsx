import { CheckCircle, Printer, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { BOARDING_POINTS, COMMON_ROUTES, DESTINATIONS } from "../../constants/conductor";

interface TicketFormModalProps {
  isOpen: boolean;
  isIssuingTicket: boolean;
  isPrintingReceipt: boolean;
  onClose: () => void;
  onIssueTicket: (ticket: TicketFormData) => Promise<boolean>;
  onReprintLastReceipt?: () => Promise<void> | void;
}

export interface TicketFormData {
  ticketNumber: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  paymentMethod: "cash" | "digital";
}

export function TicketFormModal({
  isOpen,
  isIssuingTicket,
  isPrintingReceipt,
  onClose,
  onIssueTicket,
  onReprintLastReceipt,
}: TicketFormModalProps) {
  const [boardingPoint, setBoardingPoint] = useState<string>(BOARDING_POINTS[0]);
  const [destination, setDestination] = useState<string>(DESTINATIONS[0]);
  const [fare, setFare] = useState(45);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "digital">("cash");

  const isBusy = isIssuingTicket || isPrintingReceipt;

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => dest !== boardingPoint);
  }, [boardingPoint]);

  const calculateFare = (from: string, to: string) => {
    const route = COMMON_ROUTES.find((r) => r.from === from && r.to === to);
    return route?.fare ?? 45;
  };

  const getDefaultDestination = () => DESTINATIONS[0];

  const handleBoardingPointChange = (newBoardingPoint: string) => {
    setBoardingPoint(newBoardingPoint);

    const nextDestination = destination === newBoardingPoint ? getDefaultDestination() : destination;

    setDestination(nextDestination);
    setFare(calculateFare(newBoardingPoint, nextDestination));
  };

  const handleDestinationChange = (newDestination: string) => {
    setDestination(newDestination);
    setFare(calculateFare(boardingPoint, newDestination));
  };

  const resetForm = () => {
    const defaultBoardingPoint = BOARDING_POINTS[0];
    const defaultDestination = getDefaultDestination();

    setBoardingPoint(defaultBoardingPoint);
    setDestination(defaultDestination);
    setFare(calculateFare(defaultBoardingPoint, defaultDestination));
    setPaymentMethod("cash");
  };

  const handleSubmit = async () => {
    if (isBusy) return;

    const ticketData: TicketFormData = {
      ticketNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
      boardingPoint,
      destination,
      fare,
      paymentMethod,
    };

    const success = await onIssueTicket(ticketData);

    if (success) {
      resetForm();
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
          onClick={() => !isBusy && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-lg sm:text-xl font-semibold">Issue New Ticket</h3>
              <button
                onClick={onClose}
                disabled={isBusy}
                className="cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Boarding Point</label>
                <select
                  value={boardingPoint}
                  onChange={(e) => handleBoardingPointChange(e.target.value)}
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {filteredDestinations.map((dest) => (
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
                    disabled={isBusy}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "digital")}
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="cash">Cash</option>
                  <option value="digital">Digital</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isBusy}
              className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isIssuingTicket ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Issuing ticket...
                </>
              ) : isPrintingReceipt ? (
                <>
                  <Printer className="w-5 h-5" />
                  Opening printer...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Issue Ticket
                </>
              )}
            </button>

            {isPrintingReceipt && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-900 leading-relaxed">
                  Ticket saved successfully. Opening printer service for receipt printing...
                </p>
              </div>
            )}

            {!isBusy && onReprintLastReceipt && (
              <button
                onClick={() => onReprintLastReceipt()}
                className="cursor-pointer mt-3 w-full px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Reprint Last Receipt
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
