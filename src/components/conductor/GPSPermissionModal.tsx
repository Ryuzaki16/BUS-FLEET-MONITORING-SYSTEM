import { CheckCircle, Info, Navigation } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Location } from '../../types/conductor'

interface GPSPermissionModalProps {
  isOpen: boolean
  currentLocation: Location | null
  isRequesting: boolean
  onRequestPermission: () => void
  onSkip: () => void
}

export function GPSPermissionModal({
  isOpen,
  currentLocation,
  isRequesting,
  onRequestPermission,
  onSkip,
}: GPSPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Navigation className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-gray-900 mb-2 text-center">Enable GPS Tracking</h3>
              <p className="text-gray-600 text-sm sm:text-base text-center">
                Allow real-time location tracking to provide accurate bus position updates to passengers and
                administrators.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why GPS is needed:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Real-time bus location updates</li>
                    <li>• Accurate arrival time estimates</li>
                    <li>• Enhanced passenger experience</li>
                    <li>• Route tracking and analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            {currentLocation && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">GPS Active</p>
                  <p className="text-xs">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSkip}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Skip for Now
              </button>
              <button
                onClick={onRequestPermission}
                disabled={isRequesting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRequesting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Enable GPS
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change this setting later from your browser preferences
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
