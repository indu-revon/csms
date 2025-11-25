import React from 'react'
import { Card } from 'antd'
import ServerLogTable from '@/components/ServerLogTable'

const ServerLogList: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="Server Logs" bordered={false}>
        <ServerLogTable />
      </Card>
    </div>
  )
}

export default ServerLogList