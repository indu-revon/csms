import { Card, Typography, Alert } from 'antd'

const { Title } = Typography

export default function PartnerList() {
  return (
    <div>
      <Title level={2}>Partners</Title>
      <Alert
        message="Work in Progress"
        description="This page is currently under development. Please check back later."
        type="info"
        showIcon
      />
      <Card style={{ marginTop: 16 }}>
        <p>Partner management functionality will be available here.</p>
      </Card>
    </div>
  )
}