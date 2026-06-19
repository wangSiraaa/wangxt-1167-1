import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message, DatePicker, Modal, Descriptions } from 'antd'
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'
import DeductModal from './DeductModal'

const { Option } = Select
const { RangePicker } = DatePicker

const DEDUCT_TYPE_OPTIONS = [
  { value: 'FINAL_PAYMENT', label: '尾款抵扣' },
  { value: 'OTHER', label: '其他' }
]

const DEDUCT_TYPE_MAP = {
  FINAL_PAYMENT: { text: '尾款抵扣', color: 'blue' },
  OTHER: { text: '其他', color: 'default' }
}

function DeductRecord() {
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const [deductVisible, setDeductVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentDeductId, setCurrentDeductId] = useState(null)
  const [currentDeduct, setCurrentDeduct] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get(api.deductList, {
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
      console.error('加载抵扣列表失败', e)
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

  const handleAdd = () => {
    setDeductVisible(true)
  }

  const handleDetail = async (record) => {
    setCurrentDeductId(record.id)
    try {
      const res = await request.get(`${api.deductDetail}/${record.id}`)
      setCurrentDeduct(res.data)
      setDetailVisible(true)
    } catch (e) {
      console.error('加载抵扣详情失败', e)
      message.error('加载详情失败')
    }
  }

  const getTypeTag = (type) => {
    const info = DEDUCT_TYPE_MAP[type]
    if (!info) return <Tag>{type}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '抵扣编号',
      dataIndex: 'deductNo',
      key: 'deductNo',
      width: 160,
      fixed: 'left'
    },
    {
      title: '保证金编号',
      dataIndex: 'depositNo',
      key: 'depositNo',
      width: 160
    },
    {
      title: '标的名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      ellipsis: true
    },
    {
      title: '竞买人',
      dataIndex: 'bidderName',
      key: 'bidderName',
      width: 100
    },
    {
      title: '抵扣金额',
      dataIndex: 'deductAmount',
      key: 'deductAmount',
      width: 130,
      render: (val) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{formatMoney(val)}</span>
      )
    },
    {
      title: '抵扣类型',
      dataIndex: 'deductType',
      key: 'deductType',
      width: 100,
      render: (val) => getTypeTag(val)
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (val) => formatDateTime(val)
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>抵扣管理</h2>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="deductNo" label="抵扣编号">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="itemName" label="标的名称">
          <Input placeholder="请输入" style={{ width: 150 }} allowClear />
        </Form.Item>
        <Form.Item name="bidderName" label="竞买人">
          <Input placeholder="请输入" style={{ width: 120 }} allowClear />
        </Form.Item>
        <Form.Item name="deductType" label="抵扣类型">
          <Select placeholder="请选择" style={{ width: 120 }} allowClear>
            {DEDUCT_TYPE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="起止时间">
          <RangePicker showTime showSecond={false} style={{ width: 260 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>查询</Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增抵扣
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        onChange={handleTableChange}
      />

      <DeductModal
        visible={deductVisible}
        onCancel={() => setDeductVisible(false)}
        onSuccess={() => {
          setDeductVisible(false)
          handleSearch()
        }}
      />

      <Modal
        title="抵扣详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {currentDeduct && (
          <div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="抵扣编号">{currentDeduct.deductNo}</Descriptions.Item>
              <Descriptions.Item label="保证金编号">{currentDeduct.depositNo}</Descriptions.Item>
              <Descriptions.Item label="标的名称">{currentDeduct.itemName}</Descriptions.Item>
              <Descriptions.Item label="竞买人">{currentDeduct.bidderName}</Descriptions.Item>
              <Descriptions.Item label="抵扣类型">
                {getTypeTag(currentDeduct.deductType)}
              </Descriptions.Item>
              <Descriptions.Item label="抵扣金额">
                <span style={{ color: '#f5222d', fontWeight: 500 }}>
                  ¥{formatMoney(currentDeduct.deductAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="操作人">{currentDeduct.operatorName || '-'}</Descriptions.Item>
              <Descriptions.Item label="操作时间">{formatDateTime(currentDeduct.createTime)}</Descriptions.Item>
              <Descriptions.Item label="抵扣原因">{currentDeduct.deductReason || '-'}</Descriptions.Item>
              {currentDeduct.relateType && (
                <Descriptions.Item label="关联类型">{currentDeduct.relateType}</Descriptions.Item>
              )}
              {currentDeduct.relateId && (
                <Descriptions.Item label="关联单据号">{currentDeduct.relateId}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DeductRecord
