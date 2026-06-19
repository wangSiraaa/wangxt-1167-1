import React, { useState, useEffect } from 'react'
import { Table, Button, Form, Select, Tag, Space, message } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../../../utils/request'

const { Option } = Select

function AuctionBid() {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchParams, setSearchParams] = useState({})
  const [itemOptions, setItemOptions] = useState([])

  const fetchItemList = async () => {
    try {
      const res = await request.get('/auction/item/list', {
        params: { pageSize: 100 }
      })
      if (res.code === 200) {
        const options = (res.data.list || []).map((item) => ({
          value: item.id,
          label: `${item.itemNo} - ${item.itemName}`
        }))
        setItemOptions(options)
      }
    } catch (error) {
      console.error('获取标的列表失败:', error)
    }
  }

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/auction/bid/list', {
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
      console.error('获取竞买记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItemList()
    fetchData(1, 10, searchParams)
  }, [])

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params = {}
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        params[key] = values[key]
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

  const columns = [
    {
      title: '标的名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 250,
      ellipsis: true
    },
    {
      title: '竞买人',
      dataIndex: 'bidderName',
      key: 'bidderName',
      width: 150
    },
    {
      title: '出价金额',
      dataIndex: 'bidAmount',
      key: 'bidAmount',
      width: 150,
      render: (text) => `¥${text?.toLocaleString() || 0}`,
      sorter: (a, b) => (a.bidAmount || 0) - (b.bidAmount || 0)
    },
    {
      title: '出价时间',
      dataIndex: 'bidTime',
      key: 'bidTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      sorter: (a, b) => {
        if (!a.bidTime || !b.bidTime) return 0
        return new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime()
      }
    },
    {
      title: '是否竞得',
      dataIndex: 'isWinning',
      key: 'isWinning',
      width: 100,
      render: (text) => (
        <Tag color={text ? 'success' : 'default'}>
          {text ? '是' : '否'}
        </Tag>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>竞买记录</h2>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="itemId" label="标的ID">
          <Select
            placeholder="请选择标的"
            style={{ width: 280 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {itemOptions.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="bidderName" label="竞买人">
          <Select
            placeholder="请输入竞买人"
            style={{ width: 150 }}
            allowClear
            showSearch
            mode="tags"
          />
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
        scroll={{ x: 800 }}
      />
    </div>
  )
}

export default AuctionBid
