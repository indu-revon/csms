import LiveSessionTable from '@/components/LiveSessionTable'

export default function SessionList() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1>Live Sessions</h1>
        <p style={{ color: '#666' }}>Real-time view of active charging sessions</p>
      </div>

      <LiveSessionTable />
    </div>
  )
}
