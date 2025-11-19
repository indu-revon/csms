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
// New imports
import PartnerList from './pages/partners/PartnerList'
import LocationList from './pages/locations/LocationList'
import EvDriverList from './pages/ev-drivers/EvDriverList'
import TransactionList from './pages/transactions/TransactionList'
import ScheduleList from './pages/schedules/ScheduleList'
import DowntimeList from './pages/downtime/DowntimeList'
import MapList from './pages/maps/MapList'
import TariffList from './pages/tariffs/TariffList'
import StaticDataList from './pages/static-data/StaticDataList'
import ConnectionList from './pages/connections/ConnectionList'
import ServerLogList from './pages/server-logs/ServerLogList'
import QrGenerator from './pages/qr-generator/QrGenerator'

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
        {/* New routes */}
        <Route path="/partners" element={<PartnerList />} />
        <Route path="/locations" element={<LocationList />} />
        <Route path="/ev-drivers" element={<EvDriverList />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/schedules" element={<ScheduleList />} />
        <Route path="/downtime" element={<DowntimeList />} />
        <Route path="/maps" element={<MapList />} />
        <Route path="/charging-sessions" element={<SessionList />} />
        <Route path="/tariffs" element={<TariffList />} />
        <Route path="/static-data" element={<StaticDataList />} />
        <Route path="/connections" element={<ConnectionList />} />
        <Route path="/server-logs" element={<ServerLogList />} />
        <Route path="/qr-generator" element={<QrGenerator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App