import { Bus, Clock, DollarSign, Download, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { mockBuses, mockTrips } from '../data/mockData';

export function BarangayView() {
  const [dateRange, setDateRange] = useState('today');

  // Calculate statistics
  const totalTrips = mockTrips.length + 45; // Mock additional completed trips
  const totalPassengers = mockTrips.reduce((sum, trip) => sum + trip.passengersBoarded, 0) + 234;
  const totalRevenue = mockTrips.reduce((sum, trip) => sum + trip.totalFare, 0) + 5670;
  const activeFleet = mockBuses.filter((b) => b.status === 'active').length;
  const averageTripDuration = 38; // minutes
  const peakHours = ['7:00 AM - 9:00 AM', '5:00 PM - 7:00 PM'];

  const downloadReport = () => {
    alert('Report download initiated. In production, this would generate a PDF/Excel file.');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900">Operations Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm">Barangay Transportation Oversight</p>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg capitalize ${
                dateRange === range ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900 text-2xl mb-1">{totalTrips}</div>
          <div className="text-gray-600 text-sm">Total Trips</div>
          <div className="text-green-600 text-xs mt-1">+12% from last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900 text-2xl mb-1">{totalPassengers}</div>
          <div className="text-gray-600 text-sm">Total Passengers</div>
          <div className="text-green-600 text-xs mt-1">+8% from last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900 text-2xl mb-1">₱{totalRevenue.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">Total Revenue</div>
          <div className="text-green-600 text-xs mt-1">+15% from last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-gray-900 text-2xl mb-1">{averageTripDuration}m</div>
          <div className="text-gray-600 text-sm">Avg Trip Duration</div>
          <div className="text-gray-500 text-xs mt-1">Within expected range</div>
        </div>
      </div>

      {/* Charts and Reports */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Trip Volume Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Trip Volume by Hour</h3>
          <div className="space-y-3">
            {[
              { hour: '6 AM - 8 AM', trips: 12, percentage: 75 },
              { hour: '8 AM - 10 AM', trips: 8, percentage: 50 },
              { hour: '10 AM - 12 PM', trips: 6, percentage: 37 },
              { hour: '12 PM - 2 PM', trips: 7, percentage: 43 },
              { hour: '2 PM - 4 PM', trips: 5, percentage: 31 },
              { hour: '4 PM - 6 PM', trips: 11, percentage: 68 },
              { hour: '6 PM - 8 PM', trips: 9, percentage: 56 },
            ].map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{data.hour}</span>
                  <span className="text-gray-900">{data.trips} trips</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Route */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Revenue by Route</h3>
          <div className="space-y-4">
            {[
              { route: 'City Center - Barangay Hall', revenue: 3240, trips: 24, color: 'bg-blue-500' },
              { route: 'Market - Terminal', revenue: 2850, trips: 19, color: 'bg-green-500' },
              { route: 'Coastal Road Loop', revenue: 1580, trips: 8, color: 'bg-purple-500' },
            ].map((data, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-900">{data.route}</h4>
                  <span className="text-gray-900">₱{data.revenue}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{data.trips} trips completed</span>
                  <span>₱{Math.round(data.revenue / data.trips)} avg fare</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${data.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(data.revenue / 3240) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Fleet Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600">Plate Number</th>
                <th className="text-left py-3 px-4 text-gray-600">Driver</th>
                <th className="text-left py-3 px-4 text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-gray-600">Trips Today</th>
                <th className="text-left py-3 px-4 text-gray-600">Passengers</th>
                <th className="text-left py-3 px-4 text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 text-gray-600">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {mockBuses.map((bus, index) => {
                const trips = Math.floor(Math.random() * 8) + 3;
                const passengers = Math.floor(Math.random() * 100) + 40;
                const revenue = passengers * 15;
                const efficiency = Math.floor(Math.random() * 30) + 70;

                return (
                  <tr key={bus.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{bus.plateNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{bus.driver}</td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-gray-900">{trips}</td>
                    <td className="py-3 px-4 text-gray-900">{passengers}</td>
                    <td className="py-3 px-4 text-gray-900">₱{revenue}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              efficiency >= 85 ? 'bg-green-500' : efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${efficiency}%` }}
                          />
                        </div>
                        <span className="text-gray-600 text-sm">{efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Hours Info */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-2">Peak Operating Hours</h3>
            <p className="text-gray-600 mb-3">
              Highest passenger volume and revenue generation occurs during these periods:
            </p>
            <div className="flex flex-wrap gap-2">
              {peakHours.map((hour, index) => (
                <span key={index} className="px-4 py-2 bg-white border border-orange-200 rounded-lg text-gray-900">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
