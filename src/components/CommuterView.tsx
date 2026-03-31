import { Bus, Clock, MapPin, Navigation, Users } from 'lucide-react';
import { useState } from 'react';
import { mockBuses, mockRoutes } from '../data/mockData';
import { Route } from '../types';

export function CommuterView() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(mockRoutes[0]);

  const getRouteBuses = (routeName: string) => {
    return mockBuses.filter((bus) => bus.route === routeName);
  };

  const calculateETA = (busStatus: string) => {
    if (busStatus === 'active') {
      return `${Math.floor(Math.random() * 10) + 3} mins`;
    }
    return 'Not available';
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Quick Info Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl p-6 mb-6">
        <h3 className="mb-2">Welcome, Commuter!</h3>
        <p className="text-indigo-100">Track buses in real-time and plan your trip efficiently</p>
      </div>

      {/* Route Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Select Your Route</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {mockRoutes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRoute?.id === route.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-gray-900">{route.name.split(':')[0]}</h4>
                <span className="text-indigo-600">₱{route.baseFare}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  {route.origin}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  {route.destination}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />~{route.estimatedDuration} mins
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRoute && (
        <>
          {/* Available Buses */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Buses on This Route</h3>
              <span className="text-gray-600 text-sm">Live Updates</span>
            </div>
            <div className="space-y-4">
              {getRouteBuses(selectedRoute.name.split(':')[1].trim()).length > 0 ? (
                getRouteBuses(selectedRoute.name.split(':')[1].trim()).map((bus) => (
                  <div key={bus.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Bus className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-gray-900">{bus.plateNumber}</h4>
                          <p className="text-gray-600 text-sm">{bus.driver}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {bus.status === 'active' ? (
                          <>
                            <div className="text-green-600 mb-1">ETA: {calculateETA(bus.status)}</div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">En Route</span>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            {bus.status === 'idle' ? 'At Terminal' : 'Not Available'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Users className="w-4 h-4" />
                        <span>
                          {bus.currentPassengers}/{bus.maxCapacity} passengers
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {bus.currentPassengers / bus.maxCapacity < 0.5 && (
                          <span className="text-green-600 text-sm">Seats Available</span>
                        )}
                        {bus.currentPassengers / bus.maxCapacity >= 0.5 &&
                          bus.currentPassengers / bus.maxCapacity < 0.8 && (
                            <span className="text-yellow-600 text-sm">Filling Up</span>
                          )}
                        {bus.currentPassengers / bus.maxCapacity >= 0.8 && (
                          <span className="text-red-600 text-sm">Almost Full</span>
                        )}
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
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
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No buses currently on this route</p>
                </div>
              )}
            </div>
          </div>

          {/* Route Stops */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-900 mb-4">Route Stops</h3>
            <div className="relative">
              {selectedRoute.stops.map((stop, index) => (
                <div key={index} className="flex items-start gap-4 pb-6 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        index === 0
                          ? 'bg-green-500 text-white'
                          : index === selectedRoute.stops.length - 1
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index !== selectedRoute.stops.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 my-1" style={{ minHeight: '2rem' }} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-gray-900">{stop}</h4>
                    {index === 0 && <p className="text-green-600 text-sm">Starting Point</p>}
                    {index === selectedRoute.stops.length - 1 && (
                      <p className="text-red-600 text-sm">Final Destination</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900">Base Fare:</span>
                <span className="text-blue-900">₱{selectedRoute.baseFare}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-blue-900">Estimated Travel Time:</span>
                <span className="text-blue-900">{selectedRoute.estimatedDuration} minutes</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
