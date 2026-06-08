import { useState, useEffect } from 'react'
import { getDrivers, createDriver, deleteDriver } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function DriversPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ userId: '', licenseNumber: '', licenseExpiry: '', phone: '', status: 'active' })
  const [error, setError] = useState('')

  const fetchDrivers = async () => {
    try {
      const res = await getDrivers()
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDrivers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createDriver({ ...form, userId: parseInt(form.userId) })
      setForm({ userId: '', licenseNumber: '', licenseExpiry: '', phone: '', status: 'active' })
      setShowForm(false)
      fetchDrivers()
    } catch (err) {
      setError('Failed to add driver.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return
    await deleteDriver(id)
    fetchDrivers()
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Drivers Management</h1>
            <p className="text-gray-500 text-sm">Manage all registered drivers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Driver'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Driver</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="number"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="User ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DL-12345"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                    Save Driver
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 mt-20">Loading...</div>
          ) : drivers.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-lg">No drivers yet. Add one above!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-800">🚗 {d.user?.fullName || 'Driver #' + d.id}</p>
                      <p className="text-gray-500 text-sm mt-1">License: {d.licenseNumber}</p>
                      <p className="text-gray-500 text-sm">Phone: {d.phone || 'N/A'}</p>
                      <p className="text-gray-400 text-xs mt-1">Expiry: {d.licenseExpiry || 'N/A'}</p>
                      <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block font-medium ${
                        d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-red-400 hover:text-red-600 text-xl transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}