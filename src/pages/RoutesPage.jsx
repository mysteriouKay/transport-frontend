import { useState, useEffect } from 'react'
import { getRoutes, createRoute, deleteRoute } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function RoutesPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const fetchRoutes = async () => {
    try {
      const res = await getRoutes()
      setRoutes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoutes() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createRoute(form)
      setForm({ name: '', description: '' })
      setShowForm(false)
      fetchRoutes()
    } catch (err) {
      setError('Failed to add route.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return
    await deleteRoute(id)
    fetchRoutes()
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Routes Management</h1>
            <p className="text-gray-500 text-sm">Plan and manage all transport routes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Route'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Route</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Route A - Westlands"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the route..."
                    rows={3}
                  />
                </div>
                <div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                    Save Route
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 mt-20">Loading...</div>
          ) : routes.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-lg">No routes yet. Add one above!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-800">🗺️ {r.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{r.description || 'No description'}</p>
                      <p className="text-gray-400 text-xs mt-2">Stops: {r.stops?.length || 0}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
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