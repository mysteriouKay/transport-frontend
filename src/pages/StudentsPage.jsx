import { useState, useEffect } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent, getSchools, getVehicles, getUsers } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [schools, setSchools] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState({ userId: '', schoolId: '', grade: '', parentId: '', vehicleId: '' })
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      const [sRes, schRes, vRes, uRes] = await Promise.all([getStudents(), getSchools(), getVehicles(), getUsers()])
      setStudents(sRes.data)
      setSchools(schRes.data)
      setVehicles(vRes.data)
      setUsers(uRes.data)
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
        userId: form.userId ? parseInt(form.userId) : null,
        schoolId: form.schoolId ? parseInt(form.schoolId) : null,
        grade: form.grade,
        parentId: form.parentId ? parseInt(form.parentId) : null,
        vehicleId: form.vehicleId ? parseInt(form.vehicleId) : null,
      }
      if (editingStudent) {
        await updateStudent(editingStudent.id, { ...payload, id: editingStudent.id })
      } else {
        await createStudent(payload)
      }
      setForm({ userId: '', schoolId: '', grade: '', parentId: '', vehicleId: '' })
      setShowForm(false)
      setEditingStudent(null)
      setError('')
      fetchAll()
    } catch (err) {
      setError('Failed to save student.')
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setForm({
      userId: student.userId || '',
      schoolId: student.schoolId || '',
      grade: student.grade || '',
      parentId: student.parentId || '',
      vehicleId: student.vehicleId || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return
    await deleteStudent(id)
    fetchAll()
  }

  const parents = users.filter(u => u.role === 'parent')
  const studentUsers = users.filter(u => u.role === 'student')

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Students</h1>
            <p className="text-gray-500 text-sm">Manage students and their bus assignments</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingStudent(null); setForm({ userId: '', schoolId: '', grade: '', parentId: '', vehicleId: '' }) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </header>

        <main className="flex-1 p-8">
          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student (User Account)</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Student</option>
                    {studentUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} — {u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Parent</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} — {p.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Grade 5"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Bus</label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Bus Assigned</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plateNumber} — {v.model} (Cap: {v.capacity})</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">
                    {editingStudent ? 'Update Student' : 'Save Student'}
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Grade</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Parent</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Assigned Bus</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400">No students found.</td></tr>
                ) : (
                  students.map((s, index) => {
                    const assignedVehicle = vehicles.find(v => v.id === s.vehicleId)
                    const parentUser = users.find(u => u.id === s.parentId)
                    return (
                      <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-400 text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{s.user?.fullName || 'N/A'}</p>
                          <p className="text-gray-400 text-xs">{s.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{s.grade || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{parentUser?.fullName || s.parent?.fullName || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {assignedVehicle ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              {assignedVehicle.plateNumber}
                            </span>
                          ) : (
                            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex gap-3">
                          <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700 text-sm transition">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-sm transition">Delete</button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}