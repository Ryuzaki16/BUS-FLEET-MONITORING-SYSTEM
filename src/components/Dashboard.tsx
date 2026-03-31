import { Bus, Clock, DollarSign, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mockBuses, mockTrips } from '../data/mockData';
import { Bus as BusType, Trip } from '../types';

interface DashboardProps {
  role: 'barker' | 'barangay';
}

export function Dashboard({ role }: DashboardProps) {
  const [buses, setBuses] = useState<BusType[]>(mockBuses);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => ({
          ...bus,
          currentPassengers:
            bus.status === 'active'
              ? Math.min(bus.maxCapacity, Math.max(0, bus.currentPassengers + Math.floor(Math.random() * 5) - 2))
              : bus.currentPassengers,
          location: {
            ...bus.location,
            lat: bus.location.lat + (Math.random() - 0.5) * 0.001,
            lng: bus.location.lng + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date(),
          },
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activeBuses = buses.filter((b) => b.status === 'active').length;
  const totalPassengers = buses.reduce((sum, bus) => sum + bus.currentPassengers, 0);
  const totalRevenue = trips.reduce((sum, trip) => sum + trip.totalFare, 0);
  const averageOccupancy = (totalPassengers / (buses.length * 18)) * 100;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Bus className="w-8 h-8 text-blue-600" />
            <span className="text-blue-600">
              {activeBuses}/{buses.length}
            </span>
          </div>
          <h4 className="text-gray-900">Active Buses</h4>
          <p className="text-gray-600 text-sm">On the road now</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-green-600">{totalPassengers}</span>
          </div>
          <h4 className="text-gray-900">Total Passengers</h4>
          <p className="text-gray-600 text-sm">Currently riding</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-purple-600">₱{totalRevenue}</span>
          </div>
          <h4 className="text-gray-900">Today's Revenue</h4>
          <p className="text-gray-600 text-sm">Total collected</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-orange-600">{averageOccupancy.toFixed(0)}%</span>
          </div>
          <h4 className="text-gray-900">Avg Occupancy</h4>
          <p className="text-gray-600 text-sm">Fleet utilization</p>
        </div>
      </div>

      {/* Live Bus Tracking */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bus List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Live Fleet Status</h3>
          <div className="space-y-3">
            {buses.map((bus) => (
              <button
                key={bus.id}
                onClick={() => setSelectedBus(bus)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedBus?.id === bus.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{bus.plateNumber}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
                <p className="text-gray-600 text-sm mb-2">{bus.driver}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{bus.route}</span>
                  <span className="text-gray-900">
                    {bus.currentPassengers}/{bus.maxCapacity}
                  </span>
                </div>
                {bus.status === 'active' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${(bus.currentPassengers / bus.maxCapacity) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bus Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-900 mb-4">Real-Time Location Map</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {/* Map background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                {/* Grid overlay for map feel */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>

              {/* Bus markers */}
              {buses
                .filter((b) => b.status === 'active')
                .map((bus, index) => (
                  <div
                    key={bus.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${20 + index * 20}%`,
                      top: `${30 + index * 15}%`,
                    }}
                    onClick={() => setSelectedBus(bus)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Bus className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg whitespace-nowrap text-xs">
                        {bus.plateNumber}
                      </div>
                      {/* Pulse animation */}
                      <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                <p className="text-gray-600 text-sm mb-2">Active Buses: {activeBuses}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-4 h-4" />
                  Real-time GPS tracking
                </div>
              </div>
            </div>
          </div>

          {/* Selected Bus Details */}
          {selectedBus && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-gray-900 mb-4">Bus Details: {selectedBus.plateNumber}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-600 text-sm">Driver</label>
                      <p className="text-gray-900">{selectedBus.driver}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Route</label>
                      <p className="text-gray-900">{selectedBus.route}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Status</label>
                      <p className="text-gray-900 capitalize">{selectedBus.status}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-600 text-sm">Current Passengers</label>
                      <p className="text-gray-900">
                        {selectedBus.currentPassengers} / {selectedBus.maxCapacity}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Last Location Update</label>
                      <p className="text-gray-900">{selectedBus.location.lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Coordinates</label>
                      <p className="text-gray-900 text-sm">
                        {selectedBus.location.lat.toFixed(4)}, {selectedBus.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
