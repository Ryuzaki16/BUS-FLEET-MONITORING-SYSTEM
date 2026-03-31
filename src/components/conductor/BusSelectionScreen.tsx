import { Bus, CheckCircle, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface BusSelectionScreenProps {
  busNumberInput: string;
  isValidating: boolean;
  onBusNumberChange: (value: string) => void;
  onValidate: () => void;
}

export function BusSelectionScreen({
  busNumberInput,
  isValidating,
  onBusNumberChange,
  onValidate,
}: BusSelectionScreenProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onValidate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-8 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Bus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2 text-center">Conductor Portal</h2>
            <p className="text-gray-600 text-sm sm:text-base text-center">Enter your bus number to begin</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Bus Plate Number</label>
            <div className="relative">
              <input
                type="text"
                value={busNumberInput}
                onChange={(e) => onBusNumberChange(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="e.g. ABC 1234"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none text-gray-900 text-lg font-semibold"
                disabled={isValidating}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-xs mt-2">Enter the bus number registered in Fleet Management</p>
          </div>

          <button
            onClick={onValidate}
            disabled={isValidating || !busNumberInput.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify Bus
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-800 text-xs sm:text-sm">
              <strong>Note:</strong> The bus must be registered in the Fleet Management system by an administrator
              before you can start a trip.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
