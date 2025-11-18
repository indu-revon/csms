import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userService, type User } from '@/services/api'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
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
        </Form>
      </Modal>
    </div>
  )
}
