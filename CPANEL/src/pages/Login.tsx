import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    setLoading(true)
    setError(null)
    try {
      await login(values.email, values.password)
      message.success('Login successful')
      navigate('/')
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            REVON
          </Title>
          <Text type="secondary">CSMS Control Panel</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              block
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Default: admin@test.com / password123
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
