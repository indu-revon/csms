import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Tag, Descriptions, Table, message } from 'antd'
import { stationService, type Station, type Connector } from '@/services/api'

export default function StationDetail() {
  const { id } = useParams<{ id: string }>()
  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStation = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await stationService.getById(Number(id))
      setStation(data)
    } catch (error) {
      message.error('Failed to fetch station details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStation()
  }, [id])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'green'
      case 'OFFLINE': return 'red'
      case 'ERROR': return 'orange'
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

  if (loading) {
    return <div>Loading...</div>
  }

  if (!station) {
    return <div>Station not found</div>
  }

  return (
    <div>
      <h1>Station Details</h1>
      
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
        </Row>
      </Card>

      <Card title="Connectors">
        <Table 
          dataSource={station.connectors || []} 
          columns={connectorColumns} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}
