import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Input, Select, DatePicker, Tag, Space, Modal, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../../../utils/request'
import DetailModal from './DetailModal'
import DealConfirmModal from './DealConfirmModal'

const { RangePicker } = DatePicker
const { Option } = Select

const itemTypeOptions = [
  { label: '房产', value: 'house' },
  { label: '车辆', value: 'car' },
  { label: '设备', value: 'equipment' },
  { label: '土地', value: 'land' },
  { label: '其他', value: 'other' }
]

const statusOptions = [
  { label: '待开拍', value: 'pending' },
  { label: '拍卖中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
  { label: '已撤回', value: 'withdrawn' }
]

const dealStatusOptions = [
  { label: '未成交', value: 'unsold' },
  { label: '已成交', value: 'sold' },
  { label: '流拍', value: 'failed' }
]

const statusColorMap = {
  pending: 'default',
  ongoing: 'processing',
  ended: 'success',
  withdrawn: 'warning'
}

const dealStatusColorMap = {
  unsold: 'default',
  sold: 'success',
  failed: 'error'
}

const statusTextMap = {
  pending: '待开拍',
  ongoing: '拍卖中',
  ended: '已结束',
  withdrawn: '已撤回'
}

const dealStatusTextMap = {
  unsold: '未成交',
  sold: '已成交',
  failed: '流拍'
}

const itemTypeTextMap = {
  house: '房产',
  car: '车辆',
  equipment: '设备',
  land: '土地',
  other: '其他'
}

function AuctionItem() {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchParams, setSearchParams] = useState({})
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [dealVisible, setDealVisible] = useState(false)
  const [dealItem, setDealItem] = useState(null)
  const [isAdmin, setIsAdmin] = useState(true)

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/auction/item/list', {
        params: {
          page,
          pageSize,
          ...params
        }
      })
      if (res.code === 200) {
        setData(res.data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: res.data.total || 0
        })
      }
    } catch (error) {
      console.error('获取标的列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, 10, searchParams)
  }, [])

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        if (key === 'auctionTime' && values[key]) {
          params.startTime = values[key][0].format('YYYY-MM-DD HH:mm:ss')
          params.endTime = values[key][1].format('YYYY-MM-DD HH:mm:ss')
        } else {
          params[key] = values[key]
        }
      }
    })
    setSearchParams(params)
    fetchData(1, pagination.pageSize, params)
  }

  const handleReset = () => {
    form.resetFields()
    setSearchParams({})
    fetchData(1, pagination.pageSize, {})
  }

  const handleTableChange = (pag) => {
    fetchData(pag.current, pag.pageSize, searchParams)
  }

  const handleDetail = (record) => {
    setDetailData(record)
    setDetailVisible(true)
  }

  const handleEdit = (record) => {
    message.info('编辑功能待实现')
  }

  const handleDelete = async (record) => {
    try {
      const res = await request.delete(`/auction/item/${record.id}`)
      if (res.code === 200) {
        message.success('删除成功')
        fetchData(pagination.current, pagination.pageSize, searchParams)
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleAdd = () => {
    message.info('新增功能待实现')
  }

  const handleDealConfirm = (record) => {
    setDealItem(record)
    setDealVisible(true)
  }

  const handleDealSuccess = () => {
    setDealVisible(false)
    setDealItem(null)
    fetchData(pagination.current, pagination.pageSize, searchParams)
  }

  const columns = [
    {
      title: '标的编号',
      dataIndex: 'itemNo',
      key: 'itemNo',
      width: 120
    },
    {
      title: '标的名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      ellipsis: true
    },
    {
      title: '标的类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 100,
      render: (text) => itemTypeTextMap[text] || text
    },
    {
      title: '法院名称',
      dataIndex: 'courtName',
      key: 'courtName',
      width: 150,
      ellipsis: true
    },
    {
      title: '起拍价',
      dataIndex: 'startPrice',
      key: 'startPrice',
      width: 120,
      render: (text) => `¥${text?.toLocaleString() || 0}`
    },
    {
      title: '保证金',
      dataIndex: 'deposit',
      key: 'deposit',
      width: 120,
      render: (text) => `¥${text?.toLocaleString() || 0}`
    },
    {
      title: '拍卖时间',
      dataIndex: 'auctionTime',
      key: 'auctionTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '标的状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => (
        <Tag color={statusColorMap[text]}>
          {statusTextMap[text] || text}
        </Tag>
      )
    },
    {
      title: '成交状态',
      dataIndex: 'dealStatus',
      key: 'dealStatus',
      width: 100,
      render: (text) => (
        <Tag color={dealStatusColorMap[text]}>
          {dealStatusTextMap[text] || text}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {isAdmin && record.status === 'ended' && record.dealStatus === 'unsold' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleDealConfirm(record)}>
              确认成交
            </Button>
          )}
          <Popconfirm
            title="确定删除该标的吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>拍卖标的物管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增标的
        </Button>
      </div>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="itemNo" label="标的编号">
          <Input placeholder="请输入标的编号" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="itemName" label="标的名称">
          <Input placeholder="请输入标的名称" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="itemType" label="标的类型">
          <Select placeholder="请选择标的类型" style={{ width: 130 }} allowClear>
            {itemTypeOptions.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="courtName" label="法院名称">
          <Input placeholder="请输入法院名称" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
            {statusOptions.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
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

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {detailVisible && (
        <DetailModal
          visible={detailVisible}
          data={detailData}
          onClose={() => setDetailVisible(false)}
        />
      )}

      {dealVisible && (
        <DealConfirmModal
          visible={dealVisible}
          item={dealItem}
          onClose={() => setDealVisible(false)}
          onSuccess={handleDealSuccess}
        />
      )}
    </div>
  )
}

export default AuctionItem
