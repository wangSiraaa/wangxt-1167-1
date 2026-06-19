import React, { useState, useEffect } from 'react'
import { Modal, Form, Select, Input, InputNumber, Button, message, Row, Col, Space } from 'antd'
import request from '../../../utils/request'
import { formatMoney } from '../../../utils/format'
import api from '../../../config/api'

const { Option } = Select

const PAY_METHODS = [
  { value: 'BANK_TRANSFER', label: '银行转账' },
  { value: 'ALIPAY', label: '支付宝' },
  { value: 'WECHAT', label: '微信支付' },
  { value: 'UNIONPAY', label: '银联支付' }
]

function PayModal({ visible, onCancel, onSuccess, bidderId }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [itemList, setItemList] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (visible) {
      loadItemList()
      form.resetFields()
      setSelectedItem(null)
    }
  }, [visible])

  const loadItemList = async () => {
    try {
      const res = await request.get(api.itemList, { params: { current: 1, size: 100 } })
      setItemList(res.data?.records || res.data?.list || [])
    } catch (e) {
      console.error('加载标的列表失败', e)
    }
  }

  const handleItemChange = (value) => {
    const item = itemList.find((i) => i.id === value)
    setSelectedItem(item)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setPaying(true)
      setLoading(true)

      const payOrderNo = `PAY${Date.now()}`

      await new Promise((resolve) => setTimeout(resolve, 1500))

      await request.post(api.depositPay, {
        itemId: values.itemId,
        bidderId: bidderId,
        payMethod: values.payMethod,
        payOrderNo: payOrderNo
      })

      message.success('保证金缴纳成功')
      onSuccess?.()
      onCancel()
    } catch (e) {
      console.error('缴纳失败', e)
      message.error(e.message || '缴纳失败')
    } finally {
      setPaying(false)
      setLoading(false)
    }
  }

  return (
    <Modal
      title="缴纳保证金"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="选择标的"
          name="itemId"
          rules={[{ required: true, message: '请选择标的' }]}
        >
          <Select
            placeholder="请选择标的"
            showSearch
            optionFilterProp="children"
            onChange={handleItemChange}
          >
            {itemList.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.itemCode} - {item.itemName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedItem && (
          <Row gutter={16} style={{ marginBottom: 16, padding: '12px 16px', background: '#f5f5f5', borderRadius: 6 }}>
            <Col span={12}>
              <p style={{ margin: 0, color: '#666' }}>标的名称</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{selectedItem.itemName}</p>
            </Col>
            <Col span={12}>
              <p style={{ margin: 0, color: '#666' }}>起拍价</p>
              <p style={{ margin: 0 }}>¥{formatMoney(selectedItem.startingPrice)}</p>
            </Col>
            <Col span={12}>
              <p style={{ margin: 0, color: '#666' }}>保证金金额</p>
              <p style={{ margin: 0, color: '#f5222d', fontSize: 18, fontWeight: 'bold' }}>
                ¥{formatMoney(selectedItem.depositAmount)}
              </p>
            </Col>
            <Col span={12}>
              <p style={{ margin: 0, color: '#666' }}>开拍时间</p>
              <p style={{ margin: 0 }}>{selectedItem.auctionStartTime?.substring(0, 10) || '-'}</p>
            </Col>
          </Row>
        )}

        <Form.Item
          label="支付方式"
          name="payMethod"
          rules={[{ required: true, message: '请选择支付方式' }]}
        >
          <Select placeholder="请选择支付方式">
            {PAY_METHODS.map((method) => (
              <Option key={method.value} value={method.value}>
                {method.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} placeholder="请输入备注（选填）" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {paying ? '支付中...' : '确认缴纳'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PayModal
