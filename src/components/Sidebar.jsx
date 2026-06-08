import { useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Analytics', icon: '📉', path: '/admin/analytics' },
    { label: 'Schools', icon: '🏫', path: '/admin/schools' },
    { label: 'Vehicles', icon: '🚌', path: '/admin/vehicles' },
    { label: 'Drivers', icon: '🚗', path: '/admin/drivers' },
    { label: 'Students', icon: '🎒', path: '/admin/students' },
    { label: 'Routes', icon: '🗺️', path: '/admin/routes' },
    { label: 'Trips', icon: '🛣️', path: '/admin/trips' },
    { label: 'Users', icon: '👥', path: '/admin/users' },
    { label: 'Attendance', icon: '📋', path: '/admin/attendance' },
    { label: 'Payments', icon: '💰', path: '/admin/payments' },
    { label: 'Reports', icon: '📈', path: '/admin/reports' },
    { label: 'Live Tracking', icon: '📍', path: '/admin/tracking' },
    { label: 'Register User', icon: '➕', path: '/admin/register' },
  ]

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚌</span>
          <div>
            <p className="font-bold text-lg">TransportSystem</p>
            <p className="text-blue-300 text-xs">Management Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left transition ${
              location.pathname === item.path
                ? 'bg-blue-700 text-white font-semibold'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold">
            {user.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-blue-300 text-xs">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}