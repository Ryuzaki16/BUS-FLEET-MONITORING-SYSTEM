import { Bus, Clock, MapPin, Navigation, Radio, Star, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { busAPI } from '../utils/api'
import { BusInfoPublic } from './BusInfoPublic'

export function PassengerPortal() {
  const [selectedDirection, setSelectedDirection] = useState<'to-alabang' | 'to-dasmarinas'>('to-alabang')
  const [nearbyBuses, setNearbyBuses] = useState<any[]>([])
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBuses()

    // Refresh bus data every 10 seconds
    const interval = setInterval(() => {
      loadBuses()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const loadBuses = async () => {
    try {
      const response = await busAPI.getAll()
      const buses = response.data || []

      // Filter active buses
      const activeBuses = buses.filter((bus: any) => bus.status === 'active')
      setNearbyBuses(activeBuses)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading buses:', error)
      // Don't show error on initial load or refreshes
      if (nearbyBuses.length > 0) {
        toast.error('Failed to refresh bus data')
      }
      setIsLoading(false)
    }
  }

  const calculateETA = () => {
    return Math.floor(Math.random() * 10) + 3
  }

  // If a bus is selected, show the bus info page
  if (selectedBusId) {
    return <BusInfoPublic busId={selectedBusId} onClose={() => setSelectedBusId(null)} />
  }

  const routeStops = [
    'Dasmarias Terminal',
    'SM City Dasmariñas',
    'Aguinaldo Highway',
    'Salitran',
    'Zapote Junction',
    'Alabang Town Center',
    'Alabang Terminal',
  ]

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h2 className="text-gray-900 mb-1 sm:mb-2">Passenger Portal</h2>
              <p className="text-gray-600 text-sm sm:text-base">Track buses in real-time and plan your commute</p>
            </div>
          </div>
        </motion.div>

        {/* Direction Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <h3 className="text-gray-900 mb-3 sm:mb-4">Select Your Direction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedDirection('to-alabang')}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                selectedDirection === 'to-alabang'
                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Navigation
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${selectedDirection === 'to-alabang' ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                    selectedDirection === 'to-alabang' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  45 km
                </span>
              </div>
              <h4 className="text-gray-900 mb-1 text-sm sm:text-base">Dasmariñas → Alabang</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Northbound route • ~45 mins</p>
            </button>

            <button
              onClick={() => setSelectedDirection('to-dasmarinas')}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                selectedDirection === 'to-dasmarinas'
                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Navigation
                  className={`w-6 h-6 sm:w-8 sm:h-8 rotate-180 ${selectedDirection === 'to-dasmarinas' ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                    selectedDirection === 'to-dasmarinas' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  45 km
                </span>
              </div>
              <h4 className="text-gray-900 mb-1 text-sm sm:text-base">Alabang → Dasmariñas</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Southbound route • ~45 mins</p>
            </button>
          </div>
        </motion.div>

        {/* Live Buses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6"
        >
          <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h3 className="text-gray-900 mb-1">Buses Nearby</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{nearbyBuses.length} buses heading your direction</p>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm">LIVE</span>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {nearbyBuses.map((bus, index) => {
              const eta = calculateETA()
              const isAlmostFull = bus.currentPassengers / bus.maxCapacity >= 0.8
              const hasSeats = bus.currentPassengers / bus.maxCapacity < 0.5

              return (
                <motion.div
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="cursor-pointer border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Bus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-gray-900 mb-0.5 sm:mb-1 truncate">{bus.plateNumber}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm truncate">{bus.driver}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto bg-indigo-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none -mx-1 sm:mx-0">
                      <div className="text-2xl sm:text-3xl text-indigo-600 mb-0.5 sm:mb-1">{eta} min</div>
                      <div className="text-gray-600 text-xs sm:text-sm">Estimated Arrival</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                          <span className="text-gray-600">Passengers</span>
                          <span className="text-gray-900">
                            {bus.currentPassengers}/{bus.maxCapacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              hasSeats ? 'bg-green-500' : isAlmostFull ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${(bus.currentPassengers / bus.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start sm:items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0">
                        <div className="text-gray-600 text-xs sm:text-sm">Current Location</div>
                        <div className="text-gray-900 text-sm sm:text-base truncate">
                          {routeStops[Math.floor(Math.random() * routeStops.length)]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-green-500" />
                      <span className="text-xs sm:text-sm text-green-600">GPS Active</span>
                    </div>

                    {hasSeats && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        Seats Available
                      </span>
                    )}
                    {!hasSeats && !isAlmostFull && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs sm:text-sm w-full sm:w-auto text-center">
                        Filling Up
                      </span>
                    )}
                    {isAlmostFull && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm w-full sm:w-auto text-center">
                        Almost Full
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Route Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
          >
            <h3 className="text-gray-900 mb-3 sm:mb-4">Route Stops</h3>
            <div className="space-y-2 sm:space-y-3">
              {routeStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4">
                  <div className="relative flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm z-10 ${
                        index === 0
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          : index === routeStops.length - 1
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index !== routeStops.length - 1 && <div className="w-0.5 h-6 sm:h-8 bg-gray-300 -mt-1" />}
                  </div>

                  <div className="flex-1 pb-3 sm:pb-4 min-w-0">
                    <h4 className="text-gray-900 text-sm sm:text-base truncate">{stop}</h4>
                    {index === 0 && <p className="text-green-600 text-xs sm:text-sm">Starting Point</p>}
                    {index === routeStops.length - 1 && (
                      <p className="text-red-600 text-xs sm:text-sm">Final Destination</p>
                    )}
                    {index !== 0 && index !== routeStops.length - 1 && (
                      <p className="text-gray-600 text-xs sm:text-sm">~{index * 6} mins from start</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
          >
            <h3 className="text-gray-900 mb-3 sm:mb-4">Fare Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm sm:text-base">Base Fare</span>
                  <span className="text-xl sm:text-2xl text-indigo-600">₱15</span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Standard fare for the entire route</p>
              </div>

              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <h4 className="text-gray-900 text-sm sm:text-base">Operating Hours</h4>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monday - Saturday</span>
                    <span className="text-gray-900">5:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="text-gray-900">6:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h4 className="text-gray-900 text-sm sm:text-base">Peak Hours</h4>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>• Morning: 6:00 AM - 9:00 AM</p>
                  <p>• Evening: 5:00 PM - 8:00 PM</p>
                  <p className="text-green-700 mt-1.5 sm:mt-2">Higher frequency during peak hours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
