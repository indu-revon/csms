import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { sessionService, type Session } from '@/services/api'
import dayjs from 'dayjs'

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [form] = Form.useForm()

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const data = await sessionService.getAll()
      setSessions(data)
    } catch (error) {
      message.error('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleCreate = () => {
    setEditingSession(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    form.setFieldsValue({
      ...session,
      startTimestamp: session.startTimestamp ? dayjs(session.startTimestamp) : null,
      stopTimestamp: session.stopTimestamp ? dayjs(session.stopTimestamp) : null,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await sessionService.delete(id)
      message.success('Session deleted successfully')
      fetchSessions()
    } catch (error) {
      message.error('Failed to delete session')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Convert dayjs objects to ISO strings
      const formattedValues = {
        ...values,
        startTimestamp: values.startTimestamp ? values.startTimestamp.toISOString() : undefined,
        stopTimestamp: values.stopTimestamp ? values.stopTimestamp.toISOString() : undefined,
      }
      
      if (editingSession) {
        await sessionService.update(editingSession.id, formattedValues)
        message.success('Session updated successfully')
      } else {
        await sessionService.create(formattedValues)
        message.success('Session created successfully')
      }
      setModalVisible(false)
      form.resetFields()
      fetchSessions()
    } catch (error) {
      message.error(editingSession ? 'Failed to update session' : 'Failed to create session')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Running': return 'green'
      case 'Completed': return 'blue'
      case 'Error': return 'red'
      default: return 'default'
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Station ID',
      dataIndex: 'chargingStationId',
      key: 'chargingStationId',
    },
    {
      title: 'Connector ID',
      dataIndex: 'connectorId',
      key: 'connectorId',
    },
    {
      title: 'OCPP Transaction ID',
      dataIndex: 'ocppTransactionId',
      key: 'ocppTransactionId',
      render: (value: bigint) => value.toString(),
    },
    {
      title: 'OCPP ID Tag',
      dataIndex: 'ocppIdTag',
      key: 'ocppIdTag',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTimestamp',
      key: 'startTimestamp',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'N/A',
    },
    {
      title: 'Stop Time',
      dataIndex: 'stopTimestamp',
      key: 'stopTimestamp',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'N/A',
    },
    {
      title: 'Energy (kWh)',
      dataIndex: 'energyKwh',
      key: 'energyKwh',
      render: (value?: number) => value?.toFixed(2) || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'sessionStatus',
      key: 'sessionStatus',
      render: (status?: string) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Session) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            size="small"
            danger
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Sessions</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Add Session
        </Button>
      </div>
      
      <Table 
        dataSource={sessions} 
        columns={columns} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingSession ? 'Edit Session' : 'Add Session'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="chargingStationId" 
            label="Charging Station ID" 
            rules={[{ required: true, message: 'Please input charging station ID!' }]}
          >
            <Input type="number" />
          </Form.Item>
          
          <Form.Item 
            name="connectorId" 
            label="Connector ID" 
            rules={[{ required: true, message: 'Please input connector ID!' }]}
          >
            <Input type="number" />
          </Form.Item>
          
          <Form.Item 
            name="ocppTransactionId" 
            label="OCPP Transaction ID" 
            rules={[{ required: true, message: 'Please input OCPP transaction ID!' }]}
          >
            <Input type="number" />
          </Form.Item>
          
          <Form.Item 
            name="ocppIdTag" 
            label="OCPP ID Tag" 
            rules={[{ required: true, message: 'Please input OCPP ID tag!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="startTimestamp" 
            label="Start Time" 
            rules={[{ required: true, message: 'Please select start time!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="stopTimestamp" label="Stop Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="startMeterValue" label="Start Meter Value">
            <Input type="number" />
          </Form.Item>
          
          <Form.Item name="stopMeterValue" label="Stop Meter Value">
            <Input type="number" />
          </Form.Item>
          
          <Form.Item name="energyKwh" label="Energy (kWh)">
            <Input type="number" step="0.01" />
          </Form.Item>
          
          <Form.Item name="sessionStatus" label="Status">
            <Select>
              <Select.Option value="Running">Running</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Error">Error</Select.Option>
              <Select.Option value="Canceled">Canceled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
