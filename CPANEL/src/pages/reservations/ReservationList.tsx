import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { reservationService, stationService, type Reservation, type Station } from '@/services/api'
import dayjs from 'dayjs'

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [form] = Form.useForm()

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const data = await reservationService.getAll()
      setReservations(data)
    } catch (error) {
      message.error('Failed to fetch reservations')
    } finally {
      setLoading(false)
    }
  }

  const fetchStations = async () => {
    try {
      const data = await stationService.getAll()
      setStations(data)
    } catch (error) {
      message.error('Failed to fetch charging stations')
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchStations()
  }, [])

  const handleCreate = () => {
    setEditingReservation(null)
    // Explicitly set all form fields to empty/initial values
    form.setFieldsValue({
      chargingStationId: undefined,
      connectorId: undefined,
      ocppReservationId: undefined,
      ocppIdTag: undefined,
      expiryDatetime: undefined,
      status: 'Active'
    })
    setModalVisible(true)
  }

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation)
    form.setFieldsValue({
      ...reservation,
      expiryDatetime: reservation.expiryDatetime ? dayjs(reservation.expiryDatetime) : null,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await reservationService.delete(id)
      message.success('Reservation deleted successfully')
      fetchReservations()
    } catch (error) {
      message.error('Failed to delete reservation')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Log the values being sent for debugging
      console.log('Submitting reservation data:', values);
      
      // Convert string values to proper data types
      const formattedValues = {
        ...values,
        chargingStationId: values.chargingStationId ? parseInt(values.chargingStationId, 10) : undefined,
        connectorId: values.connectorId !== undefined && values.connectorId !== '' ? parseInt(values.connectorId, 10) : null,
        ocppReservationId: values.ocppReservationId ? parseInt(values.ocppReservationId, 10) : undefined,
        expiryDatetime: values.expiryDatetime ? values.expiryDatetime.toISOString() : undefined,
      }
      
      console.log('Formatted reservation data:', formattedValues);
      
      if (editingReservation) {
        await reservationService.update(editingReservation.id, formattedValues)
        message.success('Reservation updated successfully')
      } else {
        await reservationService.create(formattedValues)
        message.success('Reservation created successfully')
      }
      setModalVisible(false)
      // Explicitly reset all form fields
      form.setFieldsValue({
        chargingStationId: undefined,
        connectorId: undefined,
        ocppReservationId: undefined,
        ocppIdTag: undefined,
        expiryDatetime: undefined,
        status: 'Active'
      })
      fetchReservations()
    } catch (error: any) {
      // Log the error for debugging
      console.error('Error creating reservation:', error);
      
      // Handle specific error messages from the backend
      let errorMessage = '';
      
      // Check various possible error response structures
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = editingReservation ? 'Failed to update reservation' : 'Failed to create reservation';
      }
      
      message.error(errorMessage);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green'
      case 'Expired': return 'red'
      case 'Cancelled': return 'orange'
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
      render: (connectorId?: number) => connectorId || 'Any',
    },
    {
      title: 'OCPP Reservation ID',
      dataIndex: 'ocppReservationId',
      key: 'ocppReservationId',
    },
    {
      title: 'OCPP ID Tag',
      dataIndex: 'ocppIdTag',
      key: 'ocppIdTag',
    },
    {
      title: 'Expiry Datetime',
      dataIndex: 'expiryDatetime',
      key: 'expiryDatetime',
      render: (date: string) => new Date(date).toLocaleString(),
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Reservation) => (
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
        <h1>Reservations</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Add Reservation
        </Button>
      </div>
      
      <Table 
        dataSource={reservations} 
        columns={columns} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingReservation ? 'Edit Reservation' : 'Add Reservation'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          // Explicitly reset all form fields when canceling
          form.setFieldsValue({
            chargingStationId: undefined,
            connectorId: undefined,
            ocppReservationId: undefined,
            ocppIdTag: undefined,
            expiryDatetime: undefined,
            status: 'Active'
          })
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{
            status: 'Active'
          }}
        >
          <Form.Item 
            name="chargingStationId" 
            label="Charging Station" 
            rules={[{ required: true, message: 'Please select a charging station!' }]}
          >
            <Select 
              showSearch
              placeholder="Select a charging station"
              optionFilterProp="label"
            >
              {stations.map(station => (
                <Select.Option key={station.id} value={station.id} label={station.ocppIdentifier}>
                  {station.ocppIdentifier} (ID: {station.id})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="connectorId" label="Connector ID">
            <Input type="number" />
          </Form.Item>
          
          <Form.Item 
            name="ocppReservationId" 
            label="OCPP Reservation ID" 
            rules={[{ required: true, message: 'Please input OCPP reservation ID!' }]}
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
            name="expiryDatetime" 
            label="Expiry Datetime" 
            rules={[{ required: true, message: 'Please select expiry datetime!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            name="status" 
            label="Status" 
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Expired">Expired</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}