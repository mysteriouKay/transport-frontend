import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getActiveLocations } from '../services/api'
import Sidebar from '../components/Sidebar'

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const busIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:32px;filter:drop-shadow(2px 2px 2px rgba(0,0,0,0.3))">🚌</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export default function TrackingPage() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchLocations = async () => {
    try {
      const res = await getActiveLocations()
      setBuses(res.data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
    const interval = setInterval(fetchLocations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Default center — Nairobi
  const defaultCenter = [-1.2921, 36.8219]

  const mapCenter = buses.length > 0
    ? [parseFloat(buses[0].latitude), parseFloat(buses[0].longitude)]
    : defaultCenter

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Live Bus Tracking</h1>
              <p className="text-gray-500 text-sm">
                {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block"></span>
              <span className="text-sm text-green-600 font-medium">{buses.length} bus{buses.length !== 1 ? 'es' : ''} active</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Active buses list */}
          {buses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {buses.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
                  <span className="text-3xl">🚌</span>
                  <div>
                    <p className="font-bold text-gray-800">{b.vehicle || 'Bus'}</p>
                    <p className="text-gray-500 text-sm">{b.route || 'N/A'}</p>
                    <p className="text-green-500 text-xs font-medium">● Live</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl shadow overflow-hidden" style={{ height: '520px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading map...
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {buses.map((b, i) => (
                  <Marker
                    key={i}
                    position={[parseFloat(b.latitude), parseFloat(b.longitude)]}
                    icon={busIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-lg">🚌 {b.vehicle}</p>
                        <p className="text-gray-600">Route: {b.route}</p>
                        <p className="text-green-500 text-sm font-medium">● Live Tracking</p>
                        <p className="text-gray-400 text-xs">Updated: {new Date(b.recordedAt).toLocaleTimeString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {buses.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p>No active buses</p>
                  </div>
                )}
              </MapContainer>
            )}
          </div>

          {buses.length === 0 && !loading && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-lg">No buses currently active.</p>
              <p className="text-sm">Buses appear here when a driver starts a trip.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}