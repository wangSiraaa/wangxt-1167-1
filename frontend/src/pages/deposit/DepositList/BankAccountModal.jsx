import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Space, Alert, Descriptions } from 'antd'
import request from '../../../utils/request'
import api from '../../../config/api'
import { formatDateTime } from '../../../utils/format'

function BankAccountModal({ visible, depositId, depositData, onCancel, onSuccess, userId }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [lockInfo, setLockInfo] = useState(null)

  useEffect(() => {
    if (visible && depositData) {
      form.setFieldsValue({
        bankAccount: depositData.bankAccount,
        bankName: depositData.bankName,
        bankBranch: depositData.bankBranch,
        payeeName: depositData.payeeName
      })
      const isRefunded = depositData.refundStatus === 'REFUNDED' || depositData.refundStatus === 'refunded'
      const isLocked = depositData.bankAccountEditable === 0
      const isLockedByAccount = depositData.bankAccountLockTime !== null && depositData.bankAccountLockTime !== undefined
      setDisabled(isRefunded || isLocked)
      if (isLockedByAccount) {
        setLockInfo({
          lockTime: depositData.bankAccountLockTime,
          lockBy: depositData.bankAccountLockBy || '系统'
        })
      } else if (isRefunded) {
        setLockInfo({
          lockTime: null,
          lockBy: '退款已完成'
        })
      } else {
        setLockInfo(null)
      }
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
        bankBranch: values.bankBranch,
        payeeName: values.payeeName
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
      title="维护收款账号"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnClose
    >
      {lockInfo && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <Space direction="vertical" size={4}>
              <strong>收款账号已锁定</strong>
              {lockInfo.lockTime && (
                <span>锁定时间：{formatDateTime(lockInfo.lockTime)}</span>
              )}
              {lockInfo.lockBy && (
                <span>锁定人：{lockInfo.lockBy}</span>
              )}
              <span style={{ color: '#999', fontSize: 12 }}>
                退款申请处理中或已完成时，收款账号不可修改
              </span>
            </Space>
          }
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          label="收款人姓名"
          name="payeeName"
          rules={[{ required: true, message: '请输入收款人姓名' }]}
        >
          <Input placeholder="请输入收款人姓名" disabled={disabled} maxLength={50} />
        </Form.Item>

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
          <Input placeholder="请输入开户银行，如：中国工商银行" disabled={disabled} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="开户支行"
          name="bankBranch"
          rules={[{ required: true, message: '请输入开户支行' }]}
        >
          <Input placeholder="请输入开户支行，如：北京海淀支行" disabled={disabled} maxLength={100} />
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
