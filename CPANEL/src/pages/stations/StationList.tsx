import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, InputNumber, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { stationService, type Station } from '@/services/api'
import { modelService, type Model } from '@/services/modelService'
import { useNavigate } from 'react-router-dom'

export default function StationList() {
  const navigate = useNavigate()
  const [stations, setStations] = useState<Station[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modelModalVisible, setModelModalVisible] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [form] = Form.useForm()
  const [modelForm] = Form.useForm()

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

  const fetchModels = async () => {
    try {
      const data = await modelService.getAll()
      setModels(data)
    } catch (error) {
      message.error('Failed to fetch models')
    }
  }

  useEffect(() => {
    fetchStations()
    fetchModels()
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

  const handleView = (station: Station) => {
    navigate(`/stations/${station.id}`)
  }

  const handleDelete = async (ocppIdentifier: string) => {
    try {
      await stationService.delete(ocppIdentifier)
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
    } catch (error: any) {
      message.error(error.message || 'Failed to save station')
    }
  }

  const handleModelSubmit = async (values: any) => {
    try {
      await modelService.create(values)
      message.success('Model created successfully')
      setModelModalVisible(false)
      modelForm.resetFields()
      fetchModels()
    } catch (error: any) {
      message.error(error.message || 'Failed to create model')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'green'
      case 'OFFLINE': return 'red'
      case 'ERROR': return 'orange'
      case 'MAINTENANCE': return 'blue'
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
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            size="small"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.ocppIdentifier)}
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
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="ocppIdentifier" 
                label="OCPP Identifier" 
                rules={[{ required: true, message: 'Please input OCPP identifier!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vendor" label="Vendor">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="modelId" label="Charging Station Model">
                <Select 
                  showSearch
                  placeholder="Select a model"
                  optionFilterProp="label"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button 
                        type="link" 
                        icon={<PlusOutlined />} 
                        onClick={() => setModelModalVisible(true)}
                        block
                      >
                        Add New Model
                      </Button>
                    </>
                  )}
                >
                  {models.map(model => (
                    <Select.Option 
                      key={model.id} 
                      value={model.id} 
                      label={`${model.name} (${model.vendor || 'Unknown Vendor'})`}
                    >
                      {model.name} ({model.vendor || 'Unknown Vendor'})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="firmwareVersion" label="Firmware Version">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="serialNumber" label="Serial Number">
            <Input />
          </Form.Item>
          
          <h3>Hardware Info</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="powerOutputKw" label="Power Output (kW)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxCurrentAmp" label="Max Current (Amp)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxVoltageV" label="Max Voltage (V)">
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="MAINTENANCE">Maintenance</Select.Option>
              <Select.Option value="ERROR">Error</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Add New Model"
        open={modelModalVisible}
        onCancel={() => {
          setModelModalVisible(false)
          modelForm.resetFields()
        }}
        onOk={() => modelForm.submit()}
      >
        <Form form={modelForm} layout="vertical" onFinish={handleModelSubmit}>
          <Form.Item 
            name="name" 
            label="Model Name" 
            rules={[{ required: true, message: 'Please input model name!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item name="vendor" label="Vendor">
            <Input />
          </Form.Item>
          
          <h3>Hardware Specifications</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="powerOutputKw" label="Power Output (kW)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxCurrentAmp" label="Max Current (Amp)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxVoltageV" label="Max Voltage (V)">
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}