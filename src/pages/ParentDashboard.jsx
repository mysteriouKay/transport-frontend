import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNotifications, markAsRead, markAllAsRead, getTrips, getLatestLocation, getStudents, getPayments } from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const busIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:32px;filter:drop-shadow(2px 2px 2px rgba(0,0,0,0.3))">🚌</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export default function ParentDashboard() {
  const [notifications, setNotifications] = useState([])
  const [activeTrip, setActiveTrip] = useState(null)
  const [busLocation, setBusLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState('notifications')
  const [tripHistory, setTripHistory] = useState([])
  const [payments, setPayments] = useState([])
  const [myStudents, setMyStudents] = useState([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(user.id)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveTripAndLocation = async () => {
    try {
      const tripsRes = await getTrips()
      const inProgress = tripsRes.data.find(t => t.status === 'in_progress')
      if (inProgress) {
        setActiveTrip(inProgress)
        try {
          const locRes = await getLatestLocation(inProgress.id)
          setBusLocation(locRes.data)
          setLastUpdated(new Date().toLocaleTimeString())
        } catch {
          setBusLocation(null)
        }
      } else {
        setActiveTrip(null)
        setBusLocation(null)
      }
      setTripHistory(tripsRes.data.filter(t => t.status === 'completed').slice(0, 20))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyData = async () => {
    try {
      const [studentsRes, paymentsRes] = await Promise.all([getStudents(), getPayments()])
      const children = studentsRes.data.filter(s => s.parentId === user.id)
      setMyStudents(children)
      const childIds = children.map(c => c.id)
      const myPayments = paymentsRes.data.filter(p => childIds.includes(p.studentId))
      setPayments(myPayments)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchActiveTripAndLocation()
    fetchMyData()
    const interval = setInterval(fetchActiveTripAndLocation, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleMarkAsRead = async (id) => {
    await markAsRead(id)
    fetchNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user.id)
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const defaultCenter = [-1.2921, 36.8219]
  const mapCenter = busLocation
    ? [parseFloat(busLocation.latitude), parseFloat(busLocation.longitude)]
    : defaultCenter

  const tabs = [
    { key: 'notifications', label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
    { key: 'trips', label: '🛣️ Trip History' },
    { key: 'payments', label: '💰 Payment History' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-700 text-white px-8 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚌</span>
          <div>
            <p className="font-bold text-lg">TransportSystem</p>
            <p className="text-green-200 text-xs">Parent Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-green-800 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">
              {user.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-green-200 text-xs">Parent</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">Logout</button>
        </div>
      </nav>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.fullName}!</h1>
          <p className="text-gray-500">Track your child's bus and stay updated</p>
        </div>

        {/* My Children */}
        {myStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-4 flex-wrap">
            {myStudents.map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl">
                <span className="text-2xl">🎒</span>
                <div>
                  <p className="font-medium text-gray-800">{s.user?.fullName}</p>
                  <p className="text-gray-500 text-xs">Grade {s.grade} • Bus: {s.vehicle?.plateNumber || 'Not assigned'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Bus Status Card */}
        <div className={`rounded-2xl shadow p-6 mb-6 ${activeTrip ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">🚌 Bus Status</h2>
              {activeTrip ? (
                <div>
                  <p className="text-green-600 font-medium">● Bus is currently on the way</p>
                  <p className="text-gray-500 text-sm">Route: {activeTrip.route?.name || 'N/A'} • Vehicle: {activeTrip.vehicle?.plateNumber || 'N/A'}</p>
                  {lastUpdated && <p className="text-gray-400 text-xs">Location updated: {lastUpdated}</p>}
                </div>
              ) : (
                <p className="text-gray-400">No active trips right now</p>
              )}
            </div>
            {activeTrip && busLocation && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition font-medium"
              >
                {showMap ? 'Hide Map' : '📍 Track Bus'}
              </button>
            )}
          </div>

          {showMap && busLocation && (
            <div className="rounded-xl overflow-hidden mt-4" style={{ height: '400px' }}>
              <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapCenter} icon={busIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold">🚌 {activeTrip?.vehicle?.plateNumber}</p>
                      <p className="text-gray-600 text-sm">Route: {activeTrip?.route?.name}</p>
                      <p className="text-green-500 text-xs">● Live</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">🔔 Notifications</h2>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="text-sm text-blue-500 hover:text-blue-700">Mark all as read</button>
              )}
            </div>
            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex justify-between items-start p-4 rounded-xl transition ${n.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'}`}>
                    <div className="flex-1">
                      <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{n.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => handleMarkAsRead(n.id)} className="ml-4 text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap">Mark read</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trip History Tab */}
        {activeTab === 'trips' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">🛣️ Trip History</h2>
              <p className="text-gray-500 text-sm">Recent completed trips</p>
            </div>
            {tripHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No completed trips yet.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Route</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Vehicle</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tripHistory.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{t.route?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{t.vehicle?.plateNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{t.tripDate}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">💰 Payment History</h2>
              <p className="text-gray-500 text-sm">Your transport fee payments</p>
            </div>
            {payments.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No payments recorded yet.</p>
            ) : (
              <>
                <div className="px-6 py-4 bg-green-50 border-b">
                  <p className="text-green-700 font-bold text-lg">
                    Total Paid: KES {payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Method</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Term</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{p.student?.user?.fullName || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-green-600">KES {Number(p.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm capitalize">{p.paymentMethod}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{p.term || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{p.paymentDate?.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}