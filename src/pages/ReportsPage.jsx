import { useState, useEffect } from 'react'
import { getStudents, getVehicles, getRoutes, getAttendanceReport, getPayments } from '../services/api'
import Sidebar from '../components/Sidebar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('students')
  const [students, setStudents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [routes, setRoutes] = useState([])
  const [attendance, setAttendance] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, vRes, rRes, aRes, pRes] = await Promise.all([
          getStudents(), getVehicles(), getRoutes(), getAttendanceReport(), getPayments()
        ])
        setStudents(sRes.data)
        setVehicles(vRes.data)
        setRoutes(rRes.data)
        setAttendance(aRes.data)
        setPayments(pRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const downloadCSV = (data, filename) => {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = (title, columns, rows, filename) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(title, 14, 18)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)
    autoTable(doc, {
      startY: 32,
      head: [columns],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] },
    })
    doc.save(filename)
  }

  const tabs = [
    { key: 'students', label: '🎒 Students' },
    { key: 'vehicles', label: '🚌 Vehicles' },
    { key: 'routes', label: '🗺️ Routes' },
    { key: 'attendance', label: '📋 Attendance' },
    { key: 'payments', label: '💰 Payments' },
  ]

  const studentsCSV = students.map(s => ({
    Name: s.user?.fullName || '',
    Grade: s.grade || '',
    School: s.school?.name || '',
    Bus: s.vehicle?.plateNumber || '',
  }))

  const vehiclesCSV = vehicles.map(v => ({
    PlateNumber: v.plateNumber,
    Model: v.model,
    Capacity: v.capacity,
    Status: v.status,
    Condition: v.condition,
  }))

  const routesCSV = routes.map(r => ({
    Name: r.name,
    Description: r.description || '',
    Stops: r.stops?.length || 0,
  }))

  const attendanceCSV = attendance.map(a => ({
    Student: a.student?.user?.fullName || '',
    Trip: a.tripId,
    Status: a.status,
    Date: a.createdAt?.split('T')[0] || '',
  }))

  const paymentsCSV = payments.map(p => ({
    Student: p.student?.user?.fullName || '',
    Amount: p.amount,
    Method: p.paymentMethod,
    Term: p.term || '',
    Date: p.paymentDate?.split('T')[0] || '',
  }))

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm">Download reports as CSV or PDF</p>
        </header>

        <main className="flex-1 p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <>
              {/* Students */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">🎒 Students Report ({students.length})</h2>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCSV(studentsCSV, 'students.csv')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ CSV</button>
                      <button onClick={() => downloadPDF('Students Report', ['Name', 'Grade', 'School', 'Bus'], studentsCSV.map(r => [r.Name, r.Grade, r.School, r.Bus]), 'students.pdf')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ PDF</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">School</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Bus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{s.user?.fullName}</td>
                          <td className="px-6 py-4 text-gray-500">{s.grade}</td>
                          <td className="px-6 py-4 text-gray-500">{s.school?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-500">{s.vehicle?.plateNumber || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Vehicles */}
              {activeTab === 'vehicles' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">🚌 Vehicles Report ({vehicles.length})</h2>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCSV(vehiclesCSV, 'vehicles.csv')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ CSV</button>
                      <button onClick={() => downloadPDF('Vehicles Report', ['Plate', 'Model', 'Capacity', 'Status', 'Condition'], vehiclesCSV.map(r => [r.PlateNumber, r.Model, r.Capacity, r.Status, r.Condition]), 'vehicles.pdf')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ PDF</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Plate Number</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Model</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Capacity</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map(v => (
                        <tr key={v.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{v.plateNumber}</td>
                          <td className="px-6 py-4 text-gray-500">{v.model}</td>
                          <td className="px-6 py-4 text-gray-500">{v.capacity}</td>
                          <td className="px-6 py-4 text-gray-500">{v.status}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              v.condition === 'Good' ? 'bg-green-100 text-green-700' :
                              v.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{v.condition}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Routes */}
              {activeTab === 'routes' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">🗺️ Routes Report ({routes.length})</h2>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCSV(routesCSV, 'routes.csv')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ CSV</button>
                      <button onClick={() => downloadPDF('Routes Report', ['Name', 'Description', 'Stops'], routesCSV.map(r => [r.Name, r.Description, r.Stops]), 'routes.pdf')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ PDF</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Stops</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                          <td className="px-6 py-4 text-gray-500">{r.description || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-500">{r.stops?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Attendance */}
              {activeTab === 'attendance' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">📋 Attendance Report ({attendance.length})</h2>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCSV(attendanceCSV, 'attendance.csv')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ CSV</button>
                      <button onClick={() => downloadPDF('Attendance Report', ['Student', 'Trip ID', 'Status', 'Date'], attendanceCSV.map(r => [r.Student, r.Trip, r.Status, r.Date]), 'attendance.pdf')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ PDF</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Trip ID</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{a.student?.user?.fullName || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-500">#{a.tripId}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${a.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{a.createdAt?.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Payments */}
              {activeTab === 'payments' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">💰 Payments Report ({payments.length})</h2>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCSV(paymentsCSV, 'payments.csv')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ CSV</button>
                      <button onClick={() => downloadPDF('Payments Report', ['Student', 'Amount (KES)', 'Method', 'Term', 'Date'], paymentsCSV.map(r => [r.Student, r.Amount, r.Method, r.Term, r.Date]), 'payments.pdf')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-xl transition">⬇ PDF</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Method</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Term</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{p.student?.user?.fullName || 'N/A'}</td>
                          <td className="px-6 py-4 font-bold text-green-600">KES {Number(p.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-500 capitalize">{p.paymentMethod}</td>
                          <td className="px-6 py-4 text-gray-500">{p.term || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-500">{p.paymentDate?.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}