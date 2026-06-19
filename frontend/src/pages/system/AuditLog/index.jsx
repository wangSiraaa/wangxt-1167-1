import React, { useState, useEffect } from 'react'
import { Table, Form, Card, Input, Select, DatePicker, Button, Space, Tag, message } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const businessTypeOptions = [
  { value: 'user', label: '用户管理' },
  { value: 'role', label: '角色管理' },
  { value: 'permission', label: '权限管理' },
  { value: 'login', label: '登录登出' },
  { value: 'order', label: '订单管理' },
  { value: 'finance', label: '财务管理' }
]

const operationTypeOptions = [
  { value: 'add', label: '新增' },
  { value: 'update', label: '修改' },
  { value: 'delete', label: '删除' },
  { value: 'query', label: '查询' },
  { value: 'export', label: '导出' },
  { value: 'import', label: '导入' }
]

function AuditLog() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  const columns = [
    {
      title: '业务类型',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 120,
      render: (text) => {
        const item = businessTypeOptions.find((opt) => opt.value === text)
        return <Tag color="blue">{item ? item.label : text}</Tag>
      }
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      render: (text) => {
        const item = operationTypeOptions.find((opt) => opt.value === text)
        return <Tag color="green">{item ? item.label : text}</Tag>
      }
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 160,
      render: (text) => text && dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (
        <Tag color={text === 1 ? 'success' : 'error'}>
          {text === 1 ? '成功' : '失败'}
        </Tag>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130
    }
  ]

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/system/audit/list', {
        params: {
          page,
          pageSize,
          ...params
        }
      })
      if (res.code === 200) {
        setDataSource(res.data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: res.data.total || 0
        })
      } else {
        message.error(res.message || '查询失败')
      }
    } catch (error) {
      console.error('查询操作日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = { ...values }
    if (values.dateRange && values.dateRange.length === 2) {
      params.startTime = values.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = values.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      delete params.dateRange
    }
    fetchData(1, pagination.pageSize, params)
  }

  const handleReset = () => {
    form.resetFields()
    fetchData(1, pagination.pageSize)
  }

  const handlePageChange = (page, pageSize) => {
    const values = form.getFieldsValue()
    const params = { ...values }
    if (values.dateRange && values.dateRange.length === 2) {
      params.startTime = values.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = values.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      delete params.dateRange
    }
    fetchData(page, pageSize, params)
  }

  return (
    <div className="page-container">
      <Card className="search-card" variant="outlined">
        <Form form={form} layout="inline">
          <Form.Item name="businessType" label="业务类型">
            <Select placeholder="请选择业务类型" allowClear style={{ width: 160 }}>
              {businessTypeOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="请输入操作人" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="dateRange" label="起止时间">
            <RangePicker showTime style={{ width: 320 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="table-card" variant="outlined" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePageChange
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  )
}

export default AuditLog
