import { Bus, Calendar, DollarSign, Download, FileText, Filter, TrendingUp, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily')
  const [dateRange, setDateRange] = useState({ start: '2024-12-01', end: '2024-12-09' })

  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Downloading report in ${format.toUpperCase()} format...`)
  }

  const reportTypes = [
    { id: 'daily' as const, label: 'Daily Report', icon: Calendar },
    { id: 'weekly' as const, label: 'Weekly Summary', icon: TrendingUp },
    { id: 'monthly' as const, label: 'Monthly Report', icon: FileText },
    { id: 'custom' as const, label: 'Custom Range', icon: Filter },
  ]

  const dailyData = {
    date: 'December 9, 2024',
    totalTrips: 48,
    totalPassengers: 672,
    totalRevenue: 10080,
    avgTripDuration: 42,
    busUtilization: 87,
    peakHours: ['7:00 AM - 9:00 AM', '5:00 PM - 7:00 PM'],
  }

  const tripsByBus = [
    { plate: 'ABC 1234', trips: 12, passengers: 168, revenue: 2520, avgDuration: 41 },
    { plate: 'XYZ 5678', trips: 11, passengers: 154, revenue: 2310, avgDuration: 43 },
    { plate: 'DEF 9012', trips: 10, passengers: 140, revenue: 2100, avgDuration: 40 },
    { plate: 'GHI 3456', trips: 9, passengers: 126, revenue: 1890, avgDuration: 44 },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="text-gray-900 mb-2">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports for operations analysis</p>
        </motion.div>

        {/* Report Type Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h3 className="text-gray-900 mb-4">Select Report Type</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedReport === type.id
                      ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 mx-auto mb-2 ${
                      selectedReport === type.id ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <div className={selectedReport === type.id ? 'text-gray-900' : 'text-gray-600'}>{type.label}</div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Report Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">Report Summary</h3>
              <p className="text-indigo-100">{dailyData.date}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => downloadReport('excel')}
                className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => downloadReport('csv')}
                className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <Bus className="w-8 h-8 mb-2" />
              <div className="text-3xl mb-1">{dailyData.totalTrips}</div>
              <div className="text-indigo-100 text-sm">Total Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <Users className="w-8 h-8 mb-2" />
              <div className="text-3xl mb-1">{dailyData.totalPassengers}</div>
              <div className="text-indigo-100 text-sm">Passengers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <DollarSign className="w-8 h-8 mb-2" />
              <div className="text-3xl mb-1">₱{dailyData.totalRevenue.toLocaleString()}</div>
              <div className="text-indigo-100 text-sm">Revenue</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <TrendingUp className="w-8 h-8 mb-2" />
              <div className="text-3xl mb-1">{dailyData.busUtilization}%</div>
              <div className="text-indigo-100 text-sm">Utilization</div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance by Bus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <h3 className="text-gray-900">Performance by Bus</h3>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-gray-600 text-sm">Bus</th>
                      <th className="text-left py-3 text-gray-600 text-sm">Trips</th>
                      <th className="text-left py-3 text-gray-600 text-sm">Passengers</th>
                      <th className="text-left py-3 text-gray-600 text-sm">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripsByBus.map((bus, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-900">{bus.plate}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-900">{bus.trips}</td>
                        <td className="py-4 text-gray-900">{bus.passengers}</td>
                        <td className="py-4 text-gray-900">₱{bus.revenue.toLocaleString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Operational Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-gray-900 mb-6">Operational Metrics</h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Average Trip Duration</span>
                  <span className="text-gray-900">{dailyData.avgTripDuration} minutes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                    style={{ width: '93%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Within target range (40-45 mins)</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Fleet Utilization</span>
                  <span className="text-gray-900">{dailyData.busUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                    style={{ width: `${dailyData.busUtilization}%` }}
                  />
                </div>
                <p className="text-xs text-green-600 mt-1">Excellent utilization</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Average Passengers per Trip</span>
                  <span className="text-gray-900">{(dailyData.totalPassengers / dailyData.totalTrips).toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{ width: '78%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">78% of capacity</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-gray-900 mb-3">Peak Operating Hours</h4>
                <div className="space-y-2">
                  {dailyData.peakHours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                    >
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-900">{hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="text-gray-900 mb-4">Key Insights</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Revenue Growth</h4>
                <p className="text-gray-600 text-sm">12.5% increase from previous period</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Passenger Satisfaction</h4>
                <p className="text-gray-600 text-sm">Improved boarding efficiency with QR codes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Fleet Performance</h4>
                <p className="text-gray-600 text-sm">All buses meeting operational targets</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
