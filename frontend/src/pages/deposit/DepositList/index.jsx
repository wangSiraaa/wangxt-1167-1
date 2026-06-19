import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message, Modal, InputNumber, Tooltip } from 'antd'
import { PlusOutlined, ReloadOutlined, EyeOutlined, BankOutlined, DollarOutlined, AuditOutlined, WarningOutlined, LockOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'
import DetailModal from './DetailModal'
import PayModal from './PayModal'
import BankAccountModal from './BankAccountModal'

const { Option } = Select

const PAY_STATUS_OPTIONS = [
  { value: 'UNPAID', label: '未缴纳' },
  { value: 'PAID', label: '已缴纳' },
  { value: 'PARTIAL', label: '部分缴纳' }
]

const BID_STATUS_OPTIONS = [
  { value: 'NOT_BID', label: '未竞买' },
  { value: 'BIDDING', label: '竞买中' },
  { value: 'WON', label: '已竞得' },
  { value: 'LOST', label: '未竞得' }
]

const REFUND_STATUS_OPTIONS = [
  { value: 'NOT_REFUND', label: '未退款' },
  { value: 'REFUNDING', label: '退款中' },
  { value: 'REFUNDED', label: '已退款' },
  { value: 'REFUND_FAILED', label: '退款失败' }
]

const DEDUCT_STATUS_OPTIONS = [
  { value: 'nodeduct', label: '未抵扣' },
  { value: 'pending_deduct', label: '待抵扣' },
  { value: 'deducted', label: '已抵扣' },
  { value: 'partial_deducted', label: '部分抵扣' }
]

const normalizeStatus = (status) => {
  if (!status) return ''
  const s = String(status).toUpperCase()
  if (s === 'NODEDUCT') return 'NOT_DEDUCT'
  if (s === 'PENDING_DEDUCT') return 'PENDING_DEDUCT'
  if (s === 'DEDUCTED') return 'DEDUCTED'
  if (s === 'PARTIAL_DEDUCTED') return 'PARTIAL_DEDUCT'
  return s
}

const PAY_STATUS_MAP = {
  UNPAID: { text: '未缴纳', color: 'default' },
  PAID: { text: '已缴纳', color: 'green' },
  PARTIAL: { text: '部分缴纳', color: 'orange' }
}

const BID_STATUS_MAP = {
  NOT_BID: { text: '未竞买', color: 'default' },
  BIDDING: { text: '竞买中', color: 'blue' },
  WON: { text: '已竞得', color: 'green' },
  LOST: { text: '未竞得', color: 'orange' }
}

const REFUND_STATUS_MAP = {
  NOT_REFUND: { text: '未退款', color: 'default' },
  REFUNDING: { text: '退款中', color: 'blue' },
  REFUNDED: { text: '已退款', color: 'green' },
  REFUND_FAILED: { text: '退款失败', color: 'red' },
  PROCESSING: { text: '处理中', color: 'blue' },
  PENDING: { text: '待审核', color: 'orange' },
  COMPLETED: { text: '已完成', color: 'green' },
  FAILED: { text: '失败', color: 'red' }
}

const DEDUCT_STATUS_MAP = {
  NOT_DEDUCT: { text: '未抵扣', color: 'default' },
  PENDING_DEDUCT: { text: '待抵扣', color: 'orange' },
  DEDUCTED: { text: '已抵扣', color: 'green' },
  PARTIAL_DEDUCT: { text: '部分抵扣', color: 'blue' }
}

function DepositList() {
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const [detailVisible, setDetailVisible] = useState(false)
  const [payVisible, setPayVisible] = useState(false)
  const [bankAccountVisible, setBankAccountVisible] = useState(false)
  const [currentDepositId, setCurrentDepositId] = useState(null)
  const [currentDeposit, setCurrentDeposit] = useState(null)

  const [refundModalVisible, setRefundModalVisible] = useState(false)
  const [refundForm] = Form.useForm()
  const [deductModalVisible, setDeductModalVisible] = useState(false)
  const [deductForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get(api.depositList, {
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
      console.error('加载保证金列表失败', e)
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
        params[key] = values[key]
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
        params[key] = values[key]
      }
    })
    loadData(pag.current, pag.pageSize, params)
  }

  const handleDetail = (record) => {
    setCurrentDepositId(record.id)
    setDetailVisible(true)
  }

  const handlePay = () => {
    setPayVisible(true)
  }

  const handleBankAccount = (record) => {
    setCurrentDepositId(record.id)
    setCurrentDeposit(record)
    setBankAccountVisible(true)
  }

  const handleRefund = (record) => {
    if (record.payStatus !== 'PAID' && String(record.payStatus).toUpperCase() !== 'PAID') {
      message.warning('只有已缴纳的保证金才能退款')
      return
    }
    if (record.bidStatus === 'WON' || String(record.bidStatus).toUpperCase() === 'WON') {
      const deductStatus = normalizeStatus(record.deductStatus)
      if (deductStatus === 'PENDING_DEDUCT' || deductStatus === 'DEDUCTED' || deductStatus === 'PARTIAL_DEDUCT') {
        message.warning('竞得人保证金已转待抵扣或已抵扣，不允许直接退款')
        return
      }
    }
    if (record.refundStatus === 'REFUNDING' || record.refundStatus === 'PENDING' || record.refundStatus === 'PROCESSING') {
      message.warning('该保证金已申请退款，处理中')
      return
    }
    if (record.refundStatus === 'REFUNDED' || record.refundStatus === 'COMPLETED') {
      message.warning('该保证金已完成退款')
      return
    }
    if (record.judicialFrozen === 1 || record.judicialFrozen === true) {
      message.warning(`该竞买人账户已司法冻结${record.frozenReason ? `：${record.frozenReason}` : ''}，不允许退款`)
      return
    }
    setCurrentDepositId(record.id)
    setCurrentDeposit(record)
    refundForm.resetFields()
    setRefundModalVisible(true)
  }

  const handleDeduct = (record) => {
    if (record.payStatus !== 'PAID' && String(record.payStatus).toUpperCase() !== 'PAID') {
      message.warning('只有已缴纳的保证金才能抵扣')
      return
    }
    const deductStatus = normalizeStatus(record.deductStatus)
    if (deductStatus === 'DEDUCTED') {
      message.warning('该保证金已全部抵扣')
      return
    }
    setCurrentDepositId(record.id)
    setCurrentDeposit(record)
    deductForm.resetFields()
    deductForm.setFieldsValue({ deductAmount: record.refundableAmount || record.depositAmount })
    setDeductModalVisible(true)
  }

  const submitRefund = async () => {
    try {
      const values = await refundForm.validateFields()
      await request.post(api.refundApply, {
        depositId: currentDepositId,
        refundReason: values.refundReason,
        refundAmount: currentDeposit.refundableAmount
      })
      message.success('退款申请提交成功')
      setRefundModalVisible(false)
      handleSearch()
    } catch (e) {
      console.error('退款申请失败', e)
      message.error(e.message || '退款申请失败')
    }
  }

  const submitDeduct = async () => {
    try {
      const values = await deductForm.validateFields()
      await request.post(api.deductExecute, {
        depositId: currentDepositId,
        deductAmount: values.deductAmount,
        deductReason: values.deductReason,
        relateType: values.relateType,
        relateId: values.relateId
      })
      message.success('抵扣成功')
      setDeductModalVisible(false)
      handleSearch()
    } catch (e) {
      console.error('抵扣失败', e)
      message.error(e.message || '抵扣失败')
    }
  }

  const getStatusTag = (status, statusMap) => {
    const norm = normalizeStatus(status)
    const info = statusMap[norm] || statusMap[status]
    if (!info) return <Tag>{status}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const renderJudicialFrozen = (val, record) => {
    if (val === 1 || val === true) {
      return (
        <Tooltip title={record.frozenReason ? `冻结原因：${record.frozenReason}，冻结时间：${formatDateTime(record.frozenTime)}` : '该用户已被司法冻结'}>
          <Tag color="red" icon={<WarningOutlined />}>已冻结</Tag>
        </Tooltip>
      )
    }
    return <Tag color="green">正常</Tag>
  }

  const renderAccountLock = (val, record) => {
    const isLocked = record.bankAccountEditable === 0 || record.bankAccountLockTime
    if (isLocked) {
      return (
        <Tooltip title={`锁定时间：${formatDateTime(record.bankAccountLockTime)}，锁定人：${record.bankAccountLockBy || '系统'}`}>
          <Tag color="orange" icon={<LockOutlined />}>已锁定</Tag>
        </Tooltip>
      )
    }
    return <Tag color="green">可编辑</Tag>
  }

  const columns = [
    {
      title: '保证金编号',
      dataIndex: 'depositNo',
      key: 'depositNo',
      width: 160,
      fixed: 'left'
    },
    {
      title: '标的名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 180,
      ellipsis: true
    },
    {
      title: '竞买人',
      dataIndex: 'bidderName',
      key: 'bidderName',
      width: 100,
      render: (val, record) => (
        <Space direction="vertical" size={0}>
          <span>{val}</span>
          {renderJudicialFrozen(record.judicialFrozen, record)}
        </Space>
      )
    },
    {
      title: '保证金金额',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      width: 120,
      render: (val) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{formatMoney(val)}</span>
      )
    },
    {
      title: '缴纳状态',
      dataIndex: 'payStatus',
      key: 'payStatus',
      width: 90,
      render: (val) => getStatusTag(val, PAY_STATUS_MAP)
    },
    {
      title: '竞买状态',
      dataIndex: 'bidStatus',
      key: 'bidStatus',
      width: 90,
      render: (val) => getStatusTag(val, BID_STATUS_MAP)
    },
    {
      title: '抵扣状态',
      dataIndex: 'deductStatus',
      key: 'deductStatus',
      width: 90,
      render: (val) => getStatusTag(val, DEDUCT_STATUS_MAP)
    },
    {
      title: '退款状态',
      dataIndex: 'refundStatus',
      key: 'refundStatus',
      width: 90,
      render: (val) => getStatusTag(val, REFUND_STATUS_MAP)
    },
    {
      title: '账号状态',
      dataIndex: 'bankAccountEditable',
      key: 'bankAccountEditable',
      width: 90,
      render: (val, record) => renderAccountLock(val, record)
    },
    {
      title: '可退款金额',
      dataIndex: 'refundableAmount',
      key: 'refundableAmount',
      width: 120,
      render: (val) => <span style={{ color: '#52c41a' }}>¥{formatMoney(val)}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<BankOutlined />} onClick={() => handleBankAccount(record)}>
            收款账号
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleRefund(record)}
            disabled={record.judicialFrozen === 1 || record.judicialFrozen === true}
          >
            退款
          </Button>
          <Button
            type="link"
            size="small"
            icon={<AuditOutlined />}
            onClick={() => handleDeduct(record)}
          >
            抵扣
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>保证金管理</h2>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="depositNo" label="保证金编号">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="itemName" label="标的名称">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="bidderName" label="竞买人">
          <Input placeholder="请输入" style={{ width: 120 }} allowClear />
        </Form.Item>
        <Form.Item name="payStatus" label="缴纳状态">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            {PAY_STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="bidStatus" label="竞买状态">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            {BID_STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="refundStatus" label="退款状态">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            {REFUND_STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="deductStatus" label="抵扣状态">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            {DEDUCT_STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>查询</Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handlePay}>
              缴纳保证金
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        onChange={handleTableChange}
      />

      <DetailModal
        visible={detailVisible}
        depositId={currentDepositId}
        onCancel={() => setDetailVisible(false)}
      />

      <PayModal
        visible={payVisible}
        onCancel={() => setPayVisible(false)}
        onSuccess={() => handleSearch()}
      />

      <BankAccountModal
        visible={bankAccountVisible}
        depositId={currentDepositId}
        depositData={currentDeposit}
        onCancel={() => setBankAccountVisible(false)}
        onSuccess={() => handleSearch()}
      />

      <Modal
        title="保证金退款"
        open={refundModalVisible}
        onCancel={() => setRefundModalVisible(false)}
        onOk={submitRefund}
        okText="提交申请"
        width={520}
      >
        {currentDeposit && (
          <Form form={refundForm} layout="vertical">
            <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: 6 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <span style={{ color: '#666' }}>保证金编号：</span>
                {currentDeposit.depositNo}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <span style={{ color: '#666' }}>标的名称：</span>
                {currentDeposit.itemName}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ color: '#666' }}>可退款金额：</span>
                <span style={{ color: '#52c41a', fontSize: 16, fontWeight: 'bold' }}>
                  ¥{formatMoney(currentDeposit.refundableAmount)}
                </span>
              </p>
            </div>
            <Form.Item
              label="退款原因"
              name="refundReason"
              rules={[{ required: true, message: '请输入退款原因' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入退款原因" maxLength={500} showCount />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="保证金抵扣"
        open={deductModalVisible}
        onCancel={() => setDeductModalVisible(false)}
        onOk={submitDeduct}
        okText="确认抵扣"
        width={520}
      >
        {currentDeposit && (
          <Form form={deductForm} layout="vertical">
            <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: 6 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <span style={{ color: '#666' }}>保证金编号：</span>
                {currentDeposit.depositNo}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ color: '#666' }}>可抵扣金额：</span>
                <span style={{ color: '#f5222d', fontSize: 16, fontWeight: 'bold' }}>
                  ¥{formatMoney(currentDeposit.refundableAmount || currentDeposit.depositAmount)}
                </span>
              </p>
            </div>
            <Form.Item
              label="抵扣金额"
              name="deductAmount"
              rules={[
                { required: true, message: '请输入抵扣金额' },
                {
                  validator: (_, value) => {
                    if (value && value > (currentDeposit.refundableAmount || currentDeposit.depositAmount)) {
                      return Promise.reject('抵扣金额不能超过可抵扣金额')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                step={100}
                precision={2}
                addonBefore="¥"
                placeholder="请输入抵扣金额"
              />
            </Form.Item>
            <Form.Item label="关联类型" name="relateType">
              <Select placeholder="请选择" allowClear>
                <Option value="AUCTION_BID">竞买记录</Option>
                <Option value="DEAL">成交款</Option>
                <Option value="OTHER">其他</Option>
              </Select>
            </Form.Item>
            <Form.Item label="关联单据号" name="relateId">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item label="抵扣原因" name="deductReason">
              <Input.TextArea rows={3} placeholder="请输入抵扣原因" maxLength={500} showCount />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default DepositList
