import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrips, updateTrip, createNotification, getStudents, markAttendance, postLocation, sendSOS, getRoutes } from '../services/api'

export default function DriverDashboard() {
  const [trips, setTrips] = useState([])
  const [students, setStudents] = useState([])
  const [routes, setRoutes] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [sosLoading, setSosLoading] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [completedStops, setCompletedStops] = useState({})
  const locationInterval = useRef(null)
  const currentLocation = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchTrips = async () => {
    try {
      const [tripsRes, studentsRes, routesRes] = await Promise.all([getTrips(), getStudents(), getRoutes()])
      const myTrips = tripsRes.data.filter(t => t.driverId === user.driverId)
      setTrips(myTrips)
      setRoutes(routesRes.data)
      const myVehicleIds = myTrips.map(t => t.vehicleId).filter(Boolean)
      const myStudents = studentsRes.data.filter(s => myVehicleIds.includes(s.vehicleId))
      setStudents(myStudents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current)
    }
  }, [])

  const startSendingLocation = (tripId) => {
    if (locationInterval.current) clearInterval(locationInterval.current)
    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          currentLocation.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          try {
            await postLocation({ tripId, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          } catch (err) {
            console.error('Location post failed', err)
          }
        },
        (err) => console.error('GPS error', err),
        { enableHighAccuracy: true }
      )
    }
    sendLocation()
    locationInterval.current = setInterval(sendLocation, 10000)
  }

  const stopSendingLocation = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current)
      locationInterval.current = null
    }
  }

  const handleLogout = () => {
    stopSendingLocation()
    localStorage.clear()
    navigate('/')
  }

  const notifyParents = async (message) => {
    try {
      const studentsRes = await getStudents()
      for (const student of studentsRes.data) {
        if (student.parentId) {
          await createNotification({ userId: student.parentId, message, isRead: false })
        }
      }
    } catch (err) {
      console.error('Failed to send notifications', err)
    }
  }

  const handleStartTrip = async (trip) => {
    try {
      await updateTrip(trip.id, { ...trip, status: 'in_progress', startTime: new Date().toISOString() })
      await notifyParents(`🚌 Bus is on the way! Route: ${trip.route?.name || 'your route'} has started. You can now track the bus live.`)
      startSendingLocation(trip.id)
      fetchTrips()
    } catch (err) { console.error(err) }
  }

  const handleEndTrip = async (trip) => {
    try {
      await updateTrip(trip.id, { ...trip, status: 'completed', endTime: new Date().toISOString() })
      await notifyParents(`✅ Bus has arrived! Route: ${trip.route?.name || 'your route'} is completed.`)
      stopSendingLocation()
      fetchTrips()
    } catch (err) { console.error(err) }
  }

  const handleSOS = async (trip) => {
    if (!window.confirm('🆘 Send SOS Emergency Alert to admin?')) return
    setSosLoading(true)
    try {
      await sendSOS({
        driverName: user.fullName,
        routeName: trip.route?.name || 'Unknown Route',
        vehiclePlate: trip.vehicle?.plateNumber || 'Unknown Vehicle',
        latitude: currentLocation.current?.lat || 0,
        longitude: currentLocation.current?.lng || 0,
      })
      setSosSent(true)
      setTimeout(() => setSosSent(false), 10000)
    } catch (err) {
      console.error('SOS failed', err)
      alert('Failed to send SOS. Please call admin directly.')
    } finally {
      setSosLoading(false)
    }
  }

  const handleMarkAttendance = async (tripId, studentId, status) => {
    const key = `${tripId}-${studentId}`
    setAttendance(prev => ({ ...prev, [key]: status }))
    try {
      await markAttendance({ tripId, studentId, status })
      if (status === 'absent') {
        const student = students.find(s => s.id === studentId)
        if (student?.parentId) {
          await createNotification({ userId: student.parentId, message: `⚠️ Your child was marked ABSENT on today's trip.`, isRead: false })
        }
      }
    } catch (err) {
      console.error(err)
      setAttendance(prev => ({ ...prev, [key]: null }))
    }
  }

  const toggleStop = (tripId, stopId) => {
    const key = `${tripId}-${stopId}`
    setCompletedStops(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  const completedTrips = trips.filter(t => t.status === 'completed').length
  const inProgressTrips = trips.filter(t => t.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-yellow-600 text-white px-8 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚌</span>
          <div>
            <p className="font-bold text-lg">TransportSystem</p>
            <p className="text-yellow-200 text-xs">Driver Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-yellow-700 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold">
              {user.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-yellow-200 text-xs">Driver</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">Logout</button>
        </div>
      </nav>

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
          <p className="text-gray-500">Manage your assigned trips and mark attendance</p>
        </div>

        {sosSent && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <span className="text-3xl">🆘</span>
            <div>
              <p className="font-bold text-red-700">SOS Alert Sent!</p>
              <p className="text-red-600 text-sm">Admin has been notified. Help is on the way!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">🛣️</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{trips.length}</p>
              <p className="text-gray-500 text-sm">Total Trips</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">🚌</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{inProgressTrips}</p>
              <p className="text-gray-500 text-sm">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">✅</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedTrips}</p>
              <p className="text-gray-500 text-sm">Completed</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-500 py-20">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-center text-gray-400 py-20 text-lg">No trips assigned to you yet.</div>
          ) : (
            trips.map((t) => {
              const tripRoute = routes.find(r => r.id === t.routeId)
              const stops = tripRoute?.stops?.sort((a, b) => a.stopOrder - b.stopOrder) || []

              return (
                <div key={t.id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xl font-bold text-gray-800">🛣️ {t.route?.name || 'Route #' + t.routeId}</p>
                      <p className="text-gray-500 text-sm">🚌 {t.vehicle?.plateNumber || 'N/A'} • 📅 {t.tripDate}</p>
                      {t.startTime && <p className="text-gray-400 text-xs mt-1">Started: {new Date(t.startTime).toLocaleTimeString()}</p>}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(t.status)}`}>{t.status}</span>
                  </div>

                  {/* Route Stops */}
                  {stops.length > 0 && (
                    <div className="mb-4 bg-blue-50 rounded-xl p-4">
                      <p className="font-semibold text-blue-800 mb-3">📍 Route Stops</p>
                      <div className="space-y-2">
                        {stops.map((stop, index) => {
                          const stopKey = `${t.id}-${stop.id}`
                          const isDone = completedStops[stopKey]
                          return (
                            <div key={stop.id} className="flex items-center gap-3">
                              <button
                                onClick={() => toggleStop(t.id, stop.id)}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                                  isDone
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-blue-300 text-blue-400 hover:border-blue-500'
                                }`}
                              >
                                {isDone ? '✓' : index + 1}
                              </button>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {stop.name}
                                </p>
                              </div>
                              {isDone && <span className="text-xs text-green-500 font-medium">Passed ✓</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {t.status === 'scheduled' && (
                      <button onClick={() => handleStartTrip(t)} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition font-medium">
                        Start Trip 🚀
                      </button>
                    )}
                    {t.status === 'in_progress' && (
                      <>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-yellow-700 text-sm text-center">
                          📍 Sharing your live location with parents and admin
                        </div>
                        <button onClick={() => handleEndTrip(t)} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition font-medium">
                          End Trip
                        </button>
                        <button
                          onClick={() => handleSOS(t)}
                          disabled={sosLoading}
                          className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-xl transition font-bold text-lg border-4 border-red-400"
                        >
                          {sosLoading ? 'Sending SOS...' : '🆘 SOS EMERGENCY'}
                        </button>
                      </>
                    )}
                    {t.status === 'completed' && (
                      <div className="w-full bg-green-50 text-green-600 py-2 rounded-xl text-center font-medium">Trip Completed ✅</div>
                    )}
                  </div>

                  {(t.status === 'in_progress' || t.status === 'completed') && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-700 mb-3">Student Attendance</h3>
                      {students.length === 0 ? (
                        <p className="text-gray-400 text-sm">No students assigned to your bus.</p>
                      ) : (
                        <div className="space-y-2">
                          {students.map((s) => {
                            const key = `${t.id}-${s.id}`
                            const status = attendance[key] || null
                            return (
                              <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-800">{s.user?.fullName || 'Student #' + s.id}</p>
                                  <p className="text-gray-400 text-xs">Grade: {s.grade || 'N/A'}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleMarkAttendance(t.id, s.id, 'present')}
                                    className={`px-4 py-1 rounded-xl text-sm font-medium transition ${status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-100'}`}
                                  >Present</button>
                                  <button
                                    onClick={() => handleMarkAttendance(t.id, s.id, 'absent')}
                                    className={`px-4 py-1 rounded-xl text-sm font-medium transition ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-100'}`}
                                  >Absent</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}