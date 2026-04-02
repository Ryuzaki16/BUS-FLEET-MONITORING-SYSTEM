import { Ticket, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Passenger } from '../../types/conductor';

interface PassengerListProps {
  passengers: Passenger[];
  onRemovePassenger: (id: string) => void;
}

export function PassengerList({ passengers, onRemovePassenger }: PassengerListProps) {
  if (passengers.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
    >
      <h3 className="text-gray-900 mb-4">Current Passengers</h3>
      <div className="space-y-3">
        {passengers.map((passenger) => (
          <PassengerCard key={passenger.id} passenger={passenger} onRemove={() => onRemovePassenger(passenger.id)} />
        ))}
      </div>
    </motion.div>
  );
}

interface PassengerCardProps {
  passenger: Passenger;
  onRemove: () => void;
}

function PassengerCard({ passenger, onRemove }: PassengerCardProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Ticket className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-gray-900 font-medium text-sm sm:text-base">#{passenger.ticketNumber}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{passenger.paymentMethod}</span>
        </div>
        <div className="text-gray-600 text-xs sm:text-sm">
          {passenger.boardingPoint} → {passenger.destination}
        </div>
        <div className="text-gray-500 text-xs mt-1">₱{passenger.fare}</div>
      </div>
      <button
        onClick={onRemove}
        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
