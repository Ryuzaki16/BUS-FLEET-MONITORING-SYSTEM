import { Bus, CheckCircle, Search } from "lucide-react";
import { motion } from "motion/react";

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
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onValidate();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 sm:px-4 md:px-6">
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/70 p-5 sm:p-7 md:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Bus className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Conductor Portal</h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-sm">Enter your bus plate number to continue</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bus Plate Number</label>

              <div className="relative">
                <input
                  type="text"
                  value={busNumberInput}
                  onChange={(e) => onBusNumberChange(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g. ABC 1234"
                  disabled={isValidating}
                  className="w-full h-12 px-4 pr-11 border-2 border-gray-200 rounded-xl bg-white text-gray-900 text-base sm:text-lg font-semibold placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed">
                Enter the bus plate number registered in Fleet Management.
              </p>
            </div>

            <button
              onClick={onValidate}
              disabled={isValidating || !busNumberInput.trim()}
              className="cursor-pointer w-full min-h-12 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-blue-600 flex items-center justify-center gap-2 shadow-md"
            >
              {isValidating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify Bus</span>
                </>
              )}
            </button>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-blue-900 text-xs sm:text-sm leading-relaxed">
                <strong>Note:</strong> The bus must already be registered in the Fleet Management system by an
                administrator before you can start a trip.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
