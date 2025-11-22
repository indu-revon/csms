import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  message,
  Spin,
  Empty,
  Tag,
  Modal,
  Form,
  Select,
  Dropdown,
  type MenuProps,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  UserOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { driverService, type Driver } from '../../services/api'
import * as XLSX from 'xlsx'

const { Title } = Typography
const { Search } = Input

export default function EvDriverList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Fetch drivers with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['drivers', page, pageSize, searchText, sortBy, statusFilter],
    queryFn: () => driverService.getAll({
      page,
      limit: pageSize,
      search: searchText,
      sortBy,
    }),
  })

  // Filter drivers by status on frontend (since backend doesn't support status filter yet)
  const filteredData = data?.data.filter(driver =>
    statusFilter === 'all' || driver.status === statusFilter
  ) || []

  const filteredTotal = filteredData.length

  // Create driver mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      driverService.create(data),
    onSuccess: (newDriver) => {
      message.success('Driver created successfully')
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      setCreateModalVisible(false)
      form.resetFields()
      navigate(`/ev-drivers/${newDriver.id}`)
    },
    onError: () => {
      message.error('Failed to create driver')
    },
  })

  const handleSearch = (value: string) => {
    setSearchText(value)
    setPage(1)
  }

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)

    if (sorter.field) {
      setSortBy(sorter.field)
    }
  }

  const handleRowClick = (record: Driver) => {
    navigate(`/ev-drivers/${record.id}`)
  }

  const handleCreateDriver = () => {
    setCreateModalVisible(true)
  }

  const handleCreateSubmit = () => {
    form.validateFields().then((values) => {
      createMutation.mutate(values)
    })
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!data || data.data.length === 0) {
      message.warning('No data to export')
      return
    }

    // Prepare data for export
    const exportData = filteredData.map(driver => ({
      'Member Name': driver.name,
      'Email': driver.email,
      'Phone': driver.phone || 'N/A',
      'Virtual RFID Tag': driver.virtualRfidTag || 'N/A',
      'Status': driver.status,
      'Balance': `$${driver.balance.toFixed(2)}`,
      'Hold Balance': `$${driver.holdBalance.toFixed(2)}`,
      'Created': new Date(driver.createdAt).toLocaleDateString(),
      'Updated': new Date(driver.updatedAt).toLocaleDateString(),
    }))

    if (format === 'csv' || format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'EV Drivers')

      if (format === 'csv') {
        XLSX.writeFile(wb, 'ev-drivers.csv')
        message.success('Exported as CSV')
      } else {
        XLSX.writeFile(wb, 'ev-drivers.xlsx')
        message.success('Exported as Excel')
      }
    } else if (format === 'pdf') {
      message.info('PDF export will be implemented soon')
    }
  }

  const downloadMenuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Download as CSV',
      onClick: () => handleExport('csv'),
    },
    {
      key: 'excel',
      label: 'Download as Excel',
      onClick: () => handleExport('excel'),
    },
    {
      key: 'pdf',
      label: 'Download as PDF',
      onClick: () => handleExport('pdf'),
    },
  ]

  const columns: ColumnsType<Driver> = [
    {
      title: 'Member Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <span style={{ color: '#ccc' }}>Not provided</span>,
    },
    {
      title: 'Virtual RFID',
      dataIndex: 'virtualRfidTag',
      key: 'virtualRfidTag',
      render: (tag) => tag || <span style={{ color: '#ccc' }}>Not assigned</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      sorter: true,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>
          ${value.toFixed(2)}
        </Tag>
      ),
      align: 'right',
    },
    {
      title: 'Hold Balance',
      dataIndex: 'holdBalance',
      key: 'holdBalance',
      sorter: true,
      render: (value: number) => (
        <Tag color={value > 0 ? 'orange' : 'default'}>
          ${value.toFixed(2)}
        </Tag>
      ),
      align: 'right',
    },
    {
      title: 'Creation Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  if (error) {
    message.error('Failed to load drivers')
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>EV Drivers</Title>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Search and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <Space direction="vertical" style={{ flex: 1 }}>
              <Search
                placeholder="Search by name or email"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                style={{ width: '100%', maxWidth: 400 }}
              />
              <Space>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 150 }}
                  suffixIcon={<FilterOutlined />}
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Blocked">Blocked</Select.Option>
                </Select>
              </Space>
            </Space>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <Dropdown menu={{ items: downloadMenuItems }} placement="bottomRight">
                <Button icon={<DownloadOutlined />}>
                  Download
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateDriver}
              >
                Add Driver
              </Button>
            </Space>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : !data || filteredData.length === 0 ? (
            <Empty
              description={searchText ? 'No drivers found matching your search' : statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} drivers` : 'No drivers yet'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: filteredTotal,
                showTotal: (total) => `Total ${total} driver${total !== 1 ? 's' : ''}`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onChange={handleTableChange}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' },
              })}
              loading={isLoading}
            />
          )}
        </Space>
      </Card>

      {/* Create Driver Modal */}
      <Modal
        title="Add New Driver"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter driver name' }]}
          >
            <Input placeholder="Enter driver name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter driver email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}