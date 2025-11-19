import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ControlOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  WifiOutlined,
  ConsoleSqlOutlined,
  QrcodeOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { MenuProps } from 'antd'

const { Header, Content, Sider } = Layout

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const menuItems: MenuProps['items'] = [
    {
      key: 'live',
      label: 'Live',
      type: 'group',
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/sessions',
          icon: <HistoryOutlined />,
          label: 'Live Sessions',
        },
      ],
    },
    {
      key: 'management',
      label: 'Management',
      type: 'group',
      children: [
        {
          key: '/partners',
          icon: <TeamOutlined />,
          label: 'Partners',
        },
        {
          key: '/locations',
          icon: <EnvironmentOutlined />,
          label: 'Locations',
        },
        {
          key: '/users',
          icon: <UserOutlined />,
          label: 'Users',
        },
      ],
    },
    {
      key: 'network',
      label: 'Network',
      type: 'group',
      children: [
        {
          key: '/rfid',
          icon: <IdcardOutlined />,
          label: 'RFID Cards',
        },
        {
          key: '/ev-drivers',
          icon: <CarOutlined />,
          label: 'EV Drivers',
        },
        {
          key: '/transactions',
          icon: <HistoryOutlined />,
          label: 'Transactions',
        },
        {
          key: '/schedules',
          icon: <ClockCircleOutlined />,
          label: 'Schedules',
        },
        {
          key: '/reservations',
          icon: <CalendarOutlined />,
          label: 'Reservations',
        },
      ],
    },
    {
      key: 'chargers',
      label: 'Chargers',
      type: 'group',
      children: [
        {
          key: '/stations',
          icon: <ThunderboltOutlined />,
          label: 'Charging Stations',
        },
        {
          key: '/downtime',
          icon: <ClockCircleOutlined />,
          label: 'Downtime',
        },
        {
          key: '/maps',
          icon: <EnvironmentOutlined />,
          label: 'Maps',
        },
        {
          key: '/charging-sessions',
          icon: <HistoryOutlined />,
          label: 'Sessions',
        },
        {
          key: '/tariffs',
          icon: <FileTextOutlined />,
          label: 'Tariffs',
        },
      ],
    },
    {
      key: 'tools',
      label: 'Tools and Utilities',
      type: 'group',
      children: [
        {
          key: '/static-data',
          icon: <DatabaseOutlined />,
          label: 'Static Data',
        },
        {
          key: '/connections',
          icon: <WifiOutlined />,
          label: 'Connections',
        },
        {
          key: '/server-logs',
          icon: <ConsoleSqlOutlined />,
          label: 'Server Logs',
        },
        {
          key: '/qr-generator',
          icon: <QrcodeOutlined />,
          label: 'QR Generator',
        },
      ],
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          REVON CMS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || 'Admin'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: 8,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}