import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, message } from 'antd'
import request from '../../../utils/request'
import api from '../../../config/api'

function ReapplyModal({ visible, originalRefund, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && originalRefund) {
      form.setFieldsValue({
        bankAccount: originalRefund.bankAccount,
        bankName: originalRefund.bankName,
        bankBranch: originalRefund.bankBranch,
        payeeName: originalRefund.payeeName,
        refundReason: '退款失败后重提申请'
      })
    } else {
      form.resetFields()
    }
  }, [visible, originalRefund])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await request.post(api.refundReapply, values, {
        params: {
          originalRefundId: originalRefund.id
        }
      })
      message.success('重提申请成功')
      form.resetFields()
      onSuccess && onSuccess()
    } catch (e) {
      console.error('重提退款申请失败', e)
      message.error(e.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel && onCancel()
  }

  return (
    <Modal
      title="重提退款申请"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="提交申请"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <div style={{ marginBottom: 12, color: '#666' }}>
        原退款编号：{originalRefund?.refundNo}，原失败原因：{originalRefund?.failReason || '-'}
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          label="收款人姓名"
          name="payeeName"
          rules={[{ required: true, message: '请输入收款人姓名' }]}
        >
          <Input placeholder="请输入收款人姓名" />
        </Form.Item>
        <Form.Item
          label="收款银行账号"
          name="bankAccount"
          rules={[{ required: true, message: '请输入收款银行账号' }]}
        >
          <Input placeholder="请输入收款银行账号" />
        </Form.Item>
        <Form.Item
          label="开户银行"
          name="bankName"
          rules={[{ required: true, message: '请输入开户银行' }]}
        >
          <Input placeholder="请输入开户银行，如：中国工商银行" />
        </Form.Item>
        <Form.Item
          label="开户支行"
          name="bankBranch"
          rules={[{ required: true, message: '请输入开户支行' }]}
        >
          <Input placeholder="请输入开户支行，如：北京海淀支行" />
        </Form.Item>
        <Form.Item label="退款原因" name="refundReason">
          <Input.TextArea rows={3} placeholder="请输入退款原因（选填）" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ReapplyModal
