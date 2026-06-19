import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'
import request from '../../../utils/request'
import { formatMoney } from '../../../utils/format'
import api from '../../../config/api'

const { Option } = Select

function DeductModal({ visible, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [depositList, setDepositList] = useState([])
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [depositLoading, setDepositLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      form.resetFields()
      setSelectedDeposit(null)
      loadDepositList()
    }
  }, [visible])

  const loadDepositList = async (keyword = '') => {
    setDepositLoading(true)
    try {
      const res = await request.get(api.depositList, {
        params: {
          current: 1,
          size: 50,
          payStatus: 'PAID',
          keyword: keyword
        }
      })
      const data = res.data
      const list = (data?.records || data?.list || []).filter(
        (item) => item.deductStatus !== 'DEDUCTED'
      )
      setDepositList(list)
    } catch (e) {
      console.error('加载保证金列表失败', e)
      message.error('加载保证金列表失败')
    } finally {
      setDepositLoading(false)
    }
  }

  const handleSearchDeposit = (value) => {
    loadDepositList(value)
  }

  const handleDepositSelect = (depositId) => {
    const deposit = depositList.find((item) => item.id === depositId)
    setSelectedDeposit(deposit)
    if (deposit) {
      form.setFieldsValue({
        deductAmount: deposit.refundableAmount || deposit.depositAmount
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!selectedDeposit) {
        message.warning('请选择保证金记录')
        return
      }
      setLoading(true)
      await request.post(api.deductExecute, {
        depositId: selectedDeposit.id,
        deductType: values.deductType,
        deductAmount: values.deductAmount,
        deductReason: values.deductReason,
        relateType: values.relateType,
        relateId: values.relateId
      })
      message.success('抵扣成功')
      onSuccess && onSuccess()
    } catch (e) {
      console.error('抵扣失败', e)
      message.error(e.message || '抵扣失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="执行抵扣"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="确认抵扣"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="选择保证金"
          name="depositId"
          rules={[{ required: true, message: '请选择保证金记录' }]}
        >
          <Select
            placeholder="请搜索并选择保证金"
            showSearch
            filterOption={false}
            onSearch={handleSearchDeposit}
            onChange={handleDepositSelect}
            loading={depositLoading}
            optionLabelProp="label"
          >
            {depositList.map((item) => (
              <Option key={item.id} value={item.id} label={item.depositNo}>
                <div>
                  <span style={{ fontWeight: 500 }}>{item.depositNo}</span>
                  <span style={{ marginLeft: 8, color: '#888' }}>{item.itemName}</span>
                  <span style={{ float: 'right', color: '#f5222d' }}>
                    可抵 ¥{formatMoney(item.refundableAmount || item.depositAmount)}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedDeposit && (
          <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: 6 }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <span style={{ color: '#666' }}>标的名称：</span>
              {selectedDeposit.itemName}
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <span style={{ color: '#666' }}>竞买人：</span>
              {selectedDeposit.bidderName}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#666' }}>可抵扣金额：</span>
              <span style={{ color: '#f5222d', fontSize: 16, fontWeight: 'bold' }}>
                ¥{formatMoney(selectedDeposit.refundableAmount || selectedDeposit.depositAmount)}
              </span>
            </p>
          </div>
        )}

        <Form.Item
          label="抵扣类型"
          name="deductType"
          rules={[{ required: true, message: '请选择抵扣类型' }]}
        >
          <Select placeholder="请选择抵扣类型">
            <Option value="FINAL_PAYMENT">尾款抵扣</Option>
            <Option value="OTHER">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="抵扣金额"
          name="deductAmount"
          rules={[
            { required: true, message: '请输入抵扣金额' },
            {
              validator: (_, value) => {
                if (!value || value <= 0) {
                  return Promise.reject('抵扣金额必须大于0')
                }
                if (selectedDeposit && value > (selectedDeposit.refundableAmount || selectedDeposit.depositAmount)) {
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
          <Input placeholder="请输入关联单据号" />
        </Form.Item>

        <Form.Item label="抵扣原因" name="deductReason">
          <Input.TextArea rows={3} placeholder="请输入抵扣原因" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DeductModal
