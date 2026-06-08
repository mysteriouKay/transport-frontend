import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { getSchools, getStudents, getVehicles } from '../services/api'

export default function SchoolsPage() {
  const [schools, setSchools] = useState([])
  const [students, setStudents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', contactEmail: '', contactPhone: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [sRes, stRes, vRes] = await Promise.all([getSchools(), getStudents(), getVehicles()])
      setSchools(sRes.data)
      setStudents(stRes.data)
      setVehicles(vRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5044/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
        })
      })
      if (res.ok) {
        setSuccess('School added successfully!')
        setForm({ name: '', address: '', contactEmail: '', contactPhone: '' })
        setShowForm(false)
        fetchAll()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Schools</h1>
            <p className="text-gray-500 text-sm">Manage multiple schools in the system</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            {showForm ? 'Cancel' : '+ Add School'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {success && (
            <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-xl">{success}</div>
          )}

          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="font-bold text-gray-800 mb-4">Add New School</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">School Name</label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. Westlands Primary"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Address</label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. Westlands, Nairobi"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Contact Email</label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. info@school.ac.ke"
                    value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Contact Phone</label>
                  <input
                    className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. +254700000000"
                    value={form.contactPhone}
                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save School'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map(school => {
                const schoolStudents = students.filter(s => s.schoolId === school.id)
                const schoolVehicles = vehicles.filter(v => v.schoolId === school.id)
                return (
                  <div key={school.id} className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🏫</div>
                      <div>
                        <p className="font-bold text-gray-800">{school.name}</p>
                        <p className="text-gray-500 text-xs">{school.address || 'No address'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{schoolStudents.length}</p>
                        <p className="text-gray-500 text-xs mt-1">Students</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{schoolVehicles.length}</p>
                        <p className="text-gray-500 text-xs mt-1">Vehicles</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {school.contactEmail && <p>📧 {school.contactEmail}</p>}
                      {school.contactPhone && <p>📞 {school.contactPhone}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}