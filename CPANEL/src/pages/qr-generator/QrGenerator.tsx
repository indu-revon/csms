import { Card, Typography, Alert } from 'antd'

const { Title } = Typography

export default function QrGenerator() {
  return (
    <div>
      <Title level={2}>QR Generator</Title>
      <Alert
        message="Work in Progress"
        description="This page is currently under development. Please check back later."
        type="info"
        showIcon
      />
      <Card style={{ marginTop: 16 }}>
        <p>QR code generation functionality will be available here.</p>
      </Card>
    </div>
  )
}