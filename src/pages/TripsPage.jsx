import { useState, useEffect } from 'react'
import { getTrips, createTrip, deleteTrip, getRoutes, getVehicles, getDrivers } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [routes, setRoutes] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ routeId: '', vehicleId: '', driverId: '', tripDate: '', status: 'scheduled' })
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      const [tripsRes, routesRes, vehiclesRes, driversRes] = await Promise.all([
        getTrips(), getRoutes(), getVehicles(), getDrivers()
      ])
      setTrips(tripsRes.data)
      setRoutes(routesRes.data)
      setVehicles(vehiclesRes.data)
      setDrivers(driversRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createTrip({
        routeId: parseInt(form.routeId),
        vehicleId: parseInt(form.vehicleId),
        driverId: parseInt(form.driverId),
        tripDate: form.tripDate,
        status: form.status
      })
      setForm({ routeId: '', vehicleId: '', driverId: '', tripDate: '', status: 'scheduled' })
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setError('Failed to add trip.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return
    await deleteTrip(id)
    fetchAll()
  }

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Trips Management</h1>
            <p className="text-gray-500 text-sm">Schedule and manage all school trips</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Trip'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Schedule New Trip</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={form.routeId}
                    onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    value={form.driverId}
                    onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.user?.fullName || 'Driver #' + d.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date</label>
                  <input
                    type="date"
                    value={form.tripDate}
                    onChange={(e) => setForm({ ...form, tripDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                    Save Trip
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 mt-20">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-lg">No trips yet. Add one above!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-lg font-bold text-gray-800">🛣️ {t.route?.name || 'Route #' + t.routeId}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">🚌 {t.vehicle?.plateNumber || 'N/A'}</p>
                  <p className="text-gray-500 text-sm">🚗 {t.driver?.user?.fullName || 'N/A'}</p>
                  <p className="text-gray-400 text-xs mt-2">📅 {t.tripDate}</p>
                  <div className="mt-4">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-600 text-sm transition"
                    >
                      🗑️ Delete
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