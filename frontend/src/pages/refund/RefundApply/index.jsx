import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message, DatePicker } from 'antd'
import { PlusOutlined, ReloadOutlined, EyeOutlined, AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, RedoOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'
import ApplyModal from './ApplyModal'
import AuditModal from './AuditModal'
import DetailModal from './DetailModal'
import FailModal from './FailModal'
import ReapplyModal from './ReapplyModal'

const { Option } = Select
const { RangePicker } = DatePicker

const REFUND_STATUS_OPTIONS = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核驳回' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' }
]

const REFUND_TYPE_OPTIONS = [
  { value: 'full', label: '全额退款' },
  { value: 'partial', label: '部分退款' }
]

const REFUND_STATUS_MAP = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '审核通过', color: 'blue' },
  rejected: { text: '审核驳回', color: 'red' },
  processing: { text: '处理中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  failed: { text: '失败', color: 'red' }
}

const REFUND_TYPE_MAP = {
  full: { text: '全额退款', color: 'green' },
  partial: { text: '部分退款', color: 'blue' }
}

function RefundApply() {
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const [applyVisible, setApplyVisible] = useState(false)
  const [auditVisible, setAuditVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [failVisible, setFailVisible] = useState(false)
  const [reapplyVisible, setReapplyVisible] = useState(false)
  const [currentRefundId, setCurrentRefundId] = useState(null)
  const [currentRefund, setCurrentRefund] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get(api.refundList, {
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
      console.error('加载退款列表失败', e)
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

  const handleApply = () => {
    setApplyVisible(true)
  }

  const handleDetail = (record) => {
    setCurrentRefundId(record.id)
    setCurrentRefund(record)
    setDetailVisible(true)
  }

  const handleAudit = (record) => {
    if (record.applyStatus !== 'pending') {
      message.warning('只有待审核状态的申请才能审核')
      return
    }
    setCurrentRefundId(record.id)
    setCurrentRefund(record)
    setAuditVisible(true)
  }

  const handleConfirm = async (record) => {
    if (record.applyStatus !== 'processing') {
      message.warning('只有处理中状态的申请才能确认完成')
      return
    }
    try {
      await request.put(api.refundComplete, null, {
        params: {
          refundId: record.id,
          payOrderNo: 'PY' + Date.now()
        }
      })
      message.success('确认完成成功')
      handleSearch()
    } catch (e) {
      console.error('确认完成失败', e)
      message.error(e.message || '确认完成失败')
    }
  }

  const handleFail = (record) => {
    if (record.applyStatus !== 'processing') {
      message.warning('只有处理中状态的申请才能标记失败')
      return
    }
    setCurrentRefundId(record.id)
    setCurrentRefund(record)
    setFailVisible(true)
  }

  const handleReapply = (record) => {
    if (record.applyStatus !== 'failed') {
      message.warning('只有失败状态的申请才能重提')
      return
    }
    setCurrentRefund(record)
    setReapplyVisible(true)
  }

  const getStatusTag = (status, statusMap) => {
    const info = statusMap[status]
    if (!info) return <Tag>{status}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '退款编号',
      dataIndex: 'refundNo',
      key: 'refundNo',
      width: 160,
      fixed: 'left',
      render: (val, record) => (
        <Space direction="vertical" size={0}>
          <span>{val}</span>
          {record.parentId && (
            <span style={{ color: '#999', fontSize: 12 }}>重提申请</span>
          )}
        </Space>
      )
    },
    {
      title: '保证金ID',
      dataIndex: 'depositId',
      key: 'depositId',
      width: 100
    },
    {
      title: '竞买人ID',
      dataIndex: 'bidderId',
      key: 'bidderId',
      width: 100
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 130,
      render: (val) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{formatMoney(val)}</span>
      )
    },
    {
      title: '退款类型',
      dataIndex: 'refundType',
      key: 'refundType',
      width: 100,
      render: (val) => getStatusTag(val, REFUND_TYPE_MAP)
    },
    {
      title: '申请状态',
      dataIndex: 'applyStatus',
      key: 'applyStatus',
      width: 100,
      render: (val) => getStatusTag(val, REFUND_STATUS_MAP)
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 170,
      render: (val) => formatDateTime(val)
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      key: 'failReason',
      width: 160,
      ellipsis: true,
      render: (val) => val || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          {record.applyStatus === 'pending' && (
            <Button type="link" size="small" icon={<AuditOutlined />} onClick={() => handleAudit(record)}>
              审核
            </Button>
          )}
          {record.applyStatus === 'processing' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(record)}>
              确认完成
            </Button>
          )}
          {record.applyStatus === 'processing' && (
            <Button type="link" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleFail(record)}>
              标记失败
            </Button>
          )}
          {record.applyStatus === 'failed' && (
            <Button type="link" size="small" icon={<RedoOutlined />} onClick={() => handleReapply(record)}>
              重提申请
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>退款管理</h2>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="refundNo" label="退款编号">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="applyStatus" label="申请状态">
          <Select placeholder="请选择" style={{ width: 120 }} allowClear>
            {REFUND_STATUS_OPTIONS.map((opt) => (
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleApply}>
              发起退款
            </Button>
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

      <ApplyModal
        visible={applyVisible}
        onCancel={() => setApplyVisible(false)}
        onSuccess={() => {
          setApplyVisible(false)
          handleSearch()
        }}
      />

      <AuditModal
        visible={auditVisible}
        refundId={currentRefundId}
        refundData={currentRefund}
        onCancel={() => setAuditVisible(false)}
        onSuccess={() => {
          setAuditVisible(false)
          handleSearch()
        }}
      />

      <DetailModal
        visible={detailVisible}
        refundId={currentRefundId}
        onCancel={() => setDetailVisible(false)}
      />

      <FailModal
        visible={failVisible}
        refundId={currentRefundId}
        onCancel={() => setFailVisible(false)}
        onSuccess={() => {
          setFailVisible(false)
          handleSearch()
        }}
      />

      <ReapplyModal
        visible={reapplyVisible}
        originalRefund={currentRefund}
        onCancel={() => setReapplyVisible(false)}
        onSuccess={() => {
          setReapplyVisible(false)
          handleSearch()
        }}
      />
    </div>
  )
}

export default RefundApply
