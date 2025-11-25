import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Select, Button, Space, Tag, Dropdown, Menu, message } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ocppLogService, OcppMessageLog } from '@/services/api'

const { Option } = Select

interface ServerLogTableProps {
    stationId?: string  // If provided, filter logs for this station only
}

const ServerLogTable: React.FC<ServerLogTableProps> = ({ stationId }) => {
    const [logs, setLogs] = useState<OcppMessageLog[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)

    // Filter states
    const [searchText, setSearchText] = useState('')
    const [directionFilter, setDirectionFilter] = useState<string | undefined>()
    const [logTypeFilter, setLogTypeFilter] = useState<string | undefined>()
    const [actionTypeFilter, setActionTypeFilter] = useState<string | undefined>()

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Live mode
    const [liveMode, setLiveMode] = useState(false)

    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        'id', 'chargingStationId', 'direction', 'logType', 'actionType',
        'messageId', 'timestamp'
    ])

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const filters = {
                search: searchText || undefined,
                direction: directionFilter as any,
                logType: logTypeFilter as any,
                actionType: actionTypeFilter || undefined,
                page: currentPage,
                limit: pageSize,
            }

            const response = stationId
                ? await ocppLogService.getByStation(stationId, filters)
                : await ocppLogService.getAll(filters)

            setLogs(response.data)
            setTotal(response.total)
        } catch (error: any) {
            message.error(`Failed to fetch logs: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }, [stationId, searchText, directionFilter, logTypeFilter, actionTypeFilter, currentPage, pageSize])

    // Initial load and when filters change
    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Live mode auto-refresh
    useEffect(() => {
        if (!liveMode) return

        const interval = setInterval(() => {
            fetchLogs()
        }, 5000) // Refresh every 5 seconds

        return () => clearInterval(interval)
    }, [liveMode, fetchLogs])

    // Export to CSV
    const exportToCSV = () => {
        const headers = visibleColumns.join(',')
        const rows = logs.map(log => {
            const row: any = {}
            visibleColumns.forEach(col => {
                let value = (log as any)[col]
                if (col === 'chargingStationId' && log.chargingStation) {
                    value = log.chargingStation.ocppIdentifier
                }
                // Escape JSON strings for CSV
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                    value = `"${value.replace(/"/g, '""')}"`
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
        a.download = `ocpp_logs_${stationId || 'all'}_${new Date().toISOString()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        message.success('Logs exported successfully')
    }

    // Column visibility menu
    const columnMenu = (
        <Menu>
            {[
                { key: 'id', label: 'Serial No.' },
                { key: 'chargingStationId', label: 'Station ID' },
                { key: 'direction', label: 'Direction' },
                { key: 'logType', label: 'Log Type' },
                { key: 'actionType', label: 'Action Type' },
                { key: 'messageId', label: 'Message ID' },
                { key: 'timestamp', label: 'Timestamp' },
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
    const columns: ColumnsType<OcppMessageLog> = [
        {
            title: 'Serial No.',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            hidden: !visibleColumns.includes('id'),
        },
        {
            title: 'Station ID',
            dataIndex: 'chargingStationId',
            key: 'chargingStationId',
            width: 150,
            hidden: !visibleColumns.includes('chargingStationId'),
            render: (_, record) => record.chargingStation?.ocppIdentifier || record.chargingStationId,
        },
        {
            title: 'Direction',
            dataIndex: 'direction',
            key: 'direction',
            width: 120,
            hidden: !visibleColumns.includes('direction'),
            render: (direction: string) => (
                <Tag color={direction === 'INCOMING' ? 'blue' : 'green'}>
                    {direction}
                </Tag>
            ),
        },
        {
            title: 'Log Type',
            dataIndex: 'logType',
            key: 'logType',
            width: 130,
            hidden: !visibleColumns.includes('logType'),
            render: (type: string) => (
                <Tag color={type === 'CALL' ? 'purple' : type === 'CALL_RESULT' ? 'cyan' : 'red'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Action Type',
            dataIndex: 'actionType',
            key: 'actionType',
            width: 180,
            hidden: !visibleColumns.includes('actionType'),
        },
        {
            title: 'Message ID',
            dataIndex: 'messageId',
            key: 'messageId',
            width: 200,
            hidden: !visibleColumns.includes('messageId'),
            ellipsis: true,
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            hidden: !visibleColumns.includes('timestamp'),
            render: (timestamp: string) => new Date(timestamp).toLocaleString(),
        },
    ]

    return (
        <div style={{ padding: '16px' }}>
            {/* Filters and Controls */}
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space wrap>
                    <Input
                        placeholder="Search logs (regex/substring)"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={fetchLogs}
                        style={{ width: 300 }}
                        allowClear
                    />

                    <Select
                        placeholder="Direction"
                        value={directionFilter}
                        onChange={setDirectionFilter}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="INCOMING">INCOMING</Option>
                        <Option value="OUTGOING">OUTGOING</Option>
                    </Select>

                    <Select
                        placeholder="Log Type"
                        value={logTypeFilter}
                        onChange={setLogTypeFilter}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="CALL">CALL</Option>
                        <Option value="CALL_RESULT">CALL_RESULT</Option>
                        <Option value="CALL_ERROR">CALL_ERROR</Option>
                    </Select>

                    <Input
                        placeholder="Action Type"
                        value={actionTypeFilter}
                        onChange={(e) => setActionTypeFilter(e.target.value)}
                        onPressEnter={fetchLogs}
                        style={{ width: 150 }}
                        allowClear
                    />

                    <Button onClick={fetchLogs} icon={<ReloadOutlined />}>
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
                dataSource={logs}
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
                    showTotal: (total) => `Total ${total} logs`,
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '12px' }}>
                            <h4>Request:</h4>
                            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                                {record.request ? JSON.stringify(JSON.parse(record.request), null, 2) : 'N/A'}
                            </pre>
                            <h4>Response:</h4>
                            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                                {record.response ? JSON.stringify(JSON.parse(record.response), null, 2) : 'N/A'}
                            </pre>
                        </div>
                    ),
                    rowExpandable: (record) => record.request !== null || record.response !== null,
                }}
                scroll={{ x: 1200 }}
            />
        </div>
    )
}

export default ServerLogTable
