import { Loader2, Ticket, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Passenger } from "../../types/conductor";

interface PassengerListProps {
  passengers: Passenger[];
  onRemovePassenger: (id: string) => Promise<boolean> | Promise<void> | void;
}

export function PassengerList({ passengers, onRemovePassenger }: PassengerListProps) {
  const [removingPassengerId, setRemovingPassengerId] = useState<string | null>(null);

  if (passengers.length === 0) {
    return null;
  }

  const handleRemovePassenger = async (id: string) => {
    if (removingPassengerId) return;

    try {
      setRemovingPassengerId(id);
      await Promise.resolve(onRemovePassenger(id));
    } finally {
      setRemovingPassengerId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-gray-900 font-semibold text-base sm:text-lg">Current Passengers</h3>

        {removingPassengerId && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs sm:text-sm text-slate-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Removing passenger...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {passengers.map((passenger) => (
          <PassengerCard
            key={passenger.id}
            passenger={passenger}
            isRemoving={removingPassengerId === passenger.id}
            isAnyRemoving={!!removingPassengerId}
            onRemove={() => handleRemovePassenger(passenger.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface PassengerCardProps {
  passenger: Passenger;
  isRemoving: boolean;
  isAnyRemoving: boolean;
  onRemove: () => void;
}

function PassengerCard({ passenger, isRemoving, isAnyRemoving, onRemove }: PassengerCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
        isRemoving ? "bg-red-50 border-red-200 ring-2 ring-red-100" : "bg-gray-50 border-transparent"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Ticket className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-gray-900 font-medium text-sm sm:text-base">#{passenger.ticketNumber}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{passenger.paymentMethod}</span>
        </div>

        <div className="text-gray-600 text-xs sm:text-sm break-words">
          {passenger.boardingPoint} → {passenger.destination}
        </div>

        <div className="text-gray-500 text-xs mt-1">₱{passenger.fare}</div>

        {isRemoving && (
          <div className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm text-red-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Removing...</span>
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        disabled={isAnyRemoving}
        className={`ml-2 p-2 rounded-lg transition-colors flex-shrink-0 ${
          isRemoving
            ? "text-red-700 bg-red-100 cursor-not-allowed"
            : isAnyRemoving
              ? "text-red-400 bg-red-50 cursor-not-allowed"
              : "cursor-pointer text-red-600 hover:bg-red-50"
        }`}
        aria-label={`Remove passenger ${passenger.ticketNumber}`}
      >
        {isRemoving ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
      </button>
    </div>
  );
}
