import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message, DatePicker } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'

const { Option } = Select
const { RangePicker } = DatePicker

const FLOW_TYPE_OPTIONS = [
  { value: 'DEPOSIT', label: '保证金缴纳' },
  { value: 'REFUND', label: '保证金退款' },
  { value: 'DEDUCT', label: '保证金抵扣' },
  { value: 'PAYMENT', label: '付款' },
  { value: 'RECEIVE', label: '收款' },
  { value: 'OTHER', label: '其他' }
]

const FUND_DIRECTION_OPTIONS = [
  { value: 'IN', label: '收入' },
  { value: 'OUT', label: '支出' }
]

const FLOW_STATUS_OPTIONS = [
  { value: 'PENDING', label: '处理中' },
  { value: 'SUCCESS', label: '成功' },
  { value: 'FAILED', label: '失败' }
]

const FLOW_TYPE_MAP = {
  DEPOSIT: { text: '保证金缴纳', color: 'blue' },
  REFUND: { text: '保证金退款', color: 'orange' },
  DEDUCT: { text: '保证金抵扣', color: 'purple' },
  PAYMENT: { text: '付款', color: 'red' },
  RECEIVE: { text: '收款', color: 'green' },
  OTHER: { text: '其他', color: 'default' }
}

const FUND_DIRECTION_MAP = {
  IN: { text: '收入', color: 'green' },
  OUT: { text: '支出', color: 'red' }
}

const FLOW_STATUS_MAP = {
  PENDING: { text: '处理中', color: 'blue' },
  SUCCESS: { text: '成功', color: 'green' },
  FAILED: { text: '失败', color: 'red' }
}

const PAY_TYPE_MAP = {
  ALIPAY: '支付宝',
  WECHAT: '微信',
  BANK: '银行转账',
  BALANCE: '余额',
  OTHER: '其他'
}

function FundFlow() {
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get(api.fundFlowList, {
        params: {
          current: page,
          size: pageSize,
          ...params
        }
      })
      const data = res.data
      setDataSource(data?.records || data?.list || [])
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data?.total || 0
      })
    } catch (e) {
      console.error('加载资金流水失败', e)
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        if (key === 'dateRange' && values[key] && values[key].length === 2) {
          params.startTime = values[key][0].format('YYYY-MM-DD HH:mm:ss')
          params.endTime = values[key][1].format('YYYY-MM-DD HH:mm:ss')
        } else {
          params[key] = values[key]
        }
      }
    })
    loadData(1, pagination.pageSize, params)
  }

  const handleReset = () => {
    form.resetFields()
    loadData(1, pagination.pageSize)
  }

  const handleTableChange = (pag) => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        if (key === 'dateRange' && values[key] && values[key].length === 2) {
          params.startTime = values[key][0].format('YYYY-MM-DD HH:mm:ss')
          params.endTime = values[key][1].format('YYYY-MM-DD HH:mm:ss')
        } else {
          params[key] = values[key]
        }
      }
    })
    loadData(pag.current, pag.pageSize, params)
  }

  const getTypeTag = (type) => {
    const info = FLOW_TYPE_MAP[type]
    if (!info) return <Tag>{type}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getDirectionTag = (direction) => {
    const info = FUND_DIRECTION_MAP[direction]
    if (!info) return <Tag>{direction}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getStatusTag = (status) => {
    const info = FLOW_STATUS_MAP[status]
    if (!info) return <Tag>{status}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const renderAmount = (amount, direction) => {
    const isIncome = direction === 'IN'
    return (
      <span style={{ color: isIncome ? '#52c41a' : '#f5222d', fontWeight: 500 }}>
        {isIncome ? '+' : '-'}¥{formatMoney(amount)}
      </span>
    )
  }

  const columns = [
    {
      title: '流水编号',
      dataIndex: 'flowNo',
      key: 'flowNo',
      width: 180,
      fixed: 'left'
    },
    {
      title: '流水类型',
      dataIndex: 'flowType',
      key: 'flowType',
      width: 120,
      render: (val) => getTypeTag(val)
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (val, record) => renderAmount(val, record.direction)
    },
    {
      title: '资金方向',
      dataIndex: 'direction',
      key: 'direction',
      width: 80,
      render: (val) => getDirectionTag(val)
    },
    {
      title: '关联业务',
      dataIndex: 'relateType',
      key: 'relateType',
      width: 120
    },
    {
      title: '关联编号',
      dataIndex: 'relateId',
      key: 'relateId',
      width: 160
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 100
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      key: 'payType',
      width: 100,
      render: (val) => PAY_TYPE_MAP[val] || val || '-'
    },
    {
      title: '流水状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (val) => getStatusTag(val)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (val) => formatDateTime(val)
    }
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>资金流水</h2>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="flowNo" label="流水编号">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="flowType" label="流水类型">
          <Select placeholder="请选择" style={{ width: 130 }} allowClear>
            {FLOW_TYPE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="direction" label="资金方向">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            {FUND_DIRECTION_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="userName" label="用户">
          <Input placeholder="请输入" style={{ width: 120 }} allowClear />
        </Form.Item>
        <Form.Item name="dateRange" label="起止时间">
          <RangePicker showTime showSecond={false} style={{ width: 260 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>查询</Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        onChange={handleTableChange}
      />
    </div>
  )
}

export default FundFlow
