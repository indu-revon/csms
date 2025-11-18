import { Card, Form, Select, Button, Input, message, Space } from 'antd'
import { useState } from 'react'
import { operationsService } from '@/services/api'

export default function Operations() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const { operation, cpId, ...params } = values
      
      switch (operation) {
        case 'start':
          await operationsService.remoteStart(cpId, params)
          break
        case 'stop':
          await operationsService.remoteStop(cpId, params)
          break
        case 'availability':
          await operationsService.changeAvailability(cpId, params)
          break
        case 'reset':
          await operationsService.reset(cpId, params)
          break
        case 'unlock':
          await operationsService.unlockConnector(cpId, params)
          break
      }
      
      message.success('Operation executed successfully')
      form.resetFields()
    } catch (error) {
      message.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Remote Operations</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="cpId" label="Station ID" rules={[{ required: true }]}>
            <Input placeholder="e.g., CP_TEST_001" />
          </Form.Item>

          <Form.Item name="operation" label="Operation" rules={[{ required: true }]}>
            <Select placeholder="Select operation">
              <Select.Option value="start">Remote Start</Select.Option>
              <Select.Option value="stop">Remote Stop</Select.Option>
              <Select.Option value="availability">Change Availability</Select.Option>
              <Select.Option value="reset">Reset</Select.Option>
              <Select.Option value="unlock">Unlock Connector</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const operation = getFieldValue('operation')
              
              if (operation === 'start') {
                return (
                  <>
                    <Form.Item name="connectorId" label="Connector ID" rules={[{ required: true }]}>
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="idTag" label="RFID Tag" rules={[{ required: true }]}>
                      <Input placeholder="e.g., RFID_TEST_001" />
                    </Form.Item>
                  </>
                )
              }
              
              if (operation === 'stop') {
                return (
                  <Form.Item name="transactionId" label="Transaction ID" rules={[{ required: true }]}>
                    <Input type="number" />
                  </Form.Item>
                )
              }
              
              if (operation === 'availability') {
                return (
                  <>
                    <Form.Item name="connectorId" label="Connector ID" rules={[{ required: true }]}>
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="Operative">Operative</Select.Option>
                        <Select.Option value="Inoperative">Inoperative</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                )
              }
              
              if (operation === 'reset') {
                return (
                  <Form.Item name="type" label="Reset Type" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="Soft">Soft</Select.Option>
                      <Select.Option value="Hard">Hard</Select.Option>
                    </Select>
                  </Form.Item>
                )
              }
              
              if (operation === 'unlock') {
                return (
                  <Form.Item name="connectorId" label="Connector ID" rules={[{ required: true }]}>
                    <Input type="number" />
                  </Form.Item>
                )
              }
              
              return null
            }}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Execute
              </Button>
              <Button onClick={() => form.resetFields()}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
