import React, { useState, useEffect } from 'react'
import { Modal, Form, Select, InputNumber, message } from 'antd'
import request from '../../../utils/request'

const { Option } = Select

function DealConfirmModal({ visible, item, onClose, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [bidderList, setBidderList] = useState([])

  useEffect(() => {
    if (visible && item?.id) {
      fetchBidderList(item.id)
      form.setFieldsValue({
        dealPrice: item.startPrice
      })
    }
  }, [visible, item])

  const fetchBidderList = async (itemId) => {
    try {
      const res = await request.get('/auction/bid/list', {
        params: { itemId, pageSize: 100 }
      })
      if (res.code === 200) {
        const bidders = (res.data.list || []).map((bid) => ({
          id: bid.bidderId,
          name: bid.bidderName,
          amount: bid.bidAmount
        }))
        const uniqueBidders = bidders.reduce((acc, curr) => {
          if (!acc.find((b) => b.id === curr.id)) {
            acc.push(curr)
          }
          return acc
        }, [])
        setBidderList(uniqueBidders)
      }
    } catch (error) {
      console.error('获取竞买人列表失败:', error)
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const res = await request.post('/auction/item/confirm-deal', {
        itemId: item.id,
        winnerId: values.winnerId,
        dealPrice: values.dealPrice
      })
      if (res.code === 200) {
        message.success('成交确认成功')
        onSuccess && onSuccess()
      } else {
        message.error(res.message || '成交确认失败')
      }
    } catch (error) {
      console.error('成交确认失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose && onClose()
  }

  return (
    <Modal
      title="确认成交"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认成交"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>标的编号：</strong>{item?.itemNo}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>标的名称：</strong>{item?.itemName}
          </p>
          <p style={{ margin: 0 }}>
            <strong>起拍价：</strong>¥{item?.startPrice?.toLocaleString() || 0}
          </p>
        </div>

        <Form.Item
          name="winnerId"
          label="竞得人"
          rules={[{ required: true, message: '请选择竞得人' }]}
        >
          <Select placeholder="请选择竞得人" showSearch optionFilterProp="children">
            {bidderList.map((bidder) => (
              <Option key={bidder.id} value={bidder.id}>
                {bidder.name}（最高出价：¥{bidder.amount?.toLocaleString() || 0}）
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dealPrice"
          label="成交价格"
          rules={[
            { required: true, message: '请输入成交价格' },
            { type: 'number', min: 0, message: '成交价格不能小于0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入成交价格"
            formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\¥\s?|(,*)/g, '')}
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DealConfirmModal
