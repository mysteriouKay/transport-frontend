import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getTrips, getStudents, getPayments, getAttendanceReport, getRoutes, getDrivers } from '../services/api'
import Sidebar from '../components/Sidebar'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [trips, setTrips] = useState([])
  const [students, setStudents] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, sRes, pRes, aRes, rRes, dRes] = await Promise.all([
          getTrips(), getStudents(), getPayments(), getAttendanceReport(), getRoutes(), getDrivers()
        ])
        setTrips(tRes.data)
        setStudents(sRes.data)
        setPayments(pRes.data)
        setAttendance(aRes.data)
        setRoutes(rRes.data)
        setDrivers(dRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Trips per day
  const tripsByDay = trips.reduce((acc, t) => {
    const date = t.tripDate?.split('T')[0] || 'Unknown'
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})
  const tripsChartData = Object.entries(tripsByDay).map(([date, count]) => ({ date, trips: count })).slice(-7)

  // Attendance pie
  const presentCount = attendance.filter(a => a.status === 'present').length
  const absentCount = attendance.filter(a => a.status === 'absent').length
  const attendancePieData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
  ]

  // Revenue by month
  const revenueByMonth = payments.reduce((acc, p) => {
    const month = p.paymentDate?.slice(0, 7) || 'Unknown'
    acc[month] = (acc[month] || 0) + Number(p.amount)
    return acc
  }, {})
  const revenueChartData = Object.entries(revenueByMonth).map(([month, total]) => ({ month, revenue: total }))

  // Trip status breakdown
  const statusData = [
    { name: 'Completed', value: trips.filter(t => t.status === 'completed').length },
    { name: 'In Progress', value: trips.filter(t => t.status === 'in_progress').length },
    { name: 'Scheduled', value: trips.filter(t => t.status === 'scheduled').length },
    { name: 'Cancelled', value: trips.filter(t => t.status === 'cancelled').length },
  ].filter(d => d.value > 0)

  // Driver performance
  const driverPerformance = drivers.map(d => {
    const driverTrips = trips.filter(t => t.driverId === d.id)
    const completed = driverTrips.filter(t => t.status === 'completed').length
    const inProgress = driverTrips.filter(t => t.status === 'in_progress').length
    const driverTripIds = driverTrips.map(t => t.id)
    const driverAttendance = attendance.filter(a => driverTripIds.includes(a.tripId))
    const attendanceMarked = driverAttendance.length
    const presentMarked = driverAttendance.filter(a => a.status === 'present').length
    const attendanceRate = attendanceMarked > 0 ? Math.round((presentMarked / attendanceMarked) * 100) : 0

    return {
      id: d.id,
      name: d.user?.fullName || 'Driver #' + d.id,
      phone: d.phone || 'N/A',
      licenseNumber: d.licenseNumber || 'N/A',
      status: d.status || 'active',
      totalTrips: driverTrips.length,
      completedTrips: completed,
      inProgressTrips: inProgress,
      attendanceMarked,
      attendanceRate,
    }
  })

  // Summary stats
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const attendanceRate = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'drivers', label: '🚗 Driver Performance' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-500 text-sm">Transport system performance overview</p>
        </header>

        <main className="flex-1 p-8">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading analytics...</div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                      activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-blue-600">{trips.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Total Trips</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-green-600">{attendanceRate}%</p>
                      <p className="text-gray-500 text-sm mt-1">Attendance Rate</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-purple-600">KES {Number(totalRevenue).toLocaleString()}</p>
                      <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-orange-600">{students.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Total Students</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow p-6">
                      <h3 className="font-semibold text-gray-700 mb-4">📅 Trips Per Day</h3>
                      {tripsChartData.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No trip data yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={tripsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                      <h3 className="font-semibold text-gray-700 mb-4">📋 Attendance Breakdown</h3>
                      {attendance.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No attendance data yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={attendancePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                              <Cell fill="#22c55e" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                      <h3 className="font-semibold text-gray-700 mb-4">💰 Revenue Over Time</h3>
                      {revenueChartData.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No payment data yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString()}`} />
                            <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                      <h3 className="font-semibold text-gray-700 mb-4">🛣️ Trip Status Breakdown</h3>
                      {statusData.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No trip data yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                              {statusData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">💳 Payment Methods</h3>
                    {payments.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No payment data yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={
                          Object.entries(
                            payments.reduce((acc, p) => {
                              const method = p.paymentMethod || 'unknown'
                              acc[method] = (acc[method] || 0) + 1
                              return acc
                            }, {})
                          ).map(([method, count]) => ({ method, count }))
                        }>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {payments.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </>
              )}

              {/* Driver Performance Tab */}
              {activeTab === 'drivers' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-blue-600">{drivers.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Total Drivers</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-green-600">{trips.filter(t => t.status === 'completed').length}</p>
                      <p className="text-gray-500 text-sm mt-1">Completed Trips</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 text-center">
                      <p className="text-3xl font-bold text-purple-600">{attendance.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Attendance Records</p>
                    </div>
                  </div>

                  {/* Driver cards */}
                  <div className="space-y-4 mb-6">
                    {driverPerformance.map(d => (
                      <div key={d.id} className="bg-white rounded-2xl shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">🚗</div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">{d.name}</p>
                              <p className="text-gray-500 text-sm">📞 {d.phone} • 🪪 {d.licenseNumber}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {d.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{d.totalTrips}</p>
                            <p className="text-gray-500 text-xs mt-1">Total Trips</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{d.completedTrips}</p>
                            <p className="text-gray-500 text-xs mt-1">Completed</p>
                          </div>
                          <div className="bg-yellow-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{d.attendanceMarked}</p>
                            <p className="text-gray-500 text-xs mt-1">Attendance Marked</p>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">{d.attendanceRate}%</p>
                            <p className="text-gray-500 text-xs mt-1">Present Rate</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Trip completion</span>
                            <span>{d.totalTrips > 0 ? Math.round((d.completedTrips / d.totalTrips) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${d.totalTrips > 0 ? Math.round((d.completedTrips / d.totalTrips) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Driver trips bar chart */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">🚗 Trips Per Driver</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={driverPerformance.map(d => ({ name: d.name.split(' ')[0], total: d.totalTrips, completed: d.completedTrips }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                        <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}