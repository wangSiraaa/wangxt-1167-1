import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  HddOutlined,
  DollarOutlined,
  RedoOutlined,
  PlusOutlined,
  WalletOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  FileProtectOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../store/userStore'

const { Header, Sider, Content } = Layout

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useUser()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台'
    },
    {
      key: '/auction',
      icon: <HddOutlined />,
      label: '拍卖管理',
      children: [
        {
          key: '/auction/item',
          icon: <UnorderedListOutlined />,
          label: '标的物管理'
        },
        {
          key: '/auction/bid',
          icon: <FileProtectOutlined />,
          label: '竞买记录'
        }
      ]
    },
    {
      key: '/deposit',
      icon: <DollarOutlined />,
      label: '保证金管理',
      children: [
        {
          key: '/deposit/list',
          icon: <UnorderedListOutlined />,
          label: '保证金列表'
        },
        {
          key: '/deposit/my',
          icon: <UserOutlined />,
          label: '我的保证金'
        }
      ]
    },
    {
      key: '/refund',
      icon: <RedoOutlined />,
      label: '退款管理',
      children: [
        {
          key: '/refund/apply',
          icon: <UnorderedListOutlined />,
          label: '退款申请'
        }
      ]
    },
    {
      key: '/deduct',
      icon: <PlusOutlined />,
      label: '抵扣管理',
      children: [
        {
          key: '/deduct/list',
          icon: <UnorderedListOutlined />,
          label: '抵扣记录'
        }
      ]
    },
    {
      key: '/fund',
      icon: <WalletOutlined />,
      label: '资金流水',
      children: [
        {
          key: '/fund/flow',
          icon: <UnorderedListOutlined />,
          label: '流水查询'
        }
      ]
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/user',
          icon: <UserOutlined />,
          label: '用户管理'
        },
        {
          key: '/system/role',
          icon: <FileProtectOutlined />,
          label: '角色管理'
        },
        {
          key: '/system/audit',
          icon: <FileProtectOutlined />,
          label: '操作日志'
        }
      ]
    }
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    }
  }

  const handleMenuSelect = ({ key }) => {
    navigate(key)
  }

  const getSelectedKeys = () => {
    const pathname = location.pathname
    const keys = [pathname]
    const parts = pathname.split('/')
    if (parts.length > 2) {
      keys.push('/' + parts[1])
    }
    return keys
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold'
          }}
        >
          {collapsed ? '拍卖' : '司法拍卖系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={['/auction', '/deposit', '/refund', '/deduct', '/fund', '/system']}
          items={menuItems}
          onClick={handleMenuSelect}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              style={{ fontSize: 20, cursor: 'pointer' }}
              onClick={() => setCollapsed(false)}
            />
          ) : (
            <MenuFoldOutlined
              style={{ fontSize: 20, cursor: 'pointer' }}
              onClick={() => setCollapsed(true)}
            />
          )}
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={userInfo?.avatar} />
              <span>{userInfo?.realName || userInfo?.username || '管理员'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
