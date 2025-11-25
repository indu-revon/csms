import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { stationService, sessionService, type Station } from '@/services/api'
import dayjs from 'dayjs'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stations, setStations] = useState<Station[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [stationsData, sessionsData] = await Promise.all([
        stationService.getAll(),
        sessionService.getAll(),
      ])
      setStations(stationsData)

      // Handle both array and paginated response formats
      if (Array.isArray(sessionsData)) {
        setRecentSessions(sessionsData.slice(0, 10))
      } else if (sessionsData && 'data' in sessionsData) {
        setRecentSessions(sessionsData.data.slice(0, 10))
      } else {
        setRecentSessions([])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onlineCount = stations.filter((s) => s.status === 'ONLINE').length
  const offlineCount = stations.filter((s) => s.status === 'OFFLINE').length
  const activeSessions = recentSessions.filter((s) => !s.stopTimestamp).length

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'ocppTransactionId',
      key: 'ocppTransactionId',
      render: (id: bigint) => `#${id.toString()}`,
    },
    {
      title: 'RFID Tag',
      dataIndex: 'ocppIdTag',
      key: 'ocppIdTag',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTimestamp',
      key: 'startTimestamp',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Energy (kWh)',
      dataIndex: 'energyKwh',
      key: 'energyKwh',
      render: (energy: number) => energy?.toFixed(2) || '-',
    },
    {
      title: 'Status',
      dataIndex: 'sessionStatus',
      key: 'sessionStatus',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>
          {status || 'ACTIVE'}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <h1>Dashboard</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Stations"
              value={stations.length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Online"
              value={onlineCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Offline"
              value={offlineCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={activeSessions}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Sessions" extra={<SyncOutlined onClick={loadDashboardData} />}>
        <Table
          dataSource={recentSessions}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
