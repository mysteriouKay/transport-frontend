import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'parent',
    schoolId: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await register({
        ...form,
        schoolId: form.schoolId ? parseInt(form.schoolId) : null
      })
      setSuccess(`✅ User "${res.data.user.fullName}" registered successfully with role: ${res.data.user.role}`)
      setForm({ fullName: '', email: '', password: '', role: 'parent', schoolId: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user.')
    } finally {
      setLoading(false)
    }
  }

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-blue-100 text-blue-700'
    if (role === 'driver') return 'bg-yellow-100 text-yellow-700'
    if (role === 'parent') return 'bg-green-100 text-green-700'
    if (role === 'student') return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-700'
  }

  const roleIcon = (role) => {
    if (role === 'admin') return '👑'
    if (role === 'driver') return '🚗'
    if (role === 'parent') return '👨‍👩‍👧'
    if (role === 'student') return '🎒'
    return '👤'
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Register New User</h1>
          <p className="text-gray-500 text-sm">Add a new user to the system</p>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow p-8">
              <h3 className="text-lg font-semibold mb-6">User Details</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Kamau"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['admin', 'driver', 'parent', 'student'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition ${
                          form.role === role
                            ? 'border-blue-500 ' + roleColor(role)
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {roleIcon(role)} {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School ID <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="number"
                    value={form.schoolId}
                    onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                    View All Users
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}