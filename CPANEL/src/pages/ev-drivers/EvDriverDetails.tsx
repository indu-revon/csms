import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Card,
    Descriptions,
    Tabs,
    Button,
    Space,
    Typography,
    message,
    Spin,
    Modal,
    Form,
    Input,
    InputNumber,
    Table,
    Tag,
    Empty,
} from 'antd'
import {
    ArrowLeftOutlined,
    EditOutlined,
    DollarOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { driverService, type Driver } from '../../services/api'

const { Title, Text } = Typography

export default function EvDriverDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('info')
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [walletModalVisible, setWalletModalVisible] = useState(false)
    const [walletAction, setWalletAction] = useState<'topup' | 'deduct' | 'freeze' | 'unfreeze'>('topup')
    const [form] = Form.useForm()
    const [walletForm] = Form.useForm()

    // Fetch driver details
    const { data: driver, isLoading, error } = useQuery({
        queryKey: ['driver', id],
        queryFn: () => driverService.getById(Number(id)),
        enabled: !!id,
    })

    // Fetch transactions
    const { data: transactions } = useQuery({
        queryKey: ['driver-transactions', id],
        queryFn: () => driverService.getTransactions(Number(id)),
        enabled: !!id && activeTab === 'transactions',
    })

    // Fetch reservations
    const { data: reservations } = useQuery({
        queryKey: ['driver-reservations', id],
        queryFn: () => driverService.getReservations(Number(id)),
        enabled: !!id && activeTab === 'reservations',
    })

    // Update driver mutation
    const updateMutation = useMutation({
        mutationFn: (data: { name?: string; email?: string; phone?: string; virtualRfidTag?: string }) =>
            driverService.update(Number(id), data),
        onSuccess: () => {
            message.success('Driver updated successfully')
            queryClient.invalidateQueries({ queryKey: ['driver', id] })
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
            setEditModalVisible(false)
            form.resetFields()
        },
        onError: () => {
            message.error('Failed to update driver')
        },
    })

    // Block/Unblock driver mutation
    const blockMutation = useMutation({
        mutationFn: (block: boolean) =>
            block ? driverService.blockDriver(Number(id)) : driverService.unblockDriver(Number(id)),
        onSuccess: (_, block) => {
            message.success(`Driver ${block ? 'blocked' : 'unblocked'} successfully`)
            queryClient.invalidateQueries({ queryKey: ['driver', id] })
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
        },
        onError: () => {
            message.error('Failed to update driver status')
        },
    })

    // Wallet mutations
    const walletMutation = useMutation({
        mutationFn: async ({ action, amount }: { action: string; amount: number }) => {
            switch (action) {
                case 'topup':
                    return driverService.topUpWallet(Number(id), amount)
                case 'deduct':
                    return driverService.deductWallet(Number(id), amount)
                case 'freeze':
                    return driverService.freezeBalance(Number(id), amount)
                case 'unfreeze':
                    return driverService.unfreezeBalance(Number(id), amount)
                default:
                    throw new Error('Invalid action')
            }
        },
        onSuccess: () => {
            message.success('Wallet updated successfully')
            queryClient.invalidateQueries({ queryKey: ['driver', id] })
            setWalletModalVisible(false)
            walletForm.resetFields()
        },
        onError: (error: any) => {
            message.error(error.message || 'Failed to update wallet')
        },
    })

    const handleEdit = () => {
        form.setFieldsValue({
            name: driver?.name,
            email: driver?.email,
            phone: driver?.phone,
            virtualRfidTag: driver?.virtualRfidTag,
        })
        setEditModalVisible(true)
    }

    const handleBlockUnblock = () => {
        const isBlocked = driver?.status === 'Blocked'
        Modal.confirm({
            title: isBlocked ? 'Unblock Driver' : 'Block Driver',
            icon: <ExclamationCircleOutlined />,
            content: isBlocked
                ? 'Are you sure you want to unblock this driver? They will be able to use charging stations again.'
                : 'Are you sure you want to block this driver? They will not be able to use charging stations.',
            okText: isBlocked ? 'Unblock' : 'Block',
            okType: isBlocked ? 'primary' : 'danger',
            cancelText: 'Cancel',
            onOk: () => {
                blockMutation.mutate(!isBlocked)
            },
        })
    }

    const handleEditSubmit = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate(values)
        })
    }

    const handleWalletAction = (action: 'topup' | 'deduct' | 'freeze' | 'unfreeze') => {
        setWalletAction(action)
        setWalletModalVisible(true)
    }

    const handleWalletSubmit = () => {
        walletForm.validateFields().then((values) => {
            walletMutation.mutate({ action: walletAction, amount: values.amount })
        })
    }

    const transactionColumns: ColumnsType<any> = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag>{type}</Tag>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount?.toFixed(2) || '0.00'}`,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString(),
        },
    ]

    const reservationColumns: ColumnsType<any> = [
        {
            title: 'Reservation ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Station',
            dataIndex: 'stationName',
            key: 'stationName',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
        },
    ]

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
            </div>
        )
    }

    if (error || !driver) {
        return (
            <div style={{ padding: '24px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/ev-drivers')}>
                    Back to Drivers
                </Button>
                <Empty description="Driver not found" style={{ marginTop: '50px' }} />
            </div>
        )
    }

    const tabItems = [
        {
            key: 'info',
            label: 'Member Info',
            children: (
                <Card
                    title="Driver Information"
                    extra={
                        <Space>
                            <Button icon={<EditOutlined />} onClick={handleEdit}>
                                Edit
                            </Button>
                            <Button
                                danger={driver.status === 'Active'}
                                type={driver.status === 'Blocked' ? 'primary' : 'default'}
                                icon={driver.status === 'Blocked' ? <CheckCircleOutlined /> : <StopOutlined />}
                                onClick={handleBlockUnblock}
                                loading={blockMutation.isPending}
                            >
                                {driver.status === 'Blocked' ? 'Unblock' : 'Block'} Driver
                            </Button>
                        </Space>
                    }
                >
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Name">{driver.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{driver.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{driver.phone || 'Not provided'}</Descriptions.Item>
                        <Descriptions.Item label="Virtual RFID Tag">{driver.virtualRfidTag || 'Not assigned'}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={driver.status === 'Active' ? 'green' : 'red'}>{driver.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Member Since">
                            {new Date(driver.createdAt).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Updated" span={2}>
                            {new Date(driver.updatedAt).toLocaleDateString()}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            ),
        },
        {
            key: 'wallet',
            label: 'Wallet',
            children: (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Card>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Text type="secondary">Available Balance</Text>
                                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                                    ${driver.balance.toFixed(2)}
                                </Title>
                            </div>
                            <div>
                                <Text type="secondary">Hold Balance</Text>
                                <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                                    ${driver.holdBalance.toFixed(2)}
                                </Title>
                            </div>
                        </Space>
                    </Card>

                    <Card title="Wallet Actions">
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<DollarOutlined />}
                                onClick={() => handleWalletAction('topup')}
                            >
                                Top Up
                            </Button>
                            <Button
                                danger
                                icon={<DollarOutlined />}
                                onClick={() => handleWalletAction('deduct')}
                            >
                                Deduct
                            </Button>
                            <Button onClick={() => handleWalletAction('freeze')}>
                                Freeze Balance
                            </Button>
                            <Button onClick={() => handleWalletAction('unfreeze')}>
                                Unfreeze Balance
                            </Button>
                        </Space>
                    </Card>
                </Space>
            ),
        },
        {
            key: 'transactions',
            label: 'Transactions',
            children: (
                <Card>
                    {!transactions || transactions.length === 0 ? (
                        <Empty description="No transactions yet" />
                    ) : (
                        <Table
                            columns={transactionColumns}
                            dataSource={transactions}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </Card>
            ),
        },
        {
            key: 'reservations',
            label: 'Reservations',
            children: (
                <Card>
                    {!reservations || reservations.length === 0 ? (
                        <Empty description="No reservations yet" />
                    ) : (
                        <Table
                            columns={reservationColumns}
                            dataSource={reservations}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </Card>
            ),
        },
    ]

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/ev-drivers')}>
                            Back to Drivers
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>
                            {driver.name}
                        </Title>
                    </Space>
                </div>

                {/* Header Card */}
                <Card>
                    <Descriptions column={4}>
                        <Descriptions.Item label="Email">{driver.email}</Descriptions.Item>
                        <Descriptions.Item label="Balance">
                            <Tag color="green">${driver.balance.toFixed(2)}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Hold Balance">
                            <Tag color="orange">${driver.holdBalance.toFixed(2)}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Member Since">
                            {new Date(driver.createdAt).toLocaleDateString()}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Space>

            {/* Edit Modal */}
            <Modal
                title="Edit Driver"
                open={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setEditModalVisible(false)
                    form.resetFields()
                }}
                confirmLoading={updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter driver name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                    >
                        <Input placeholder="Optional" />
                    </Form.Item>
                    <Form.Item
                        name="virtualRfidTag"
                        label="Virtual RFID Tag"
                    >
                        <Input placeholder="Optional" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Wallet Action Modal */}
            <Modal
                title={`${walletAction.charAt(0).toUpperCase() + walletAction.slice(1)} Wallet`}
                open={walletModalVisible}
                onOk={handleWalletSubmit}
                onCancel={() => {
                    setWalletModalVisible(false)
                    walletForm.resetFields()
                }}
                confirmLoading={walletMutation.isPending}
            >
                <Form form={walletForm} layout="vertical">
                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[
                            { required: true, message: 'Please enter amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            prefix="$"
                            precision={2}
                            min={0.01}
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
