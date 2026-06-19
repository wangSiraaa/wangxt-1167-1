import React, { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import request from '../../../utils/request'
import api from '../../../config/api'

function FailModal({ visible, refundId, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await request.put(api.refundFail, null, {
        params: {
          refundId,
          failReason: values.failReason
        }
      })
      message.success('标记失败成功')
      form.resetFields()
      onSuccess && onSuccess()
    } catch (e) {
      console.error('标记退款失败', e)
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
      title="标记退款失败"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认标记"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="失败原因"
          name="failReason"
          rules={[{ required: true, message: '请输入失败原因' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入退款失败原因" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FailModal
