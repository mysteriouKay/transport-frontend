import { useState, useEffect } from 'react'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getSchools } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [form, setForm] = useState({ schoolId: '', plateNumber: '', model: '', capacity: '', status: 'active', condition: 'good' })
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      const [vRes, sRes] = await Promise.all([getVehicles(), getSchools()])
      setVehicles(vRes.data)
      setSchools(sRes.data)
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
      const payload = {
        ...form,
        schoolId: form.schoolId ? parseInt(form.schoolId) : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
      }
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, { ...payload, id: editingVehicle.id })
      } else {
        await createVehicle(payload)
      }
      setForm({ schoolId: '', plateNumber: '', model: '', capacity: '', status: 'active', condition: 'good' })
      setShowForm(false)
      setEditingVehicle(null)
      setError('')
      fetchAll()
    } catch (err) {
      setError('Failed to save vehicle.')
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setForm({
      schoolId: vehicle.schoolId || '',
      plateNumber: vehicle.plateNumber,
      model: vehicle.model || '',
      capacity: vehicle.capacity || '',
      status: vehicle.status,
      condition: vehicle.condition || 'good',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return
    await deleteVehicle(id)
    fetchAll()
  }

  const conditionColor = (condition) => {
    if (condition === 'good') return 'bg-green-100 text-green-700'
    if (condition === 'fair') return 'bg-yellow-100 text-yellow-700'
    if (condition === 'poor') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vehicles</h1>
            <p className="text-gray-500 text-sm">Manage school buses and their condition</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingVehicle(null); setForm({ schoolId: '', plateNumber: '', model: '', capacity: '', status: 'active', condition: 'good' }) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Vehicle'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="KBB 456B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Toyota Coaster"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select
                    value={form.schoolId}
                    onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select School</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
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
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                    {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Plate Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Model</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Capacity</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Condition</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-20 text-gray-400">Loading...</td></tr>
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-20 text-gray-400">No vehicles found.</td></tr>
                ) : (
                  vehicles.map((v, index) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-400 text-sm">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{v.plateNumber}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{v.model || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{v.capacity || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : v.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${conditionColor(v.condition)}`}>
                          {v.condition || 'good'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        <button onClick={() => handleEdit(v)} className="text-blue-500 hover:text-blue-700 text-sm transition">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-600 text-sm transition">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}