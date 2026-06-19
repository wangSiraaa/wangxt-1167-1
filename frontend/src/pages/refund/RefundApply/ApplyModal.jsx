import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, message, Table } from 'antd'
import request from '../../../utils/request'
import { formatMoney } from '../../../utils/format'
import api from '../../../config/api'

const { Option } = Select

function ApplyModal({ visible, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [depositList, setDepositList] = useState([])
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
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
        (item) => item.refundStatus !== 'REFUNDING' && item.refundStatus !== 'REFUNDED'
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
    setSearchKeyword(value)
    loadDepositList(value)
  }

  const handleDepositSelect = (depositId) => {
    const deposit = depositList.find((item) => item.id === depositId)
    setSelectedDeposit(deposit)
    if (deposit) {
      form.setFieldsValue({
        refundType: 'FULL',
        refundAmount: deposit.refundableAmount || deposit.depositAmount
      })
    }
  }

  const handleRefundTypeChange = (value) => {
    if (value === 'FULL' && selectedDeposit) {
      form.setFieldsValue({
        refundAmount: selectedDeposit.refundableAmount || selectedDeposit.depositAmount
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
      await request.post(api.refundApply, {
        depositId: selectedDeposit.id,
        refundType: values.refundType,
        refundAmount: values.refundAmount,
        refundReason: values.refundReason
      })
      message.success('退款申请提交成功')
      onSuccess && onSuccess()
    } catch (e) {
      console.error('退款申请失败', e)
      message.error(e.message || '退款申请失败')
    } finally {
      setLoading(false)
    }
  }

  const depositColumns = [
    {
      title: '保证金编号',
      dataIndex: 'depositNo',
      key: 'depositNo',
      width: 140
    },
    {
      title: '标的名称',
      dataIndex: 'itemName',
      key: 'itemName',
      ellipsis: true
    },
    {
      title: '竞买人',
      dataIndex: 'bidderName',
      key: 'bidderName',
      width: 100
    },
    {
      title: '保证金金额',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      width: 120,
      render: (val) => <span style={{ color: '#f5222d' }}>¥{formatMoney(val)}</span>
    },
    {
      title: '可退款金额',
      dataIndex: 'refundableAmount',
      key: 'refundableAmount',
      width: 120,
      render: (val) => <span style={{ color: '#52c41a' }}>¥{formatMoney(val)}</span>
    }
  ]

  return (
    <Modal
      title="发起退款申请"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="提交申请"
      confirmLoading={loading}
      width={700}
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
                  <span style={{ float: 'right', color: '#52c41a' }}>
                    可退 ¥{formatMoney(item.refundableAmount || item.depositAmount)}
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
              <span style={{ color: '#666' }}>可退款金额：</span>
              <span style={{ color: '#52c41a', fontSize: 16, fontWeight: 'bold' }}>
                ¥{formatMoney(selectedDeposit.refundableAmount || selectedDeposit.depositAmount)}
              </span>
            </p>
          </div>
        )}

        <Form.Item
          label="退款类型"
          name="refundType"
          rules={[{ required: true, message: '请选择退款类型' }]}
        >
          <Select placeholder="请选择退款类型" onChange={handleRefundTypeChange}>
            <Option value="FULL">全额退款</Option>
            <Option value="PARTIAL">部分退款</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="退款金额"
          name="refundAmount"
          rules={[
            { required: true, message: '请输入退款金额' },
            {
              validator: (_, value) => {
                if (!value || value <= 0) {
                  return Promise.reject('退款金额必须大于0')
                }
                if (selectedDeposit && value > (selectedDeposit.refundableAmount || selectedDeposit.depositAmount)) {
                  return Promise.reject('退款金额不能超过可退款金额')
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
            placeholder="请输入退款金额"
            disabled={form.getFieldValue('refundType') === 'FULL'}
          />
        </Form.Item>

        <Form.Item
          label="退款原因"
          name="refundReason"
          rules={[{ required: true, message: '请输入退款原因' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入退款原因" />
        </Form.Item>

        {selectedDeposit && (
          <div style={{ marginTop: 8, padding: '12px', background: '#e6f7ff', borderRadius: 6 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#1890ff' }}>收款账号信息</p>
            <p style={{ margin: '0 0 4px 0' }}>
              <span style={{ color: '#666' }}>开户名：</span>
              {selectedDeposit.bankAccountName || '-'}
            </p>
            <p style={{ margin: '0 0 4px 0' }}>
              <span style={{ color: '#666' }}>开户银行：</span>
              {selectedDeposit.bankName || '-'}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#666' }}>银行账号：</span>
              {selectedDeposit.bankAccountNo || '-'}
            </p>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default ApplyModal
