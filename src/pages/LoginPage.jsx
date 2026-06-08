import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login({ email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const role = res.data.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'driver') navigate('/driver')
      else navigate('/parent')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <span className="text-4xl">🚌</span>
            <span className="text-2xl font-bold">TransportSystem</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Smart School Transport Management
          </h2>
          <p className="text-blue-200 text-lg mb-12">
            Track buses in real time, manage routes, and keep parents informed — all in one place.
          </p>
          <div className="space-y-6">
            {[
              { icon: '🗺️', title: 'Route Management', desc: 'Plan and manage all school bus routes efficiently' },
              { icon: '📍', title: 'Live Trip Tracking', desc: 'Parents see real-time bus status updates' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Automatic alerts when bus starts or arrives' },
              { icon: '👥', title: 'Role-Based Access', desc: 'Separate dashboards for admins, drivers and parents' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="bg-blue-600 rounded-xl p-3 text-2xl">{f.icon}</div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-blue-200 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© 2026 TransportSystem. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🚌</span>
            <h1 className="text-3xl font-bold text-blue-800 mt-2">TransportSystem</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h2>
            <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 text-lg"
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Demo accounts — click to fill</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <button
                  onClick={() => fillDemo('kibaliivy@gmail.com', 'Admin123!')}
                  className="bg-blue-50 hover:bg-blue-100 rounded-lg p-2 transition"
                >
                  <p className="font-semibold text-blue-700">Admin</p>
                  <p className="text-gray-500">Mary Wasike</p>
                </button>
                <button
                  onClick={() => fillDemo('peter@transport.com', 'Admin123!')}
                  className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-2 transition"
                >
                  <p className="font-semibold text-yellow-700">Driver</p>
                  <p className="text-gray-500">Peter Otieno</p>
                </button>
                <button
                  onClick={() => fillDemo('jane@transport.com', 'Admin123!')}
                  className="bg-green-50 hover:bg-green-100 rounded-lg p-2 transition"
                >
                  <p className="font-semibold text-green-700">Parent</p>
                  <p className="text-gray-500">Jane Wanjiku</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}