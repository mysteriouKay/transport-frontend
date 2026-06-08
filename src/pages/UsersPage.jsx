import { useState, useEffect } from 'react'
import { getUsers, deleteUser } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (err) {
      setError('Cannot delete user — they may be linked to other records.')
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
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-500 text-sm">Manage all system users</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
            Total: {users.length} users
          </div>
        </header>

        <main className="flex-1 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 mt-20">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-lg">No users yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <div key={u.id} className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                        {u.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{u.fullName}</p>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                        <span className={`text-xs px-3 py-1 rounded-full mt-1 inline-block font-medium ${roleColor(u.role)}`}>
                          {roleIcon(u.role)} {u.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(u.id)}
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