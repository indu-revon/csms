import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Tag, message } from 'antd'
import { sessionService, type Session } from '@/services/api'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSession = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await sessionService.getById(Number(id))
      setSession(data)
    } catch (error) {
      message.error('Failed to fetch session details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [id])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Running': return 'green'
      case 'Completed': return 'blue'
      case 'Error': return 'red'
      default: return 'default'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Session not found</div>
  }

  return (
    <div>
      <h1>Session Details</h1>
      
      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <Descriptions column={1} layout="horizontal">
              <Descriptions.Item label="ID">{session.id}</Descriptions.Item>
              <Descriptions.Item label="Charging Station ID">{session.chargingStationId}</Descriptions.Item>
              <Descriptions.Item label="Connector ID">{session.connectorId}</Descriptions.Item>
              <Descriptions.Item label="OCPP Transaction ID">{session.ocppTransactionId.toString()}</Descriptions.Item>
              <Descriptions.Item label="OCPP ID Tag">{session.ocppIdTag}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(session.sessionStatus)}>{session.sessionStatus || 'Unknown'}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} layout="horizontal">
              <Descriptions.Item label="Start Time">
                {session.startTimestamp ? new Date(session.startTimestamp).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Stop Time">
                {session.stopTimestamp ? new Date(session.stopTimestamp).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Meter Value">{session.startMeterValue || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Stop Meter Value">{session.stopMeterValue || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Energy (kWh)">
                {session.energyKwh ? session.energyKwh.toFixed(2) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(session.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
