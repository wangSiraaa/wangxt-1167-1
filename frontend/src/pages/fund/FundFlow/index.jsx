import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message, Tabs, Timeline, Card, Descriptions, Statistic, Row, Col, Empty } from 'antd'
import { ReloadOutlined, FundOutlined, SwapOutlined, WalletOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'

const { Option } = Select

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

const NODE_TYPE_ICON = {
  deposit_pay: <WalletOutlined style={{ fontSize: 18 }} />,
  auction_bid: <SwapOutlined style={{ fontSize: 18 }} />,
  auction_deal: <CheckCircleOutlined style={{ fontSize: 18 }} />,
  auction_lost: <CloseCircleOutlined style={{ fontSize: 18 }} />,
  tail_payment: <FundOutlined style={{ fontSize: 18 }} />,
  pending_deduct: <ClockCircleOutlined style={{ fontSize: 18 }} />,
  deposit_deduct: <ExclamationCircleOutlined style={{ fontSize: 18 }} />,
  deposit_refund: <WalletOutlined style={{ fontSize: 18 }} />
}

const NODE_STATUS_COLOR = {
  paid: 'green',
  won: 'green',
  lost: 'default',
  success: 'green',
  refunded: 'green',
  completed: 'green',
  deducted: 'purple',
  pending_deduct: 'blue',
  refunding: 'blue',
  pending: 'blue',
  processing: 'blue',
  failed: 'red',
  rejected: 'orange',
  unpaid: 'default',
  norefund: 'default',
  nodeduct: 'default'
}

const PAY_TYPE_MAP = {
  ALIPAY: '支付宝',
  WECHAT: '微信',
  BANK: '银行转账',
  BALANCE: '余额',
  OTHER: '其他'
}

const BID_STATUS_TEXT = {
  bidding: '竞买中',
  won: '已竞得',
  lost: '未竞得'
}

const REFUND_STATUS_TEXT = {
  norefund: '未退款',
  refunding: '退款中',
  refunded: '已退款',
  refund_failed: '退款失败'
}

const DEDUCT_STATUS_TEXT = {
  nodeduct: '未抵扣',
  pending_deduct: '待抵扣',
  deducted: '已抵扣',
  partial_deducted: '部分抵扣'
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
  const [activeTab, setActiveTab] = useState('list')
  const [chainLoading, setChainLoading] = useState(false)
  const [chainData, setChainData] = useState(null)
  const [chainList, setChainList] = useState([])
  const [searchDepositNo, setSearchDepositNo] = useState('')
  const [searchItemId, setSearchItemId] = useState('')

  useEffect(() => {
    if (activeTab === 'list') {
      loadData()
    }
  }, [activeTab])

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

  const loadChainByDeposit = async (depositId) => {
    setChainLoading(true)
    try {
      const res = await request.get(api.fundChain, { params: { depositId } })
      setChainData(res.data)
      setChainList([])
    } catch (e) {
      console.error('加载资金链失败', e)
      message.error('加载资金链失败')
    } finally {
      setChainLoading(false)
    }
  }

  const loadChainByItem = async (itemId) => {
    setChainLoading(true)
    try {
      const res = await request.get(api.fundChainByItem, { params: { itemId } })
      setChainList(res.data || [])
      setChainData(null)
    } catch (e) {
      console.error('加载资金链失败', e)
      message.error('加载资金链失败')
    } finally {
      setChainLoading(false)
    }
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        params[key] = values[key]
      }
    })
    loadData(1, pagination.pageSize, params)
  }

  const handleReset = () => {
    form.resetFields()
    loadData(1, pagination.pageSize)
  }

  const handleChainSearch = () => {
    if (!searchDepositNo && !searchItemId) {
      message.warning('请输入保证金编号或标的ID')
      return
    }
    if (searchDepositNo) {
      loadChainByDeposit(searchDepositNo)
    } else if (searchItemId) {
      loadChainByItem(searchItemId)
    }
  }

  const handleChainReset = () => {
    setSearchDepositNo('')
    setSearchItemId('')
    setChainData(null)
    setChainList([])
  }

  const handleTableChange = (pag) => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        params[key] = values[key]
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

  const getNodeColor = (status) => {
    if (!status) return 'blue'
    return NODE_STATUS_COLOR[status.toLowerCase()] || 'blue'
  }

  const renderChainTimeline = (chain) => {
    if (!chain || !chain.chainNodes || chain.chainNodes.length === 0) {
      return <Empty description="暂无资金链数据" />
    }
    return (
      <Timeline
        mode="left"
        items={chain.chainNodes.map((node, index) => ({
          color: getNodeColor(node.nodeStatus),
          dot: NODE_TYPE_ICON[node.nodeType] || <ClockCircleOutlined />,
          label: (
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 500 }}>{formatDateTime(node.operateTime)}</div>
              {node.orderNo && <div style={{ color: '#999', fontSize: 12 }}>编号：{node.orderNo}</div>}
            </div>
          ),
          children: (
            <Card size="small" style={{ marginBottom: 8 }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space>
                  <Tag color={getNodeColor(node.nodeStatus)}>{node.nodeName}</Tag>
                  {node.nodeStatus && <Tag color="default">状态：{node.nodeStatus}</Tag>}
                </Space>
                {node.amount !== undefined && node.amount !== null && (
                  <div>
                    <span style={{ color: '#666' }}>金额：</span>
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>¥{formatMoney(node.amount)}</span>
                  </div>
                )}
                {node.operator && (
                  <div style={{ color: '#666' }}>操作人：{node.operator}</div>
                )}
                {node.remark && (
                  <div style={{ color: '#999', fontSize: 13 }}>{node.remark}</div>
                )}
              </Space>
            </Card>
          )
        }))}
      />
    )
  }

  const renderChainHeader = (chain) => {
    if (!chain) return null
    return (
      <Card style={{ marginBottom: 16 }}>
        <Descriptions title="资金链概览" column={3} size="small" bordered>
          <Descriptions.Item label="保证金编号">{chain.depositNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="标的名称">{chain.itemName || '-'}</Descriptions.Item>
          <Descriptions.Item label="竞买人">{chain.bidderName || '-'}</Descriptions.Item>
          <Descriptions.Item label="保证金金额">
            <span style={{ color: '#1890ff', fontWeight: 600 }}>¥{formatMoney(chain.depositAmount)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="竞买状态">
            <Tag color="blue">{BID_STATUS_TEXT[chain.bidStatus] || chain.bidStatus}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="退款状态">
            <Tag color="orange">{REFUND_STATUS_TEXT[chain.refundStatus] || chain.refundStatus}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="抵扣状态" span={3}>
            <Tag color="purple">{DEDUCT_STATUS_TEXT[chain.deductStatus] || chain.deductStatus}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
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
      <h2 style={{ marginTop: 0 }}>资金管理</h2>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '流水列表',
            children: (
              <>
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
              </>
            )
          },
          {
            key: 'chain',
            label: '资金链视图',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="输入保证金ID查询"
                    value={searchDepositNo}
                    onChange={(e) => setSearchDepositNo(e.target.value)}
                    style={{ width: 220 }}
                    allowClear
                  />
                  <span style={{ color: '#999' }}>或</span>
                  <Input
                    placeholder="输入标的ID查询多人资金链"
                    value={searchItemId}
                    onChange={(e) => setSearchItemId(e.target.value)}
                    style={{ width: 240 }}
                    allowClear
                  />
                  <Button type="primary" onClick={handleChainSearch}>查询资金链</Button>
                  <Button onClick={handleChainReset} icon={<ReloadOutlined />}>重置</Button>
                </Space>

                {chainLoading && <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>}

                {!chainLoading && chainData && (
                  <>
                    {renderChainHeader(chainData)}
                    {renderChainTimeline(chainData)}
                  </>
                )}

                {!chainLoading && chainList && chainList.length > 0 && (
                  <div>
                    <Card title={`标的共有 ${chainList.length} 条保证金资金链`} style={{ marginBottom: 16 }}>
                      <Row gutter={[16, 16]}>
                        {chainList.map((chain) => (
                          <Col span={24} key={chain.depositId}>
                            {renderChainHeader(chain)}
                            {renderChainTimeline(chain)}
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </div>
                )}

                {!chainLoading && !chainData && (!chainList || chainList.length === 0) && (
                  <Empty description="请输入保证金ID或标的ID查询资金链" style={{ marginTop: 80 }} />
                )}
              </>
            )
          }
        ]}
      />
    </div>
  )
}

export default FundFlow
