import { Card, Typography, Alert } from 'antd'

const { Title } = Typography

export default function DowntimeList() {
  return (
    <div>
      <Title level={2}>Downtime</Title>
      <Alert
        message="Work in Progress"
        description="This page is currently under development. Please check back later."
        type="info"
        showIcon
      />
      <Card style={{ marginTop: 16 }}>
        <p>Downtime management functionality will be available here.</p>
      </Card>
    </div>
  )
}