import axios from 'axios'
const API_URL = 'http://localhost:5044/api'
const api = axios.create({
  baseURL: API_URL,
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// Auth
export const login = (data) => api.post('/Auth/login', data)
export const register = (data) => api.post('/Auth/register', data)
// Schools
export const getSchools = () => api.get('/Schools')
export const createSchool = (data) => api.post('/Schools', data)
export const updateSchool = (id, data) => api.put(`/Schools/${id}`, data)
export const deleteSchool = (id) => api.delete(`/Schools/${id}`)
// Vehicles
export const getVehicles = () => api.get('/Vehicles')
export const createVehicle = (data) => api.post('/Vehicles', data)
export const updateVehicle = (id, data) => api.put(`/Vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/Vehicles/${id}`)
// Drivers
export const getDrivers = () => api.get('/Drivers')
export const createDriver = (data) => api.post('/Drivers', data)
export const updateDriver = (id, data) => api.put(`/Drivers/${id}`, data)
export const deleteDriver = (id) => api.delete(`/Drivers/${id}`)
// Routes
export const getRoutes = () => api.get('/Routes')
export const createRoute = (data) => api.post('/Routes', data)
export const updateRoute = (id, data) => api.put(`/Routes/${id}`, data)
export const deleteRoute = (id) => api.delete(`/Routes/${id}`)
// Students
export const getStudents = () => api.get('/Students')
export const createStudent = (data) => api.post('/Students', data)
export const updateStudent = (id, data) => api.put(`/Students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/Students/${id}`)
// Trips
export const getTrips = () => api.get('/Trips')
export const createTrip = (data) => api.post('/Trips', data)
export const updateTrip = (id, data) => api.put(`/Trips/${id}`, data)
export const deleteTrip = (id) => api.delete(`/Trips/${id}`)
export const checkLateTrips = () => api.post('/Trips/check-late')
// Users
export const getUsers = () => api.get('/Users')
export const createUser = (data) => api.post('/Users', data)
export const updateUser = (id, data) => api.put(`/Users/${id}`, data)
export const deleteUser = (id) => api.delete(`/Users/${id}`)
// Notifications
export const getNotifications = (userId) => api.get(`/Notifications/user/${userId}`)
export const createNotification = (data) => api.post('/Notifications', data)
export const markAsRead = (id) => api.put(`/Notifications/read/${id}`)
export const markAllAsRead = (userId) => api.put(`/Notifications/readall/${userId}`)
export const sendSOS = (data) => api.post('/Notifications/sos', data)
// Attendance
export const getTripAttendance = (tripId) => api.get(`/Attendance/trip/${tripId}`)
export const markAttendance = (data) => api.post('/Attendance', data)
export const getAttendanceReport = () => api.get('/Attendance/report')
// Payments
export const getPayments = () => api.get('/Payments')
export const createPayment = (data) => api.post('/Payments', data)
export const deletePayment = (id) => api.delete(`/Payments/${id}`)
export const getStudentPayments = (studentId) => api.get(`/Payments/student/${studentId}`)
export const getPaymentSummary = () => api.get('/Payments/summary')
export const getFeeStructures = () => api.get('/feestructures')
export const createFeeStructure = (data) => api.post('/feestructures', data)
// Trip Locations (Live Tracking)
export const postLocation = (data) => api.post('/TripLocations', data)
export const getLatestLocation = (tripId) => api.get(`/TripLocations/${tripId}`)
export const getActiveLocations = () => api.get('/TripLocations/active')

export default api