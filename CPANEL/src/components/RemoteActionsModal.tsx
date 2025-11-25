import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Form, Select, message, Alert, Divider, Input, DatePicker, Row, Col, Tag } from 'antd'
import { operationsService, sessionService, rfidService, ocppLogService, type Session, type RfidCard } from '@/services/api'

const { Option } = Select

interface RemoteActionsModalProps {
    visible: boolean
    onCancel: () => void
    stationId: string
    connectors: { connectorId: number; status?: string }[]
}

type ActionType = 'remoteStart' | 'remoteStop' | 'reset' | 'unlock' | 'changeAvailability' | 'clearCache' | 'triggerMessage' | 'dataTransfer' | 'reserveNow' | 'cancelReservation' | null

export default function RemoteActionsModal({ visible, onCancel, stationId, connectors }: RemoteActionsModalProps) {
    const [loading, setLoading] = useState(false)
    const [selectedAction, setSelectedAction] = useState<ActionType>(null)
    const [activeSessions, setActiveSessions] = useState<Session[]>([])
    const [rfidTags, setRfidTags] = useState<RfidCard[]>([])
    const [form] = Form.useForm()

    // Terminal State
    const [logs, setLogs] = useState<any[]>([])
    const terminalEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (visible) {
            fetchData()
            form.resetFields()
            setSelectedAction(null)
            // Start polling for logs
            fetchLogs()
            const interval = setInterval(fetchLogs, 3000)
            return () => clearInterval(interval)
        }
    }, [visible])

    // Auto-scroll to bottom of terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const fetchData = async () => {
        try {
            const [sessions, tags] = await Promise.all([
                sessionService.getActiveByStation(stationId).catch(() => []),
                rfidService.getAll().catch(() => [])
            ])
            setActiveSessions(sessions)
            setRfidTags(tags)
        } catch (error) {
            console.error('Failed to fetch initial data', error)
        }
    }

    const fetchLogs = async () => {
        try {
            // Fetch last 50 logs for this station
            const response = await ocppLogService.getByStation(stationId, { limit: 50, page: 1 })
            // Sort by timestamp ascending for terminal view
            const sortedLogs = response.data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            setLogs(sortedLogs)
        } catch (error) {
            console.error('Failed to fetch logs', error)
        }
    }

    const handleAction = async (values: any) => {
        if (!selectedAction) return
        setLoading(true)
        try {
            let result: any
            switch (selectedAction) {
                case 'reset':
                    result = await operationsService.reset(stationId, { type: values.type })
                    break
                case 'unlock':
                    result = await operationsService.unlockConnector(stationId, { connectorId: values.connectorId })
                    break
                case 'remoteStart':
                    result = await operationsService.remoteStart(stationId, {
                        idTag: values.idTag,
                        connectorId: values.connectorId
                    })
                    break
                case 'remoteStop':
                    result = await operationsService.remoteStop(stationId, {
                        transactionId: parseInt(values.transactionId)
                    })
                    break
                case 'changeAvailability':
                    result = await operationsService.changeAvailability(stationId, {
                        connectorId: values.connectorId,
                        type: values.type
                    })
                    break
                case 'clearCache':
                    result = await operationsService.clearCache(stationId)
                    break
                case 'triggerMessage':
                    result = await operationsService.triggerMessage(stationId, {
                        requestedMessage: values.requestedMessage,
                        connectorId: values.connectorId
                    })
                    break
                case 'dataTransfer':
                    result = await operationsService.dataTransfer(stationId, {
                        vendorId: values.vendorId,
                        messageId: values.messageId,
                        data: values.data
                    })
                    break
                case 'reserveNow':
                    result = await operationsService.reserveNow(stationId, {
                        connectorId: values.connectorId,
                        expiryDate: values.expiryDate.toDate(),
                        idTag: values.idTag,
                        reservationId: parseInt(values.reservationId),
                        parentIdTag: values.parentIdTag
                    })
                    break
                case 'cancelReservation':
                    result = await operationsService.cancelReservation(stationId, {
                        reservationId: parseInt(values.reservationId)
                    })
                    break
                default:
                    throw new Error('Unknown action')
            }

            if (result && result.status === 'Rejected') {
                message.error(`Action rejected by station: ${result.status}`)
            } else {
                message.success('Action sent successfully')
                // Don't close modal, let user see result in terminal
                form.resetFields()
                setSelectedAction(null)
                // Trigger immediate log fetch
                setTimeout(fetchLogs, 1000)
            }
        } catch (error: any) {
            message.error(`Failed to execute action: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const renderForm = () => {
        switch (selectedAction) {
            case 'remoteStart':
                return (
                    <>
                        <Alert message="Select a connector and an RFID tag to start charging." type="info" showIcon style={{ marginBottom: 16 }} />
                        <Form.Item name="connectorId" label="Connector">
                            <Select placeholder="Select Connector" allowClear>
                                {connectors.map(c => (
                                    <Option key={c.connectorId} value={c.connectorId}>Connector {c.connectorId} ({c.status})</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="idTag" label="RFID Tag" rules={[{ required: true, message: 'Please select an RFID tag' }]}>
                            <Select placeholder="Select RFID Tag" showSearch optionFilterProp="children">
                                {rfidTags.map(t => (
                                    <Option key={t.tagId} value={t.tagId}>{t.tagId} ({t.status})</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Start Transaction</Button>
                    </>
                )
            case 'remoteStop':
                return (
                    <>
                        <Alert message="Select an active transaction to stop." type="warning" showIcon style={{ marginBottom: 16 }} />
                        <Form.Item name="transactionId" label="Active Transaction" rules={[{ required: true, message: 'Please select a transaction' }]}>
                            <Select placeholder="Select Transaction">
                                {activeSessions.map(s => (
                                    <Option key={s.ocppTransactionId.toString()} value={s.ocppTransactionId.toString()}>
                                        ID: {s.ocppTransactionId.toString()} (Connector {s.connectorId})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} danger block>Stop Transaction</Button>
                    </>
                )
            case 'reset':
                return (
                    <>
                        <Alert message="Warning: Hard reset will reboot the station immediately." type="warning" showIcon style={{ marginBottom: 16 }} />
                        <Form.Item name="type" label="Reset Type" initialValue="Soft" rules={[{ required: true }]}>
                            <Select>
                                <Option value="Soft">Soft Reset</Option>
                                <Option value="Hard">Hard Reset</Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} danger block>Reset Station</Button>
                    </>
                )
            case 'unlock':
                return (
                    <>
                        <Form.Item name="connectorId" label="Connector" rules={[{ required: true }]}>
                            <Select placeholder="Select Connector">
                                {connectors.map(c => (
                                    <Option key={c.connectorId} value={c.connectorId}>Connector {c.connectorId} ({c.status})</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Unlock Connector</Button>
                    </>
                )
            case 'changeAvailability':
                return (
                    <>
                        <Form.Item name="connectorId" label="Connector" rules={[{ required: true }]}>
                            <Select placeholder="Select Connector">
                                <Option value={0}>0 (Entire Station)</Option>
                                {connectors.map(c => (
                                    <Option key={c.connectorId} value={c.connectorId}>Connector {c.connectorId}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="type" label="Availability Type" initialValue="Operative" rules={[{ required: true }]}>
                            <Select>
                                <Option value="Operative">Operative (Available)</Option>
                                <Option value="Inoperative">Inoperative (Unavailable)</Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Change Availability</Button>
                    </>
                )
            case 'clearCache':
                return (
                    <>
                        <Alert message="Clear the charging station's authorization cache." type="info" showIcon style={{ marginBottom: 16 }} />
                        <Button type="primary" htmlType="submit" loading={loading} block>Clear Cache</Button>
                    </>
                )
            case 'triggerMessage':
                return (
                    <>
                        <Form.Item name="requestedMessage" label="Message Type" rules={[{ required: true }]}>
                            <Select placeholder="Select Message Type">
                                <Option value="BootNotification">Boot Notification</Option>
                                <Option value="DiagnosticsStatusNotification">Diagnostics Status Notification</Option>
                                <Option value="FirmwareStatusNotification">Firmware Status Notification</Option>
                                <Option value="Heartbeat">Heartbeat</Option>
                                <Option value="MeterValues">Meter Values</Option>
                                <Option value="StatusNotification">Status Notification</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="connectorId" label="Connector (Optional)">
                            <Select placeholder="Select Connector" allowClear>
                                {connectors.map(c => (
                                    <Option key={c.connectorId} value={c.connectorId}>Connector {c.connectorId}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Trigger Message</Button>
                    </>
                )
            case 'dataTransfer':
                return (
                    <>
                        <Form.Item name="vendorId" label="Vendor ID" rules={[{ required: true }]}>
                            <Input placeholder="e.g. com.example.vendor" />
                        </Form.Item>
                        <Form.Item name="messageId" label="Message ID">
                            <Input placeholder="Optional Message ID" />
                        </Form.Item>
                        <Form.Item name="data" label="Data">
                            <Input.TextArea placeholder="Optional Data payload" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Send Data Transfer</Button>
                    </>
                )
            case 'reserveNow':
                return (
                    <>
                        <Form.Item name="connectorId" label="Connector" rules={[{ required: true }]}>
                            <Select placeholder="Select Connector">
                                {connectors.map(c => (
                                    <Option key={c.connectorId} value={c.connectorId}>Connector {c.connectorId}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="idTag" label="RFID Tag" rules={[{ required: true }]}>
                            <Select placeholder="Select RFID Tag">
                                {rfidTags.map(t => (
                                    <Option key={t.tagId} value={t.tagId}>{t.tagId}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="expiryDate" label="Expiry Date" rules={[{ required: true }]}>
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="reservationId" label="Reservation ID" rules={[{ required: true }]}>
                            <Input type="number" placeholder="Unique ID" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>Reserve Now</Button>
                    </>
                )
            case 'cancelReservation':
                return (
                    <>
                        <Form.Item name="reservationId" label="Reservation ID" rules={[{ required: true }]}>
                            <Input type="number" placeholder="ID of reservation to cancel" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} danger block>Cancel Reservation</Button>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <Modal
            title={`Remote Actions - ${stationId}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            style={{ top: 20 }}
        >
            <Row gutter={24}>
                {/* Left Side: Actions Form */}
                <Col span={10} style={{ borderRight: '1px solid #f0f0f0' }}>
                    <Form form={form} onFinish={handleAction} layout="vertical">
                        <Form.Item label="Select Action" style={{ marginBottom: 24 }}>
                            <Select
                                placeholder="Choose an action..."
                                onChange={(val) => setSelectedAction(val)}
                                value={selectedAction}
                                size="large"
                            >
                                <Option value="remoteStart">Remote Start Transaction</Option>
                                <Option value="remoteStop">Remote Stop Transaction</Option>
                                <Option value="reset">Reset Station</Option>
                                <Option value="unlock">Unlock Connector</Option>
                                <Option value="changeAvailability">Change Availability</Option>
                                <Option value="clearCache">Clear Cache</Option>
                                <Option value="triggerMessage">Trigger Message</Option>
                                <Option value="dataTransfer">Data Transfer</Option>
                                <Option value="reserveNow">Reserve Now</Option>
                                <Option value="cancelReservation">Cancel Reservation</Option>
                            </Select>
                        </Form.Item>

                        {selectedAction && (
                            <>
                                <Divider />
                                {renderForm()}
                            </>
                        )}
                    </Form>
                </Col>

                {/* Right Side: Live Terminal */}
                <Col span={14}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ margin: 0 }}>Live Terminal</h4>
                        <Tag color="green">Live Polling</Tag>
                    </div>
                    <div style={{
                        backgroundColor: '#1e1e1e',
                        color: '#00ff00',
                        fontFamily: 'monospace',
                        padding: '12px',
                        borderRadius: '4px',
                        height: '500px',
                        overflowY: 'auto',
                        fontSize: '12px'
                    }}>
                        {logs.length === 0 ? (
                            <div style={{ color: '#666', textAlign: 'center', marginTop: '200px' }}>
                                Waiting for OCPP messages...
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} style={{ marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '2px' }}>
                                    <span style={{ color: '#888' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    {' '}
                                    <span style={{ color: log.direction === 'INCOMING' ? '#4facfe' : '#ff0844' }}>
                                        {log.direction === 'INCOMING' ? '<<' : '>>'}
                                    </span>
                                    {' '}
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{log.actionType || log.logType}</span>
                                    {' '}
                                    <span style={{ color: '#aaa' }}>{log.messageId}</span>
                                    <br />
                                    <span style={{ color: '#ccc', marginLeft: '20px', display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {log.request ? JSON.stringify(JSON.parse(log.request), null, 0) : ''}
                                        {log.response ? JSON.stringify(JSON.parse(log.response), null, 0) : ''}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={terminalEndRef} />
                    </div>
                </Col>
            </Row>
        </Modal>
    )
}
