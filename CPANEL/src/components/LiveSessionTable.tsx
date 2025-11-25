import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Button, Space, Tag, Dropdown, Menu, message } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { sessionService, type Session } from '@/services/api'

interface LiveSessionTableProps {
    stationId?: string  // If provided, filter sessions for this station only
}

const LiveSessionTable: React.FC<LiveSessionTableProps> = ({ stationId }) => {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    // Filter states
    const [searchText, setSearchText] = useState('')
    const [stationFilter, setStationFilter] = useState<string>('')
    const [connectorFilter, setConnectorFilter] = useState<string>('')
    const [idTagFilter, setIdTagFilter] = useState<string>('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Live mode
    const [liveMode, setLiveMode] = useState(false)

    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'id', 'chargingStationId', 'connectorId', 'ocppTransactionId',
        'ocppIdTag', 'startTimestamp', 'energyKwh', 'duration'
    ])

    // Calculate duration for active sessions
    const calculateDuration = (startTime?: string) => {
        if (!startTime) return 'N/A'
        const start = new Date(startTime).getTime()
        const now = Date.now()
        const diffMs = now - start
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m`
    }

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        setLoading(true)
        try {
            const params: any = {
                page: currentPage,
                limit: pageSize,
            }

            if (searchText) params.search = searchText
            if (stationId) params.stationId = stationId
            if (stationFilter) params.stationId = stationFilter
            if (connectorFilter) params.connectorId = connectorFilter
            if (idTagFilter) params.idTag = idTagFilter

            const response = await sessionService.getAll(params)

            // Handle both old and new response formats
            if (response && typeof response === 'object' && 'data' in response) {
                setSessions(response.data)
                setTotal(response.total || 0)
            } else if (Array.isArray(response)) {
                setSessions(response)
                setTotal(response.length)
            } else {
                setSessions([])
                setTotal(0)
            }
        } catch (error: any) {
            message.error(`Failed to fetch sessions: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }, [stationId, searchText, stationFilter, connectorFilter, idTagFilter, currentPage, pageSize])

    // Initial load and when filters change
    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    // Live mode auto-refresh
    useEffect(() => {
        if (!liveMode) return

        const interval = setInterval(() => {
            fetchSessions()
        }, 5000) // Refresh every 5 seconds

        return () => clearInterval(interval)
    }, [liveMode, fetchSessions])

    // Export to CSV
    const exportToCSV = () => {
        const headers = visibleColumns.join(',')
        const rows = sessions.map(session => {
            const row: any = {}
            visibleColumns.forEach(col => {
                let value = (session as any)[col]
                if (col === 'duration') {
                    value = calculateDuration(session.startTimestamp)
                } else if (col === 'startTimestamp' && value) {
                    value = new Date(value).toLocaleString()
                }
                row[col] = value ?? ''
            })
            return Object.values(row).join(',')
        })

        const csv = [headers, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `live_sessions_${stationId || 'all'}_${new Date().toISOString()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        message.success('Sessions exported successfully')
    }

    // Column visibility menu
    const columnMenu = (
        <Menu>
            {[
                { key: 'id', label: 'ID' },
                { key: 'chargingStationId', label: 'Station ID' },
                { key: 'connectorId', label: 'Connector ID' },
                { key: 'ocppTransactionId', label: 'Transaction ID' },
                { key: 'ocppIdTag', label: 'ID Tag' },
                { key: 'startTimestamp', label: 'Start Time' },
                { key: 'energyKwh', label: 'Energy (kWh)' },
                { key: 'duration', label: 'Duration' },
            ].map(col => (
                <Menu.Item key={col.key}>
                    <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setVisibleColumns([...visibleColumns, col.key])
                            } else {
                                setVisibleColumns(visibleColumns.filter(c => c !== col.key))
                            }
                        }}
                        style={{ marginRight: 8 }}
                    />
                    {col.label}
                </Menu.Item>
            ))}
        </Menu>
    )

    // Table columns
    const columns: ColumnsType<Session> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            hidden: !visibleColumns.includes('id'),
        },
        {
            title: 'Station ID',
            dataIndex: 'chargingStationId',
            key: 'chargingStationId',
            width: 120,
            hidden: !visibleColumns.includes('chargingStationId'),
        },
        {
            title: 'Connector',
            dataIndex: 'connectorId',
            key: 'connectorId',
            width: 100,
            hidden: !visibleColumns.includes('connectorId'),
        },
        {
            title: 'Transaction ID',
            dataIndex: 'ocppTransactionId',
            key: 'ocppTransactionId',
            width: 140,
            hidden: !visibleColumns.includes('ocppTransactionId'),
            render: (value: any) => value?.toString() || 'N/A',
        },
        {
            title: 'ID Tag',
            dataIndex: 'ocppIdTag',
            key: 'ocppIdTag',
            width: 150,
            hidden: !visibleColumns.includes('ocppIdTag'),
        },
        {
            title: 'Start Time',
            dataIndex: 'startTimestamp',
            key: 'startTimestamp',
            width: 180,
            hidden: !visibleColumns.includes('startTimestamp'),
            render: (date?: string) => date ? new Date(date).toLocaleString() : 'N/A',
        },
        {
            title: 'Energy (kWh)',
            dataIndex: 'energyKwh',
            key: 'energyKwh',
            width: 120,
            hidden: !visibleColumns.includes('energyKwh'),
            render: (value?: number) => value?.toFixed(2) || '0.00',
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 120,
            hidden: !visibleColumns.includes('duration'),
            render: (_, record) => (
                <Tag color="green">{calculateDuration(record.startTimestamp)}</Tag>
            ),
        },
    ]

    return (
        <div style={{ padding: '16px' }}>
            {/* Filters and Controls */}
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space wrap>
                    <Input
                        placeholder="Search sessions (station, ID tag)"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={fetchSessions}
                        style={{ width: 300 }}
                        allowClear
                    />

                    {!stationId && (
                        <Input
                            placeholder="Station ID"
                            value={stationFilter}
                            onChange={(e) => setStationFilter(e.target.value)}
                            onPressEnter={fetchSessions}
                            style={{ width: 120 }}
                            allowClear
                        />
                    )}

                    <Input
                        placeholder="Connector ID"
                        value={connectorFilter}
                        onChange={(e) => setConnectorFilter(e.target.value)}
                        onPressEnter={fetchSessions}
                        style={{ width: 120 }}
                        allowClear
                    />

                    <Input
                        placeholder="ID Tag"
                        value={idTagFilter}
                        onChange={(e) => setIdTagFilter(e.target.value)}
                        onPressEnter={fetchSessions}
                        style={{ width: 150 }}
                        allowClear
                    />

                    <Button onClick={fetchSessions} icon={<ReloadOutlined />}>
                        Refresh
                    </Button>

                    <Button
                        type={liveMode ? 'primary' : 'default'}
                        onClick={() => setLiveMode(!liveMode)}
                        icon={liveMode ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    >
                        {liveMode ? 'Stop Live' : 'Live Mode'}
                    </Button>

                    <Button onClick={exportToCSV} icon={<DownloadOutlined />}>
                        Export CSV
                    </Button>

                    <Dropdown overlay={columnMenu} trigger={['click']}>
                        <Button icon={<SettingOutlined />}>Columns</Button>
                    </Dropdown>
                </Space>
            </Space>

            {/* Table */}
            <Table
                columns={columns.filter(col => !col.hidden)}
                dataSource={sessions}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '25', '50', '100'],
                    onChange: (page, size) => {
                        setCurrentPage(page)
                        setPageSize(size)
                    },
                    showTotal: (total) => `Total ${total} active sessions`,
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '12px' }}>
                            <h4>Session Details:</h4>
                            <p><strong>Start Meter Value:</strong> {record.startMeterValue || 'N/A'}</p>
                            <p><strong>Current Energy:</strong> {record.energyKwh?.toFixed(2) || '0.00'} kWh</p>
                            <p><strong>Status:</strong> <Tag color="green">ACTIVE</Tag></p>
                        </div>
                    ),
                }}
                scroll={{ x: 1200 }}
            />
        </div>
    )
}

export default LiveSessionTable
