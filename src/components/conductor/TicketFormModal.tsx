import { CheckCircle, PhilippinePeso, Printer, X } from "lucide-react";
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
  fare: number; // total fare
  unitFare?: number; // per-passenger fare
  paymentMethod: "cash" | "digital";
  type: string;
  passengerCount: number;
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
  const [passengerType, setPassengerType] = useState<string>("regular");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "digital">("cash");

  const [boardingPointIsOther, setBoardingPointIsOther] = useState(false);
  const [destinationIsOther, setDestinationIsOther] = useState(false);
  const [boardingPointCustom, setBoardingPointCustom] = useState("");
  const [destinationCustom, setDestinationCustom] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);

  const isBusy = isIssuingTicket || isPrintingReceipt;

  const effectiveBoardingPoint = boardingPointIsOther ? boardingPointCustom : boardingPoint;
  const effectiveDestination = destinationIsOther ? destinationCustom : destination;
  // const totalFare = fare * passengerCount;

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => dest !== boardingPoint);
  }, [boardingPoint]);

  const calculateFare = (from: string, to: string) => {
    const route = COMMON_ROUTES.find((r) => r.from === from && r.to === to);
    return route?.fare ?? 45;
  };

  const getDefaultDestination = () => DESTINATIONS[0];

  const handleBoardingPointChange = (newBoardingPoint: string) => {
    if (newBoardingPoint === "__other__") {
      setBoardingPointIsOther(true);
      setBoardingPointCustom("");
      setFare(45);
      return;
    }

    setBoardingPointIsOther(false);
    setBoardingPoint(newBoardingPoint);

    const nextDestination = destination === newBoardingPoint ? getDefaultDestination() : destination;
    setDestination(nextDestination);
    setFare(calculateFare(newBoardingPoint, nextDestination));
  };

  const handleDestinationChange = (newDestination: string) => {
    if (newDestination === "__other__") {
      setDestinationIsOther(true);
      setDestinationCustom("");
      setFare(45);
      return;
    }

    setDestinationIsOther(false);
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
    setPassengerType("regular");
    setBoardingPointIsOther(false);
    setDestinationIsOther(false);
    setBoardingPointCustom("");
    setDestinationCustom("");
    setPassengerCount(1);
  };

  const handleSubmit = async () => {
    if (isBusy) return;

    const safePassengerCount = Math.max(1, passengerCount);
    const totalFare = fare * safePassengerCount;

    const ticketData: TicketFormData = {
      ticketNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
      boardingPoint: effectiveBoardingPoint,
      destination: effectiveDestination,
      fare: totalFare,
      unitFare: fare,
      paymentMethod,
      type: passengerType,
      passengerCount: safePassengerCount,
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
              {/* Boarding Point */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Boarding Point</label>
                <select
                  value={boardingPointIsOther ? "__other__" : boardingPoint}
                  onChange={(e) => handleBoardingPointChange(e.target.value)}
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {BOARDING_POINTS.map((point) => (
                    <option key={point} value={point}>
                      {point}
                    </option>
                  ))}
                  <option value="__other__">Other (type manually)</option>
                </select>
                <AnimatePresence>
                  {boardingPointIsOther && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={boardingPointCustom}
                        onChange={(e) => setBoardingPointCustom(e.target.value)}
                        placeholder="Enter boarding point..."
                        disabled={isBusy}
                        autoFocus
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-400"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Destination</label>
                <select
                  value={destinationIsOther ? "__other__" : destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {filteredDestinations.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                  <option value="__other__">Other (type manually)</option>
                </select>
                <AnimatePresence>
                  {destinationIsOther && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={destinationCustom}
                        onChange={(e) => setDestinationCustom(e.target.value)}
                        placeholder="Enter destination..."
                        disabled={isBusy}
                        autoFocus
                        className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-400"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Fare</label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-2 flex items-center text-gray-500">
                      <PhilippinePeso className="w-4 h-4" />
                    </div>

                    <input
                      type="number"
                      value={fare}
                      onChange={(e) => setFare(Number(e.target.value))}
                      disabled={isBusy}
                      className="w-full pl-7 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Number of Passengers</label>

                  <input
                    type="number"
                    min={1}
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Math.max(1, Number(e.target.value)))}
                    disabled={isBusy}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Passenger Type</label>
                <select value={passengerType}
                  onChange={(e) => setPassengerType(e.target.value)}
                  disabled={isBusy}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="regular">Regular</option>
                  <option value="student">Student</option>
                  <option value="pwd">PWD</option>
                  <option value="senior">Senior Citizen</option>
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