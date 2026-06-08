import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import VehiclesPage from './pages/VehiclesPage'
import RoutesPage from './pages/RoutesPage'
import DriversPage from './pages/DriversPage'
import StudentsPage from './pages/StudentsPage'
import TripsPage from './pages/TripsPage'
import SchoolsPage from './pages/SchoolsPage'
import UsersPage from './pages/UsersPage'
import RegisterPage from './pages/RegisterPage'
import AttendancePage from './pages/AttendancePage'
import PaymentsPage from './pages/PaymentsPage'
import ReportsPage from './pages/ReportsPage'
import TrackingPage from './pages/TrackingPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DriverDashboard from './pages/DriverDashboard'
import ParentDashboard from './pages/ParentDashboard'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/schools" element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
        <Route path="/admin/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
        <Route path="/admin/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/admin/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/admin/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
        <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}