import React, { useState, useEffect } from 'react'
import { Modal, Table, Tag, Descriptions, Tabs, List } from 'antd'
import dayjs from 'dayjs'
import request from '../../../utils/request'

const { TabPane } = Tabs

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

const depositStatusMap = {
  unpaid: { text: '未缴纳', color: 'default' },
  paid: { text: '已缴纳', color: 'success' },
  refunded: { text: '已退还', color: 'processing' },
  forfeited: { text: '已没收', color: 'error' }
}

function DetailModal({ visible, data, onClose }) {
  const [bidRecords, setBidRecords] = useState([])
  const [depositList, setDepositList] = useState([])
  const [loading, setLoading] = useState(false)
  const [bidLoading, setBidLoading] = useState(false)
  const [depositLoading, setDepositLoading] = useState(false)

  useEffect(() => {
    if (visible && data?.id) {
      fetchBidRecords(data.id)
      fetchDepositList(data.id)
    }
  }, [visible, data])

  const fetchBidRecords = async (itemId) => {
    setBidLoading(true)
    try {
      const res = await request.get('/auction/bid/list', {
        params: { itemId, pageSize: 100 }
      })
      if (res.code === 200) {
        setBidRecords(res.data.list || [])
      }
    } catch (error) {
      console.error('获取竞买记录失败:', error)
    } finally {
      setBidLoading(false)
    }
  }

  const fetchDepositList = async (itemId) => {
    setDepositLoading(true)
    try {
      const res = await request.get('/auction/deposit/list', {
        params: { itemId, pageSize: 100 }
      })
      if (res.code === 200) {
        setDepositList(res.data.list || [])
      }
    } catch (error) {
      console.error('获取保证金列表失败:', error)
    } finally {
      setDepositLoading(false)
    }
  }

  const bidColumns = [
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
      render: (text) => `¥${text?.toLocaleString() || 0}`
    },
    {
      title: '出价时间',
      dataIndex: 'bidTime',
      key: 'bidTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
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

  const depositColumns = [
    {
      title: '竞买人',
      dataIndex: 'bidderName',
      key: 'bidderName',
      width: 150
    },
    {
      title: '保证金金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (text) => `¥${text?.toLocaleString() || 0}`
    },
    {
      title: '缴纳时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => {
        const statusInfo = depositStatusMap[text] || { text, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    }
  ]

  return (
    <Modal
      title="标的详情"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <Tabs defaultActiveKey="base">
        <TabPane tab="基本信息" key="base">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="标的编号">{data?.itemNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="标的名称">{data?.itemName || '-'}</Descriptions.Item>
            <Descriptions.Item label="标的类型">
              {itemTypeTextMap[data?.itemType] || data?.itemType || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="法院名称">{data?.courtName || '-'}</Descriptions.Item>
            <Descriptions.Item label="起拍价">
              ¥{data?.startPrice?.toLocaleString() || 0}
            </Descriptions.Item>
            <Descriptions.Item label="保证金">
              ¥{data?.deposit?.toLocaleString() || 0}
            </Descriptions.Item>
            <Descriptions.Item label="加价幅度">
              ¥{data?.increment?.toLocaleString() || 0}
            </Descriptions.Item>
            <Descriptions.Item label="评估价">
              ¥{data?.evaluationPrice?.toLocaleString() || 0}
            </Descriptions.Item>
            <Descriptions.Item label="拍卖开始时间">
              {data?.startTime ? dayjs(data.startTime).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="拍卖结束时间">
              {data?.endTime ? dayjs(data.endTime).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标的状态">
              <Tag color={statusColorMap[data?.status]}>
                {statusTextMap[data?.status] || data?.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="成交状态">
              <Tag color={dealStatusColorMap[data?.dealStatus]}>
                {dealStatusTextMap[data?.dealStatus] || data?.dealStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="竞得人">{data?.winnerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="成交价">
              {data?.dealPrice ? `¥${data.dealPrice.toLocaleString()}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标的描述" span={2}>
              {data?.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标的地址" span={2}>
              {data?.address || '-'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="竞买记录" key="bid">
          <Table
            columns={bidColumns}
            dataSource={bidRecords}
            rowKey="id"
            loading={bidLoading}
            pagination={false}
            size="small"
          />
        </TabPane>

        <TabPane tab="保证金缴纳" key="deposit">
          <Table
            columns={depositColumns}
            dataSource={depositList}
            rowKey="id"
            loading={depositLoading}
            pagination={false}
            size="small"
          />
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default DetailModal
