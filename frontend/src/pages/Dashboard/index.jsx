import React, { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col, Button, List, Tag, Avatar, Empty } from 'antd'
import {
  AppstoreOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  FileSearchOutlined,
  AuditOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import request from '../../utils/request'
import dayjs from 'dayjs'

const quickActions = [
  { title: '用户管理', icon: <UserOutlined />, path: '/system/user', color: '#1890ff' },
  { title: '角色管理', icon: <SafetyOutlined />, path: '/system/role', color: '#52c41a' },
  { title: '操作日志', icon: <AuditOutlined />, path: '/system/audit', color: '#faad14' },
  { title: '系统设置', icon: <SettingOutlined />, path: '/system/setting', color: '#722ed1' }
]

function Dashboard() {
  const [stats, setStats] = useState({
    subjectCount: 0,
    depositTotal: 0,
    refundCount: 0,
    pendingCount: 0
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await request.get('/dashboard/stats')
      if (res.code === 200) {
        setStats(res.data || {})
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const fetchRecentLogs = async () => {
    setLoading(true)
    try {
      const res = await request.get('/system/audit/list', {
        params: { page: 1, pageSize: 5 }
      })
      if (res.code === 200) {
        setRecentLogs(res.data.list || [])
      }
    } catch (error) {
      console.error('获取最近操作记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRecentLogs()
  }, [])

  const formatMoney = (value) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(2)} 万`
    }
    return value.toLocaleString()
  }

  const handleQuickAction = (path) => {
    window.location.href = path
  }

  return (
    <div className="dashboard-container">
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>工作台</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card className="stat-card" style={{ borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title="标的数量"
              value={stats.subjectCount}
              prefix={<FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title="保证金总额"
              value={stats.depositTotal}
              precision={2}
              prefix="¥"
              formatter={formatMoney}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderLeft: '4px solid #faad14' }}>
            <Statistic
              title="退款笔数"
              value={stats.refundCount}
              prefix={<DollarOutlined style={{ color: '#faad14', fontSize: 20 }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" style={{ borderLeft: '4px solid #f5222d' }}>
            <Statistic
              title="待审核"
              value={stats.pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#f5222d', fontSize: 20 }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="快捷操作" className="dashboard-card">
            <Row gutter={[16, 16]}>
              {quickActions.map((item, index) => (
                <Col span={6} key={index}>
                  <div
                    className="quick-action-item"
                    onClick={() => handleQuickAction(item.path)}
                    style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      cursor: 'pointer',
                      borderRadius: 8,
                      background: '#fafafa',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div
                      className="quick-action-icon"
                      style={{
                        fontSize: 32,
                        color: item.color,
                        marginBottom: 8
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="quick-action-title">{item.title}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近操作记录" className="dashboard-card">
            <List
              loading={loading}
              dataSource={recentLogs}
              locale={{ emptyText: <Empty description="暂无操作记录" /> }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileSearchOutlined />} />}
                    title={
                      <span>
                      {item.description || '系统操作'}
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {item.businessType}
                        </Tag>
                      </span>
                    }
                    description={
                      <span>
                      操作人：{item.operator || '系统'}
                      <span style={{ marginLeft: 16 }}>
                        {item.operationTime ? dayjs(item.operationTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                      </span>
                    </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
