import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/Login'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import StationList from './pages/stations/StationList'
import StationDetail from './pages/stations/StationDetail'
import SessionList from './pages/sessions/SessionList'
import SessionDetail from './pages/sessions/SessionDetail'
import RfidList from './pages/rfid/RfidList'
import ReservationList from './pages/reservations/ReservationList'
import Operations from './pages/operations/Operations'
import UserList from './pages/users/UserList'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stations" element={<StationList />} />
        <Route path="/stations/:id" element={<StationDetail />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/rfid" element={<RfidList />} />
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/users" element={<UserList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
