import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Tag, message, Descriptions, Button } from 'antd'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'

const REFUND_TYPE_MAP = {
  FULL: { text: '全额退款', color: 'green' },
  PARTIAL: { text: '部分退款', color: 'blue' }
}

function AuditModal({ visible, refundId, refundData, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (visible && refundId) {
      loadDetail()
    }
    if (visible) {
      form.resetFields()
    }
  }, [visible, refundId])

  const loadDetail = async () => {
    try {
      const res = await request.get(`${api.refundDetail}/${refundId}`)
      setDetail(res.data)
    } catch (e) {
      console.error('加载退款详情失败', e)
      message.error('加载详情失败')
    }
  }

  const handleAudit = async (auditResult) => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await request.post(api.refundAudit, {
        refundId: refundId,
        auditResult: auditResult,
        auditOpinion: values.auditOpinion
      })
      message.success(auditResult === 'APPROVED' ? '审核通过' : '已驳回')
      onSuccess && onSuccess()
    } catch (e) {
      console.error('审核失败', e)
      message.error(e.message || '审核失败')
    } finally {
      setLoading(false)
    }
  }

  const renderTypeTag = (type) => {
    const info = REFUND_TYPE_MAP[type]
    if (!info) return <Tag>{type}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  return (
    <Modal
      title="退款审核"
      open={visible}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="reject" danger onClick={() => handleAudit('REJECTED')} loading={loading}>
          驳回
        </Button>,
        <Button key="approve" type="primary" onClick={() => handleAudit('APPROVED')} loading={loading}>
          通过
        </Button>
      ]}
      destroyOnClose
    >
      {detail && (
        <div>
          <Descriptions title="退款申请信息" column={1} size="small" bordered>
            <Descriptions.Item label="退款编号">{detail.refundNo}</Descriptions.Item>
            <Descriptions.Item label="保证金编号">{detail.depositNo}</Descriptions.Item>
            <Descriptions.Item label="标的名称">{detail.itemName}</Descriptions.Item>
            <Descriptions.Item label="竞买人">{detail.bidderName}</Descriptions.Item>
            <Descriptions.Item label="退款类型">{renderTypeTag(detail.refundType)}</Descriptions.Item>
            <Descriptions.Item label="退款金额">
              <span style={{ color: '#f5222d', fontWeight: 500 }}>
                ¥{formatMoney(detail.refundAmount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="退款原因">{detail.refundReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{formatDateTime(detail.createTime)}</Descriptions.Item>
            <Descriptions.Item label="申请人">{detail.applyUserName || '-'}</Descriptions.Item>
          </Descriptions>

          {detail.bankAccountName && (
            <Descriptions title="收款信息" column={1} size="small" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="开户名">{detail.bankAccountName}</Descriptions.Item>
              <Descriptions.Item label="开户银行">{detail.bankName}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{detail.bankAccountNo}</Descriptions.Item>
            </Descriptions>
          )}

          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="审核意见"
              name="auditOpinion"
              rules={[{ required: true, message: '请输入审核意见' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入审核意见" />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  )
}

export default AuditModal
