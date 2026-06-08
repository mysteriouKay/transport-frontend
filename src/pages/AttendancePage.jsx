import { useState, useEffect } from 'react'
import { getAttendanceReport } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getAttendanceReport()
        setRecords(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter)
  const totalPresent = records.filter(r => r.status === 'present').length
  const totalAbsent = records.filter(r => r.status === 'absent').length

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Report</h1>
            <p className="text-gray-500 text-sm">View all student attendance records</p>
          </div>
          <div className="flex gap-2">
            {['all', 'present', 'absent'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  filter === f
                    ? f === 'present' ? 'bg-green-500 text-white'
                      : f === 'absent' ? 'bg-red-500 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Records' : f === 'present' ? 'Present' : 'Absent'}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">A</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{records.length}</p>
                <p className="text-gray-500 text-sm">Total Records</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">P</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalPresent}</p>
                <p className="text-gray-500 text-sm">Present</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="bg-red-100 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">X</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalAbsent}</p>
                <p className="text-gray-500 text-sm">Absent</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Grade</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Route</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Trip Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Noted At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20 text-gray-400">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20 text-gray-400">No attendance records found.</td>
                  </tr>
                ) : (
                  filtered.map((r, index) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-400 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{r.student?.user?.fullName || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{r.student?.grade || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{r.trip?.route?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{r.trip?.tripDate?.split('T')[0] || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          r.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {r.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(r.notedAt).toLocaleString()}
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