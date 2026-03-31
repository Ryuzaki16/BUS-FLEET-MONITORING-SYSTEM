import {
  AlertCircle,
  Bus,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Bus as BusType } from '../types'
import { busAPI } from '../utils/api'
import { BusQRCode } from './BusQRCode'

export function FleetManagement() {
  const [buses, setBuses] = useState<BusType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'maintenance'>('all')
  const [showAddBusModal, setShowAddBusModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Form state for new bus
  const [newBus, setNewBus] = useState({
    plateNumber: '',
    driver: '',
    route: '',
    status: 'idle' as 'active' | 'idle' | 'maintenance',
    maxCapacity: 18,
    lat: 14.5995,
    lng: 120.9842,
  })

  useEffect(() => {
    loadBuses()
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
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading buses:', error)
      // Don't show error on initial load
      if (buses.length > 0) {
        toast.error('Failed to refresh fleet data')
      }
      setIsLoading(false)
    }
  }

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || bus.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: buses.length,
    active: buses.filter((b) => b.status === 'active').length,
    idle: buses.filter((b) => b.status === 'idle').length,
    maintenance: buses.filter((b) => b.status === 'maintenance').length,
    totalPassengers: buses.reduce((sum, bus) => sum + bus.currentPassengers, 0),
    avgOccupancy:
      buses.length > 0
        ? ((buses.reduce((sum, bus) => sum + bus.currentPassengers / bus.maxCapacity, 0) / buses.length) * 100).toFixed(
            0,
          )
        : '0',
  }

  const handleAddBus = async () => {
    if (!newBus.plateNumber || !newBus.driver || !newBus.route) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Generate permanent QR code ID
      const generateQRCodeId = () => {
        const cleanPlateNumber = newBus.plateNumber.replace(/\s+/g, '').toUpperCase()
        const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `QR-${cleanPlateNumber}-${randomHash}`
      }

      const busId = `bus_${Date.now()}`
      const busToAdd = {
        id: busId,
        plateNumber: newBus.plateNumber,
        driver: newBus.driver,
        route: newBus.route,
        status: newBus.status,
        currentPassengers: 0,
        maxCapacity: newBus.maxCapacity,
        location: {
          lat: newBus.lat,
          lng: newBus.lng,
          lastUpdated: new Date().toISOString(),
        },
        qrCodeId: generateQRCodeId(),
      }

      await busAPI.create(busToAdd)
      await loadBuses() // Reload buses from database
      setShowAddBusModal(false)

      // Reset form
      setNewBus({
        plateNumber: '',
        driver: '',
        route: '',
        status: 'idle',
        maxCapacity: 18,
        lat: 14.5995,
        lng: 120.9842,
      })

      toast.success('Bus added successfully!')
    } catch (error) {
      console.error('Error adding bus:', error)
      toast.error('Failed to add bus. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBus = (busId: string) => {
    if (confirm('Are you sure you want to remove this bus from the fleet?')) {
      setBuses(buses.filter((b) => b.id !== busId))
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h2 className="text-gray-900 mb-2">Fleet Management</h2>
            <p className="text-gray-600">Monitor and manage your entire bus fleet</p>
          </div>
          <button
            onClick={() => setShowAddBusModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Bus
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-4 shadow-lg"
          >
            <Bus className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-sm text-blue-100">Total Fleet</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-lg"
          >
            <CheckCircle className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.active}</div>
            <div className="text-sm text-green-100">Active</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-4 shadow-lg"
          >
            <Clock className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.idle}</div>
            <div className="text-sm text-yellow-100">Idle</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl p-4 shadow-lg"
          >
            <XCircle className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.maintenance}</div>
            <div className="text-sm text-red-100">Maintenance</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-xl p-4 shadow-lg"
          >
            <Users className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.totalPassengers}</div>
            <div className="text-sm text-purple-100">Passengers</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-xl p-4 shadow-lg"
          >
            <TrendingUp className="w-8 h-8 mb-2" />
            <div className="text-2xl mb-1">{stats.avgOccupancy}%</div>
            <div className="text-sm text-pink-100">Avg Occupancy</div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by plate number or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bus Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus, index) => (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow h-full flex flex-col"
            >
              <div
                className={`p-4 ${
                  bus.status === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : bus.status === 'idle'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                } text-white`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="mb-0">{bus.plateNumber}</h3>
                      <p className="text-sm opacity-90">{bus.driver}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-xs uppercase">
                    {bus.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <label className="text-gray-600 text-sm">Route</label>
                    <p className="text-gray-900">{bus.route}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <label className="text-gray-600 text-sm">Passengers</label>
                    </div>
                    <span className="text-gray-900">
                      {bus.currentPassengers}/{bus.maxCapacity}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        bus.currentPassengers / bus.maxCapacity < 0.5
                          ? 'bg-green-500'
                          : bus.currentPassengers / bus.maxCapacity < 0.8
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${(bus.currentPassengers / bus.maxCapacity) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                    <span>{((bus.currentPassengers / bus.maxCapacity) * 100).toFixed(0)}% capacity</span>
                    {bus.currentPassengers / bus.maxCapacity < 0.5 && <span className="text-green-600">Available</span>}
                    {bus.currentPassengers / bus.maxCapacity >= 0.5 &&
                      bus.currentPassengers / bus.maxCapacity < 0.8 && <span className="text-yellow-600">Filling</span>}
                    {bus.currentPassengers / bus.maxCapacity >= 0.8 && (
                      <span className="text-red-600">Nearly Full</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Update</span>
                    <span className="text-gray-900">{bus.location.lastUpdated.toLocaleTimeString()}</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs ${
                      bus.status === 'active' ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        bus.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}
                    />
                    {bus.status === 'active' ? 'GPS Active' : 'GPS Inactive'}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Trip ID:</span>
                    <span className="text-gray-900">{bus.currentTrip || 'No active trip'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                  <div className="flex gap-2">
                    <button className="cursor-pointer flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm">
                      View Details
                    </button>
                    <button className="cursor-pointer flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      Track Live
                    </button>
                  </div>
                  <BusQRCode busId={bus.id} plateNumber={bus.plateNumber} qrCodeId={bus.qrCodeId} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && filteredBuses.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No buses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear filter
            </button>
          </motion.div>
        )}
      </div>

      {/* Add Bus Modal */}
      <AnimatePresence>
        {showAddBusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddBusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 mb-1">Add New Bus</h3>
                    <p className="text-gray-600 text-sm">Register a new bus to the fleet</p>
                  </div>
                  <button
                    onClick={() => setShowAddBusModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  {/* Plate Number */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Plate Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ABC 1234"
                      value={newBus.plateNumber}
                      onChange={(e) => setNewBus({ ...newBus, plateNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Juan Dela Cruz"
                      value={newBus.driver}
                      onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Route */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Route <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newBus.route}
                      onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Select a route</option>
                      <option value="Dasmariñas - Alabang">Dasmariñas - Alabang</option>
                      <option value="City Center - Barangay Hall">City Center - Barangay Hall</option>
                      <option value="Market - Terminal">Market - Terminal</option>
                      <option value="Coastal Road Loop">Coastal Road Loop</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-gray-700 mb-2">Initial Status</label>
                      <select
                        value={newBus.status}
                        onChange={(e) =>
                          setNewBus({ ...newBus, status: e.target.value as 'active' | 'idle' | 'maintenance' })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      >
                        <option value="idle">Idle</option>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    {/* Max Capacity */}
                    <div>
                      <label className="block text-gray-700 mb-2">Max Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newBus.maxCapacity}
                        onChange={(e) => setNewBus({ ...newBus, maxCapacity: parseInt(e.target.value) || 18 })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">Initial GPS Location</h4>
                        <p className="text-gray-600 text-sm">Set the starting location for this bus</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={newBus.lat}
                          onChange={(e) => setNewBus({ ...newBus, lat: parseFloat(e.target.value) || 14.5995 })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={newBus.lng}
                          onChange={(e) => setNewBus({ ...newBus, lng: parseFloat(e.target.value) || 120.9842 })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => setShowAddBusModal(false)}
                  className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBus}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Bus to Fleet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
