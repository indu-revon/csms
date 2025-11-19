import { Card, Typography, Alert } from 'antd'

const { Title } = Typography

export default function ServerLogList() {
  return (
    <div>
      <Title level={2}>Server Logs</Title>
      <Alert
        message="Work in Progress"
        description="This page is currently under development. Please check back later."
        type="info"
        showIcon
      />
      <Card style={{ marginTop: 16 }}>
        <p>Server log monitoring functionality will be available here.</p>
      </Card>
    </div>
  )
}