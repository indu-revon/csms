import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { stationService, type Station } from '@/services/api'

export default function StationList() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [form] = Form.useForm()

  const fetchStations = async () => {
    setLoading(true)
    try {
      const data = await stationService.getAll()
      setStations(data)
    } catch (error) {
      message.error('Failed to fetch stations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const handleCreate = () => {
    setEditingStation(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (station: Station) => {
    setEditingStation(station)
    form.setFieldsValue(station)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await stationService.delete(id)
      message.success('Station deleted successfully')
      fetchStations()
    } catch (error) {
      message.error('Failed to delete station')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingStation) {
        await stationService.update(editingStation.ocppIdentifier, values)
        message.success('Station updated successfully')
      } else {
        await stationService.create(values)
        message.success('Station created successfully')
      }
      setModalVisible(false)
      form.resetFields()
      fetchStations()
    } catch (error) {
      message.error(editingStation ? 'Failed to update station' : 'Failed to create station')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'green'
      case 'OFFLINE': return 'red'
      case 'ERROR': return 'orange'
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
      title: 'OCPP Identifier',
      dataIndex: 'ocppIdentifier',
      key: 'ocppIdentifier',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status?: string) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Last Heartbeat',
      dataIndex: 'lastHeartbeatAt',
      key: 'lastHeartbeatAt',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Station) => (
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
        <h1>Stations</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Add Station
        </Button>
      </div>
      
      <Table 
        dataSource={stations} 
        columns={columns} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingStation ? 'Edit Station' : 'Add Station'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="ocppIdentifier" 
            label="OCPP Identifier" 
            rules={[{ required: true, message: 'Please input OCPP identifier!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item name="vendor" label="Vendor">
            <Input />
          </Form.Item>
          
          <Form.Item name="model" label="Model">
            <Input />
          </Form.Item>
          
          <Form.Item name="firmwareVersion" label="Firmware Version">
            <Input />
          </Form.Item>
          
          <Form.Item name="serialNumber" label="Serial Number">
            <Input />
          </Form.Item>
          
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="OFFLINE">Offline</Select.Option>
              <Select.Option value="ERROR">Error</Select.Option>
              <Select.Option value="MAINTENANCE">Maintenance</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
