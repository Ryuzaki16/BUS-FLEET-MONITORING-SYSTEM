import {
  AlertOctagon,
  AlertTriangle,
  Bus,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Minus,
  Package,
  Plus,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { busAPI, lostItemAPI, passengerAPI, tripAPI } from '../utils/api'

interface Passenger {
  id: string
  ticketNumber: string
  boardingPoint: string
  destination: string
  fare: number
  timestamp: Date | string
  paymentMethod: 'cash' | 'digital'
}

export function ConductorPortal() {
  const [tripActive, setTripActive] = useState(false)
  const [currentTripId, setCurrentTripId] = useState<string | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showLostItemForm, setShowLostItemForm] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<'on-time' | 'delayed' | 'emergency' | 'stopped'>('on-time')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Ticket form state
  const [boardingPoint, setBoardingPoint] = useState('Dasmariñas')
  const [destination, setDestination] = useState('Alabang')
  const [fare, setFare] = useState(45)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash')

  // Lost item form state
  const [lostItem, setLostItem] = useState({
    itemName: '',
    description: '',
    category: 'other',
    location: '',
  })

  const busInfo = {
    id: 'bus1',
    plateNumber: 'ABC 1234',
    route: 'Dasmariñas - Alabang',
    driver: 'Juan Dela Cruz',
    capacity: 18,
  }

  useEffect(() => {
    // Check if there's an active trip for this bus
    loadActiveTrip()
  }, [])

  const loadActiveTrip = async () => {
    try {
      const response = await tripAPI.getOngoing()
      const activeTrip = response.data.find((trip: any) => trip.busId === busInfo.id)

      if (activeTrip) {
        setTripActive(true)
        setCurrentTripId(activeTrip.id)

        // Load passengers for this trip
        const passengersResponse = await passengerAPI.getByTrip(activeTrip.id)
        setPassengers(
          passengersResponse.data.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp),
          })),
        )
      }
    } catch (error) {
      console.error('Error loading active trip:', error)
    }
  }

  const handleStartTrip = async () => {
    setIsLoading(true)
    try {
      const tripId = `trip_${Date.now()}`
      const response = await tripAPI.create({
        id: tripId,
        busId: busInfo.id,
        busPlateNumber: busInfo.plateNumber,
        driver: busInfo.driver,
        route: busInfo.route,
      })

      setTripActive(true)
      setCurrentTripId(tripId)
      setPassengers([])
      toast.success('Trip started successfully!')
    } catch (error) {
      console.error('Error starting trip:', error)
      toast.error('Failed to start trip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndTrip = async () => {
    if (!currentTripId) return

    setIsLoading(true)
    try {
      await tripAPI.end(currentTripId)
      setTripActive(false)
      setCurrentTripId(null)
      setPassengers([])
      toast.success('Trip ended successfully!')
    } catch (error) {
      console.error('Error ending trip:', error)
      toast.error('Failed to end trip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (status: 'on-time' | 'delayed' | 'emergency' | 'stopped', message: string = '') => {
    setCurrentStatus(status)
    setStatusMessage(message)
    setShowStatusModal(false)

    try {
      await busAPI.setAlert(busInfo.id, {
        status,
        message,
        plateNumber: busInfo.plateNumber,
        route: busInfo.route,
      })

      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
      toast.success('Status updated successfully!')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status.')
    }
  }

  const commonRoutes = [
    { from: 'Dasmariñas', to: 'Alabang', fare: 45 },
    { from: 'Dasmariñas', to: 'Zapote', fare: 35 },
    { from: 'Dasmariñas', to: 'Sucat', fare: 40 },
    { from: 'Zapote', to: 'Alabang', fare: 25 },
    { from: 'Sucat', to: 'Alabang', fare: 15 },
  ]

  const issueTicket = async () => {
    if (!currentTripId) {
      toast.error('No active trip. Please start a trip first.')
      return
    }

    setIsLoading(true)
    try {
      const passengerId = `TKT-${Date.now()}`
      const newPassenger: Omit<Passenger, 'timestamp'> = {
        id: passengerId,
        ticketNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
        boardingPoint,
        destination,
        fare,
        paymentMethod: 'cash',
      }

      await passengerAPI.add(currentTripId, newPassenger)

      setPassengers([...passengers, { ...newPassenger, timestamp: new Date() }])
      setShowTicketForm(false)

      // Reset form
      setBoardingPoint('Dasmariñas')
      setDestination('Alabang')
      setFare(45)

      toast.success('Ticket issued successfully!')
    } catch (error) {
      console.error('Error issuing ticket:', error)
      toast.error('Failed to issue ticket. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const removePassenger = async (id: string) => {
    if (!currentTripId) return

    setIsLoading(true)
    try {
      await passengerAPI.remove(currentTripId, id)
      setPassengers(passengers.filter((p) => p.id !== id))
      toast.success('Passenger removed successfully!')
    } catch (error) {
      console.error('Error removing passenger:', error)
      toast.error('Failed to remove passenger.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportItem = async () => {
    setIsLoading(true)
    try {
      const itemId = `lf_${Date.now()}`
      await lostItemAPI.create({
        id: itemId,
        ...lostItem,
        busPlateNumber: busInfo.plateNumber,
        route: busInfo.route,
        foundBy: busInfo.driver,
      })

      setShowLostItemForm(false)
      setShowSuccessToast(true)
      setLostItem({
        itemName: '',
        description: '',
        category: 'other',
        location: '',
      })
      setTimeout(() => setShowSuccessToast(false), 3000)
      toast.success('Lost item reported successfully!')
    } catch (error) {
      console.error('Error reporting lost item:', error)
      toast.error('Failed to report lost item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 md:mb-6">
          <h2 className="text-gray-900 mb-1 md:mb-2">Conductor Dashboard</h2>
          <p className="text-gray-600 text-sm md:text-base">Issue tickets and manage your trip</p>
        </motion.div>

        {/* Trip Selection Card - Prioritized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 md:mb-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bus className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 md:mb-2 text-white text-xl sm:text-2xl">{busInfo.plateNumber}</h3>
                <p className="text-indigo-100 text-sm sm:text-base md:text-lg truncate">{busInfo.route}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 md:mt-3">
                  <div className="flex items-center gap-2 text-indigo-100 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>
                      {passengers.length}/{busInfo.capacity} passengers
                    </span>
                  </div>
                  {tripActive && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white/20 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white text-xs sm:text-sm">Trip Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => (tripActive ? handleEndTrip() : handleStartTrip())}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg w-full sm:w-auto ${
                tripActive
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg'
              }`}
            >
              {tripActive ? (
                <>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>End Trip</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Start Trip</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {tripActive ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
              {/* Quick Issue Ticket Button - Highly Visible */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowTicketForm(true)}
                className="col-span-1 sm:col-span-2 lg:col-span-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] sm:hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-lg sm:text-xl md:text-2xl mb-0.5 sm:mb-1">Issue New Ticket</h3>
                    <p className="text-green-100 text-sm sm:text-base md:text-lg">Tap to add a passenger</p>
                  </div>
                </div>
              </motion.button>

              {/* Report Lost Item Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                onClick={() => setShowLostItemForm(true)}
                className="w-full bg-white text-indigo-900 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border border-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.98] sm:hover:scale-[1.02] group"
              >
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-indigo-900 text-base sm:text-lg font-semibold">Found Item</h3>
                    <p className="text-indigo-400 text-xs sm:text-sm">Log item found</p>
                  </div>
                </div>
              </motion.button>

              {/* Status/Delay Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowStatusModal(true)}
                className={`w-full rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border transition-all active:scale-[0.98] sm:hover:scale-[1.02] group ${
                  currentStatus === 'on-time'
                    ? 'bg-white text-indigo-900 border-indigo-100 hover:border-indigo-300'
                    : currentStatus === 'emergency'
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-amber-100 text-amber-900 border-amber-200'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                      currentStatus === 'on-time'
                        ? 'bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600'
                        : currentStatus === 'emergency'
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {currentStatus === 'emergency' ? (
                      <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    ) : currentStatus === 'delayed' ? (
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3
                      className={`text-base sm:text-lg font-semibold ${currentStatus === 'emergency' ? 'text-white' : 'text-indigo-900'}`}
                    >
                      {currentStatus === 'on-time'
                        ? 'Report Issue'
                        : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${currentStatus === 'emergency' ? 'text-red-100' : 'text-indigo-400'}`}
                    >
                      {currentStatus === 'on-time' ? 'Delay or Emergency' : 'Tap to update'}
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Passengers List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-gray-900 text-base sm:text-lg md:text-xl">Current Passengers</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base ${
                        passengers.length >= busInfo.capacity
                          ? 'bg-red-100 text-red-700'
                          : passengers.length >= busInfo.capacity * 0.8
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {passengers.length} / {busInfo.capacity}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {passengers.length === 0 ? (
                  <div className="p-8 sm:p-12 md:p-16 text-center">
                    <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">No passengers yet</h4>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                      Click "Issue New Ticket" to add your first passenger
                    </p>
                    <button
                      onClick={() => setShowTicketForm(true)}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm sm:text-base"
                    >
                      Issue First Ticket
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-4 px-6 text-gray-600">Ticket #</th>
                            <th className="text-left py-4 px-6 text-gray-600">Boarding</th>
                            <th className="text-left py-4 px-6 text-gray-600">Destination</th>
                            <th className="text-left py-4 px-6 text-gray-600">Fare</th>
                            <th className="text-left py-4 px-6 text-gray-600">Payment</th>
                            <th className="text-left py-4 px-6 text-gray-600">Time</th>
                            <th className="text-left py-4 px-6 text-gray-600">Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {passengers.map((passenger, index) => (
                            <motion.tr
                              key={passenger.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <Ticket className="w-5 h-5 text-indigo-600" />
                                  <span className="text-gray-900">{passenger.ticketNumber}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-700">{passenger.boardingPoint}</td>
                              <td className="py-4 px-6 text-gray-700">{passenger.destination}</td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900">₱{passenger.fare}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    passenger.paymentMethod === 'cash'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {passenger.paymentMethod === 'cash' ? 'Cash' : 'Digital'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-gray-600">
                                {typeof passenger.timestamp === 'string'
                                  ? passenger.timestamp
                                  : passenger.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => removePassenger(passenger.id)}
                                  className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all"
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {passengers.map((passenger, index) => (
                        <motion.div
                          key={passenger.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Ticket className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                              <span className="text-gray-900 truncate">#{passenger.ticketNumber}</span>
                            </div>
                            <button
                              onClick={() => removePassenger(passenger.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all flex-shrink-0"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Route:</span>
                              <span className="text-gray-900">
                                {passenger.boardingPoint} → {passenger.destination}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Fare:</span>
                              <span className="text-gray-900">₱{passenger.fare}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Payment:</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs ${
                                  passenger.paymentMethod === 'cash'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {passenger.paymentMethod === 'cash' ? 'Cash' : 'Digital'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Time:</span>
                              <span className="text-gray-600">
                                {typeof passenger.timestamp === 'string'
                                  ? passenger.timestamp
                                  : passenger.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 sm:p-12 md:p-16 text-center shadow-xl"
          >
            <MapPin className="w-20 h-20 sm:w-24 sm:h-24 text-indigo-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-gray-900 text-xl sm:text-2xl mb-2 sm:mb-3">Ready to Start Your Trip?</h3>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
              Click "Start Trip" above to begin accepting passengers
            </p>
            <button
              onClick={() => handleStartTrip()}
              className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-2xl transition-all text-base sm:text-lg"
            >
              Start Trip Now
            </button>

            <button
              onClick={() => setShowLostItemForm(true)}
              className="mt-6 text-indigo-600 font-medium flex items-center gap-2 mx-auto hover:text-indigo-800 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
            >
              <Package className="w-5 h-5" />
              <span>Report Found Item</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Ticket Form Modal - Simplified & Streamlined */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowTicketForm(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div>
                  <h3 className="text-gray-900 text-xl sm:text-2xl">Issue Ticket</h3>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Add a new passenger to this trip</p>
                </div>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Quick Route Selection - Most Prominent */}
                <div>
                  <label className="block text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Quick Route Selection</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {commonRoutes.map((route, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setBoardingPoint(route.from)
                          setDestination(route.to)
                          setFare(route.fare)
                        }}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                          boardingPoint === route.from && destination === route.to
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        <div className="text-gray-900 mb-1 text-sm sm:text-base truncate">{route.from}</div>
                        <div className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2 truncate">↓ {route.to}</div>
                        <div className="text-indigo-600 text-sm sm:text-base">₱{route.fare}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">Boarding Point</label>
                    <select
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    >
                      <option>Dasmariñas</option>
                      <option>Zapote</option>
                      <option>Sucat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">Destination</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    >
                      <option>Alabang</option>
                      <option>Sucat</option>
                      <option>Zapote</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">Fare Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base sm:text-lg">
                      ₱
                    </span>
                    <input
                      type="number"
                      value={fare}
                      onChange={(e) => setFare(Number(e.target.value))}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all text-base sm:text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={issueTicket}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Issue Ticket</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lost Item Form Modal */}
      <AnimatePresence>
        {showLostItemForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLostItemForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 text-xl font-bold">Report Found Item</h2>
                    <p className="text-gray-500 text-sm">Log an item found on your bus</p>
                  </div>
                  <button
                    onClick={() => setShowLostItemForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Photo Placeholder */}
                  <div className="w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Take Photo of Item</span>
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Item Name</label>
                    <input
                      type="text"
                      value={lostItem.itemName}
                      onChange={(e) => setLostItem({ ...lostItem, itemName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g., Blue Umbrella"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                    <select
                      value={lostItem.category}
                      onChange={(e) => setLostItem({ ...lostItem, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="bag">Bag</option>
                      <option value="clothing">Clothing</option>
                      <option value="documents">Documents</option>
                      <option value="accessories">Accessories</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={lostItem.description}
                      onChange={(e) => setLostItem({ ...lostItem, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
                      placeholder="Color, brand, distinguishing marks..."
                    />
                  </div>

                  {/* Location Found */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Location in Bus</label>
                    <input
                      type="text"
                      value={lostItem.location}
                      onChange={(e) => setLostItem({ ...lostItem, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g., Seat 4, Rear Overhead Bin"
                    />
                  </div>

                  {/* Auto-filled info */}
                  <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
                    <Bus className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-indigo-900 font-medium">Logged for Bus {busInfo.plateNumber}</p>
                      <p className="text-indigo-700">Item will be registered to your current shift.</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowLostItemForm(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReportItem}
                      disabled={!lostItem.itemName || !lostItem.description}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status/Delay Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 text-xl font-bold">Trip Status</h2>
                    <p className="text-gray-500 text-sm">Report delay or emergency</p>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleUpdateStatus('on-time')}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                      currentStatus === 'on-time'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-900 font-semibold">On Time</h3>
                      <p className="text-gray-500 text-sm">Trip is running as scheduled</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('delayed', 'Heavy Traffic')}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                      currentStatus === 'delayed'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-900 font-semibold">Delayed</h3>
                      <p className="text-gray-500 text-sm">Traffic or minor delay</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('emergency', 'Medical Emergency')}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                      currentStatus === 'emergency'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertOctagon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-900 font-semibold">Emergency</h3>
                      <p className="text-gray-500 text-sm">Accident or mechanical failure</p>
                    </div>
                  </button>
                </div>

                {currentStatus !== 'on-time' && (
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Additional Details</label>
                    <input
                      type="text"
                      value={statusMessage}
                      onChange={(e) => setStatusMessage(e.target.value)}
                      placeholder="e.g., Flat tire, Stuck at intersection"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      onClick={() => handleUpdateStatus(currentStatus, statusMessage)}
                      className="mt-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium"
                    >
                      Update Details
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <div className="bg-green-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Item reported successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
