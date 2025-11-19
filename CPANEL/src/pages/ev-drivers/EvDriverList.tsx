import { Card, Typography, Alert } from 'antd'

const { Title } = Typography

export default function EvDriverList() {
  return (
    <div>
      <Title level={2}>EV Drivers</Title>
      <Alert
        message="Work in Progress"
        description="This page is currently under development. Please check back later."
        type="info"
        showIcon
      />
      <Card style={{ marginTop: 16 }}>
        <p>EV driver management functionality will be available here.</p>
      </Card>
    </div>
  )
}