import { Bus, Clock, MapPin, Maximize2, Navigation, Radio, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bus as BusType } from '../types'
import { busAPI } from '../utils/api'
import { MapView } from './MapView'

export function LiveTracking() {
  const [buses, setBuses] = useState<BusType[]>([])
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null)
  const [mapZoom, setMapZoom] = useState(false)
  const [useRealMap, setUseRealMap] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBuses()

    // Refresh bus data every 5 seconds
    const interval = setInterval(() => {
      loadBuses()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadBuses = async () => {
    try {
      const response = await busAPI.getAll()
      const busesData = response.data || []

      // Convert date strings to Date objects
      const formattedBuses = busesData.map((bus: any) => ({
        ...bus,
        location: {
          ...bus.location,
          lastUpdated: bus.location?.lastUpdated ? new Date(bus.location.lastUpdated) : new Date(),
        },
      }))

      setBuses(formattedBuses)

      // Set first bus as selected if none selected
      if (!selectedBus && formattedBuses.length > 0) {
        setSelectedBus(formattedBuses[0])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading buses:', error)
      // Don't show error toast if it's first load - just set empty array
      if (buses.length > 0) {
        toast.error('Failed to refresh bus data')
      }
      setIsLoading(false)
    }
  }

  const activeBuses = buses.filter((b) => b.status === 'active').length
  const totalPassengers = buses.reduce((sum, bus) => sum + bus.currentPassengers, 0)

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="text-gray-900 mb-2">Live GPS Tracking</h2>
          <p className="text-gray-600">Real-time monitoring of all buses on the Dasmariñas-Alabang route</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 text-xs">Live</span>
              </div>
            </div>
            <div className="text-3xl text-gray-900 mb-1">
              {activeBuses}/{buses.length}
            </div>
            <div className="text-gray-600 text-sm">Active Buses</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl text-gray-900 mb-1">{totalPassengers}</div>
            <div className="text-gray-600 text-sm">Total Passengers</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl text-gray-900 mb-1">45km</div>
            <div className="text-gray-600 text-sm">Route Distance</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl text-gray-900 mb-1">~45m</div>
            <div className="text-gray-600 text-sm">Avg Trip Time</div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map View */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`${mapZoom ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white rounded-2xl shadow-xl overflow-hidden`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">Live Map View</h3>
                  <p className="text-gray-600 text-sm">Interactive GPS tracking enabled</p>
                </div>
              </div>
              <button onClick={() => setMapZoom(!mapZoom)} className="p-2 hover:bg-white rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Real Interactive Map */}
            <MapView
              buses={buses}
              selectedBus={selectedBus}
              onBusSelect={setSelectedBus}
              height={mapZoom ? '600px' : '500px'}
            />
          </motion.div>

          {/* Bus List */}
          {!mapZoom && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-gray-900">Fleet Status</h3>
                <p className="text-gray-600 text-sm">{activeBuses} buses active now</p>
              </div>

              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {buses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedBus?.id === bus.id
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            bus.status === 'active'
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : bus.status === 'idle'
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                : 'bg-gradient-to-br from-red-500 to-pink-600'
                          }`}
                        >
                          <Bus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900">{bus.plateNumber}</div>
                          <div className="text-gray-600 text-sm">{bus.driver}</div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          bus.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : bus.status === 'idle'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Passengers</span>
                        <span className="text-gray-900">
                          {bus.currentPassengers}/{bus.maxCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            bus.currentPassengers / bus.maxCapacity < 0.5
                              ? 'bg-green-500'
                              : bus.currentPassengers / bus.maxCapacity < 0.8
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${(bus.currentPassengers / bus.maxCapacity) * 100}%` }}
                        />
                      </div>

                      {bus.status === 'active' && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <Radio className="w-3 h-3 text-green-500" />
                          <span>
                            GPS: {bus.location.lat.toFixed(4)}, {bus.location.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Selected Bus Details */}
        {selectedBus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <Bus className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="mb-1">Bus Details: {selectedBus.plateNumber}</h3>
                    <p className="text-indigo-100">{selectedBus.driver}</p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedBus.status === 'active'
                      ? 'bg-green-500'
                      : selectedBus.status === 'idle'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                >
                  {selectedBus.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-gray-900">Route Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-600 text-sm">Route</label>
                    <p className="text-gray-900">{selectedBus.route}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Current Trip ID</label>
                    <p className="text-gray-900">{selectedBus.currentTrip || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-900">Passenger Data</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-600 text-sm">Current Load</label>
                    <p className="text-gray-900">
                      {selectedBus.currentPassengers} / {selectedBus.maxCapacity} passengers
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Capacity</label>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                      <div
                        className={`h-3 rounded-full ${
                          selectedBus.currentPassengers / selectedBus.maxCapacity < 0.5
                            ? 'bg-green-500'
                            : selectedBus.currentPassengers / selectedBus.maxCapacity < 0.8
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(selectedBus.currentPassengers / selectedBus.maxCapacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {((selectedBus.currentPassengers / selectedBus.maxCapacity) * 100).toFixed(0)}% full
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-900">GPS Location</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-600 text-sm">Coordinates</label>
                    <p className="text-gray-900 text-sm">
                      {selectedBus.location.lat.toFixed(6)}, {selectedBus.location.lng.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Last Update</label>
                    <p className="text-gray-900">{selectedBus.location.lastUpdated.toLocaleTimeString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-4 h-4" />
                    <span className="text-sm">GPS Signal: Strong</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
