import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { rfidService, type RfidCard } from '@/services/api'
import dayjs from 'dayjs'

export default function RfidList() {
  const [rfidCards, setRfidCards] = useState<RfidCard[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCard, setEditingCard] = useState<RfidCard | null>(null)
  const [form] = Form.useForm()

  const fetchRfidCards = async () => {
    setLoading(true)
    try {
      const data = await rfidService.getAll()
      setRfidCards(data)
    } catch (error) {
      message.error('Failed to fetch RFID cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRfidCards()
  }, [])

  const handleCreate = () => {
    setEditingCard(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (card: RfidCard) => {
    setEditingCard(card)
    form.setFieldsValue({
      ...card,
      validFrom: card.validFrom ? dayjs(card.validFrom) : null,
      validUntil: card.validUntil ? dayjs(card.validUntil) : null,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await rfidService.delete(id.toString())
      message.success('RFID card deleted successfully')
      fetchRfidCards()
    } catch (error) {
      message.error('Failed to delete RFID card')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Convert dayjs objects to ISO strings
      const formattedValues = {
        ...values,
        validFrom: values.validFrom ? values.validFrom.toISOString() : undefined,
        validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
      }
      
      if (editingCard) {
        await rfidService.update(editingCard.tagId, formattedValues)
        message.success('RFID card updated successfully')
      } else {
        await rfidService.create(formattedValues)
        message.success('RFID card created successfully')
      }
      setModalVisible(false)
      form.resetFields()
      fetchRfidCards()
    } catch (error) {
      message.error(editingCard ? 'Failed to update RFID card' : 'Failed to create RFID card')
    }
  }

  const handleBlock = async (tagId: string) => {
    try {
      await rfidService.block(tagId)
      message.success('RFID card blocked successfully')
      fetchRfidCards()
    } catch (error) {
      message.error('Failed to block RFID card')
    }
  }

  const handleActivate = async (tagId: string) => {
    try {
      await rfidService.activate(tagId)
      message.success('RFID card activated successfully')
      fetchRfidCards()
    } catch (error) {
      message.error('Failed to activate RFID card')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green'
      case 'Blocked': return 'red'
      case 'Expired': return 'orange'
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
      title: 'Tag ID',
      dataIndex: 'tagId',
      key: 'tagId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Valid From',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (date?: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date?: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId?: number) => userId || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RfidCard) => (
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
          {record.status === 'Active' && (
            <Button 
              onClick={() => handleBlock(record.tagId)}
              size="small"
              type="primary"
              danger
            >
              Block
            </Button>
          )}
          {record.status === 'Blocked' && (
            <Button 
              onClick={() => handleActivate(record.tagId)}
              size="small"
              type="primary"
            >
              Activate
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>RFID Cards</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Add RFID Card
        </Button>
      </div>
      
      <Table 
        dataSource={rfidCards} 
        columns={columns} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCard ? 'Edit RFID Card' : 'Add RFID Card'}
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
            name="tagId" 
            label="Tag ID" 
            rules={[{ required: true, message: 'Please input tag ID!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="status" 
            label="Status" 
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Blocked">Blocked</Select.Option>
              <Select.Option value="Expired">Expired</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="validFrom" label="Valid From">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="validUntil" label="Valid Until">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="userId" label="User ID">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
