import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Tag, Descriptions, Table, message, Tabs, Button } from 'antd'
import { stationService, type Station, auditLogService, type AuditLog } from '@/services/api'
import RemoteActionsModal from '@/components/RemoteActionsModal'
import ServerLogTable from '@/components/ServerLogTable'

const { TabPane } = Tabs

const WipTab = () => (
  <div style={{ textAlign: 'center', padding: '40px', background: '#f0f2f5', borderRadius: '8px', margin: '20px 0' }}>
    <h2 style={{ marginBottom: '16px' }}>🚧 Work in Progress!</h2>
    <p style={{ fontSize: '16px' }}>We're working hard to bring you this feature. Stay tuned! 🚀</p>
  </div>
)

export default function StationDetail() {
  const { id } = useParams<{ id: string }>()
  const [station, setStation] = useState<Station | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)
  const [remoteModalVisible, setRemoteModalVisible] = useState(false)

  const fetchStation = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await stationService.getById(id)
      setStation(data)
    } catch (error) {
      message.error('Failed to fetch station details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    if (!station) return
    setAuditLogsLoading(true)
    try {
      const data = await auditLogService.getByStationId(station.id)
      setAuditLogs(data)
    } catch (error) {
      message.error('Failed to fetch remote actions history')
    } finally {
      setAuditLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchStation()
  }, [id])

  useEffect(() => {
    if (station) {
      fetchAuditLogs()
    }
  }, [station])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'green'
      case 'OFFLINE': return 'red'
      case 'ERROR': return 'orange'
      case 'MAINTENANCE': return 'blue'
      default: return 'default'
    }
  }

  const getConnectorStatusColor = (status?: string) => {
    switch (status) {
      case 'Available': return 'green'
      case 'Occupied': return 'blue'
      case 'Unavailable': return 'red'
      case 'Reserved': return 'orange'
      default: return 'default'
    }
  }

  const getActionStatusColor = (status?: string) => {
    switch (status) {
      case 'SUCCESS': return 'green'
      case 'FAILED': return 'red'
      case 'PENDING': return 'orange'
      default: return 'default'
    }
  }

  const connectorColumns = [
    {
      title: 'Connector ID',
      dataIndex: 'connectorId',
      key: 'connectorId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status?: string) => (
        <Tag color={getConnectorStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Last Status Update',
      dataIndex: 'lastStatusAt',
      key: 'lastStatusAt',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Max Power (kW)',
      dataIndex: 'maxPowerKw',
      key: 'maxPowerKw',
      render: (power?: number) => power || 'N/A',
    },
  ]

  const auditLogColumns = [
    {
      title: 'Charge Point ID',
      key: 'chargePointId',
      render: () => station?.ocppIdentifier || 'N/A',
    },
    {
      title: 'Remote Action Name',
      dataIndex: 'actionType',
      key: 'actionType',
      render: (text: string) => text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status?: string) => (
        <Tag color={getActionStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Initiated From',
      dataIndex: 'userId',
      key: 'userId',
      render: () => 'Admin Panel', // In a real app, this would show the actual user
    },
    {
      title: 'Initiated At',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <a>Repeat</a>, // In a real app, this would trigger the action again
    },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  if (!station) {
    return <div>Station not found</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Charging Station Details</h1>
        <Button type="primary" onClick={() => setRemoteModalVisible(true)}>Remote Actions</Button>
      </div>

      {station && (
        <RemoteActionsModal
          visible={remoteModalVisible}
          onCancel={() => {
            setRemoteModalVisible(false)
            fetchAuditLogs()
          }}
          stationId={station.ocppIdentifier}
          connectors={station.connectors || []}
        />
      )}

      <Tabs defaultActiveKey="1">
        <TabPane tab="Charging Station Info" key="1">
          <Card title="Station Information" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="ID">{station.id}</Descriptions.Item>
                  <Descriptions.Item label="OCPP Identifier">{station.ocppIdentifier}</Descriptions.Item>
                  <Descriptions.Item label="Vendor">{station.vendor || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Model">{station.model || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(station.status)}>{station.status || 'Unknown'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Firmware Version">{station.firmwareVersion || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Serial Number">{station.serialNumber || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Last Heartbeat">
                    {station.lastHeartbeatAt ? new Date(station.lastHeartbeatAt).toLocaleString() : 'Never'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row >

            <h3>Hardware Information</h3>
            <Row gutter={16}>
              <Col span={8}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="Power Output (kW)">{station.powerOutputKw || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="Max Current (Amp)">{station.maxCurrentAmp || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="Max Voltage (V)">{station.maxVoltageV || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card >

          <Card title="Connectors">
            <Table
              dataSource={station.connectors || []}
              columns={connectorColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane >

        <TabPane tab="Remote Actions" key="2">
          <Card title="Remote Actions History">
            <Table
              dataSource={auditLogs}
              columns={auditLogColumns}
              loading={auditLogsLoading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div>
                    <h4>Request:</h4>
                    <pre>{record.request ? JSON.stringify(JSON.parse(record.request), null, 2) : 'N/A'}</pre>
                    <h4>Response:</h4>
                    <pre>{record.response ? JSON.stringify(JSON.parse(record.response), null, 2) : 'N/A'}</pre>
                    <h4>Status:</h4>
                    <p>{record.status || 'N/A'}</p>
                  </div>
                ),
                rowExpandable: (record) => record.request !== null || record.response !== null,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Tariffs" key="3">
          <WipTab />
        </TabPane>
        <TabPane tab="Local List" key="4">
          <WipTab />
        </TabPane>
        <TabPane tab="Configurations" key="5">
          <WipTab />
        </TabPane>
        <TabPane tab="Sessions" key="6">
          <WipTab />
        </TabPane>
        <TabPane tab="Server Logs" key="7">
          <ServerLogTable stationId={station.ocppIdentifier} />
        </TabPane>
        <TabPane tab="Uptime" key="8">
          <WipTab />
        </TabPane>
        <TabPane tab="Consumption" key="9">
          <WipTab />
        </TabPane>
        <TabPane tab="Revenue" key="10">
          <WipTab />
        </TabPane>
      </Tabs >
    </div >
  )
}