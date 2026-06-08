import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSchools, getVehicles, getDrivers, getStudents, getRoutes, getTrips, getNotifications, markAsRead, markAllAsRead, checkLateTrips } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    schools: 0, vehicles: 0, drivers: 0, students: 0, routes: 0, trips: 0
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const bellRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchStats = async () => {
    try {
      const [schools, vehicles, drivers, students, routes, trips] = await Promise.all([
        getSchools(), getVehicles(), getDrivers(), getStudents(), getRoutes(), getTrips()
      ])
      setStats({
        schools: schools.data.length,
        vehicles: vehicles.data.length,
        drivers: drivers.data.length,
        students: students.data.length,
        routes: routes.data.length,
        trips: trips.data.length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(user.id)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const runLateCheck = async () => {
    try {
      await checkLateTrips()
      fetchNotifications()
    } catch (err) {
      console.error('Late trip check failed', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchNotifications()
    runLateCheck()

    const notifInterval = setInterval(fetchNotifications, 10000)
    const lateInterval = setInterval(runLateCheck, 5 * 60 * 1000) // every 5 minutes

    return () => {
      clearInterval(notifInterval)
      clearInterval(lateInterval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id) => {
    await markAsRead(id)
    fetchNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user.id)
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const unreadSOS = notifications.filter(n => !n.isRead && n.message?.includes('SOS')).length
  const unreadLate = notifications.filter(n => !n.isRead && n.message?.includes('LATE')).length

  const cards = [
    { label: 'Schools', value: stats.schools, icon: '🏫', color: 'from-blue-500 to-blue-600', path: '/admin/schools' },
    { label: 'Vehicles', value: stats.vehicles, icon: '🚌', color: 'from-green-500 to-green-600', path: '/admin/vehicles' },
    { label: 'Drivers', value: stats.drivers, icon: '🚗', color: 'from-yellow-500 to-yellow-600', path: '/admin/drivers' },
    { label: 'Students', value: stats.students, icon: '🎒', color: 'from-purple-500 to-purple-600', path: '/admin/students' },
    { label: 'Routes', value: stats.routes, icon: '🗺️', color: 'from-red-500 to-red-600', path: '/admin/routes' },
    { label: 'Trips', value: stats.trips, icon: '🛣️', color: 'from-indigo-500 to-indigo-600', path: '/admin/trips' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center" style={{ position: 'relative', zIndex: 1000 }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.fullName}! Here's what's happening.</p>
          </div>
          <div className="flex items-center gap-4">
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative', background: '#f3f4f6', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', fontSize: '20px' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#ef4444', color: 'white', fontSize: '11px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'fixed', top: '70px', right: '20px', width: '400px',
                  background: 'white', borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  zIndex: 99999, border: '1px solid #e5e7eb', overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>
                      Notifications {unreadCount > 0 && <span style={{ color: '#ef4444' }}>({unreadCount} unread)</span>}
                    </p>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead} style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
                          background: n.isRead ? 'white' : n.message?.includes('SOS') ? '#fef2f2' : n.message?.includes('LATE') ? '#fffbeb' : '#eff6ff',
                          borderLeft: n.message?.includes('SOS') && !n.isRead ? '4px solid #ef4444' : n.message?.includes('LATE') && !n.isRead ? '4px solid #f59e0b' : 'none'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <p style={{ fontSize: '13px', margin: 0, fontWeight: n.isRead ? 'normal' : 'bold', color: n.isRead ? '#6b7280' : '#111827' }}>
                              {n.message}
                            </p>
                            {!n.isRead && (
                              <button onClick={() => handleMarkAsRead(n.id)} style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>✓</button>
                            )}
                          </div>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* SOS Alert Banner */}
        {unreadSOS > 0 && (
          <div style={{ background: '#dc2626', color: 'white', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '24px' }}>🆘</span>
            <p style={{ margin: 0, fontWeight: 'bold' }}>EMERGENCY ALERT! {unreadSOS} SOS message{unreadSOS > 1 ? 's' : ''} from driver{unreadSOS > 1 ? 's' : ''}! Click the 🔔 bell to view details.</p>
          </div>
        )}

        {/* Late Trip Alert Banner */}
        {unreadLate > 0 && (
          <div style={{ background: '#f59e0b', color: 'white', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{unreadLate} trip{unreadLate > 1 ? 's' : ''} {unreadLate > 1 ? 'are' : 'is'} running late! Click the 🔔 bell to view details.</p>
          </div>
        )}

        <main className="flex-1 p-8">
          {loading ? (
            <div className="text-center text-gray-500 mt-20 text-lg">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cards.map((card) => (
                  <div
                    key={card.label}
                    onClick={() => navigate(card.path)}
                    className="cursor-pointer rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white/80 text-sm font-medium">{card.label}</p>
                          <p className="text-4xl font-bold mt-1">{card.value}</p>
                        </div>
                        <span className="text-4xl opacity-80">{card.icon}</span>
                      </div>
                      <p className="text-white/70 text-xs mt-4">Click to manage →</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">System Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-600">{stats.trips}</p>
                    <p className="text-gray-500 text-sm">Total Trips</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600">{stats.vehicles}</p>
                    <p className="text-gray-500 text-sm">Active Vehicles</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-600">{stats.students}</p>
                    <p className="text-gray-500 text-sm">Students</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-yellow-600">{stats.routes}</p>
                    <p className="text-gray-500 text-sm">Routes</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}