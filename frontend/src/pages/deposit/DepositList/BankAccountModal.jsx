import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Space, Alert } from 'antd'
import request from '../../../utils/request'
import api from '../../../config/api'

function BankAccountModal({ visible, depositId, depositData, onCancel, onSuccess, userId }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (visible && depositData) {
      form.setFieldsValue({
        bankAccount: depositData.bankAccount,
        bankName: depositData.bankName,
        bankBranch: depositData.bankBranch
      })
      setDisabled(depositData.bankAccountEditable === 0 || depositData.refundStatus === 'REFUNDED')
    }
  }, [visible, depositData])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await request.put(api.depositBankAccount, {
        depositId: depositId,
        userId: userId,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        bankBranch: values.bankBranch
      })

      message.success('收款账号更新成功')
      onSuccess?.()
      onCancel()
    } catch (e) {
      console.error('更新失败', e)
      message.error(e.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="更新收款账号"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      {disabled && (
        <Alert
          type="warning"
          message="账号不可修改"
          description="退款已完成，收款账号不可修改"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          label="银行账号"
          name="bankAccount"
          rules={[
            { required: true, message: '请输入银行账号' },
            { pattern: /^\d{10,30}$/, message: '请输入正确的银行账号' }
          ]}
        >
          <Input placeholder="请输入银行账号" disabled={disabled} maxLength={30} />
        </Form.Item>

        <Form.Item
          label="开户银行"
          name="bankName"
          rules={[{ required: true, message: '请输入开户银行' }]}
        >
          <Input placeholder="请输入开户银行" disabled={disabled} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="开户支行"
          name="bankBranch"
          rules={[{ required: true, message: '请输入开户支行' }]}
        >
          <Input placeholder="请输入开户支行" disabled={disabled} maxLength={100} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading} disabled={disabled}>
              确定
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BankAccountModal
