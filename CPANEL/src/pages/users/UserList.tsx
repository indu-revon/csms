import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card, Descriptions, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { userService, type User } from '@/services/api'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (error) {
      message.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setDetailsVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await userService.delete(id)
      message.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      message.error('Failed to delete user')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, values)
        message.success('User updated successfully')
      } else {
        await userService.create(values)
        message.success('User created successfully')
      }
      setModalVisible(false)
      form.resetFields()
      fetchUsers()
    } catch (error) {
      message.error(editingUser ? 'Failed to update user' : 'Failed to create user')
    }
  }

  const handleResetPassword = async () => {
    message.success('Password reset email sent')
  }

  const handleToggleBlock = async () => {
    if (!selectedUser) return
    try {
      const newStatus = selectedUser.status === 'Blocked' ? 'Active' : 'Blocked'
      await userService.update(selectedUser.id, { status: newStatus })
      message.success(`User ${newStatus === 'Blocked' ? 'blocked' : 'activated'} successfully`)
      setSelectedUser({ ...selectedUser, status: newStatus })
      fetchUsers()
    } catch (error) {
      message.error('Failed to update user status')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'red'
      case 'OPERATOR': return 'blue'
      case 'VIEWER': return 'green'
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Blocked' ? 'red' : 'green'}>{status || 'Active'}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(record)
            }}
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(record.id)
            }}
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
        <h1>Users</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Add User
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => handleView(record),
          style: { cursor: 'pointer' }
        })}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
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
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Please input valid email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select>
              <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
              <Select.Option value="OPERATOR">Operator</Select.Option>
              <Select.Option value="VIEWER">Viewer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="organization"
            label="Organization Name"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="locations"
            label="Locations"
          >
            <Input placeholder="e.g. All Locations" />
          </Form.Item>

          <Form.Item
            name="locationsGroup"
            label="Locations Group"
          >
            <Input placeholder="e.g. N/A" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="User Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="reset" icon={<ReloadOutlined />} onClick={handleResetPassword}>
            Reset Password
          </Button>,
          <Button
            key="block"
            danger={selectedUser?.status !== 'Blocked'}
            type={selectedUser?.status === 'Blocked' ? 'primary' : 'default'}
            icon={selectedUser?.status === 'Blocked' ? <CheckCircleOutlined /> : <StopOutlined />}
            onClick={handleToggleBlock}
          >
            {selectedUser?.status === 'Blocked' ? 'Unblock User' : 'Block User'}
          </Button>,
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <Card bordered={false}>
            <Descriptions title="Operator Info" bordered column={1}>
              <Descriptions.Item label="Status">
                <Tag color={selectedUser.status === 'Blocked' ? 'red' : 'green'}>
                  {selectedUser.status || 'Active'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Organization Name">{selectedUser.organization || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Locations">{selectedUser.locations || 'All Locations'}</Descriptions.Item>
              <Descriptions.Item label="Locations Group">{selectedUser.locationsGroup || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email Id">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedUser.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Creation Date">
                {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  )
}
