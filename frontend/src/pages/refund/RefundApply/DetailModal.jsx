import React, { useState, useEffect } from 'react'
import { Modal, Descriptions, Tag, Timeline, message } from 'antd'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'

const REFUND_STATUS_MAP = {
  PENDING: { text: '待审核', color: 'orange' },
  APPROVED: { text: '审核通过', color: 'blue' },
  REJECTED: { text: '审核驳回', color: 'red' },
  PROCESSING: { text: '处理中', color: 'blue' },
  COMPLETED: { text: '已完成', color: 'green' },
  FAILED: { text: '失败', color: 'red' }
}

const REFUND_TYPE_MAP = {
  FULL: { text: '全额退款', color: 'green' },
  PARTIAL: { text: '部分退款', color: 'blue' }
}

function DetailModal({ visible, refundId, onCancel }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && refundId) {
      loadDetail()
    }
  }, [visible, refundId])

  const loadDetail = async () => {
    setLoading(true)
    try {
      const res = await request.get(`${api.refundDetail}/${refundId}`)
      setDetail(res.data)
    } catch (e) {
      console.error('加载退款详情失败', e)
      message.error('加载详情失败')
    } finally {
      setLoading(false)
    }
  }

  const renderStatusTag = (status) => {
    const info = REFUND_STATUS_MAP[status]
    if (!info) return <Tag>{status}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const renderTypeTag = (type) => {
    const info = REFUND_TYPE_MAP[type]
    if (!info) return <Tag>{type}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getTimelineItems = () => {
    if (!detail) return []
    const items = []
    
    items.push({
      color: 'green',
      children: (
        <div>
          <p style={{ margin: 0, fontWeight: 500 }}>提交申请</p>
          <p style={{ margin: 0, color: '#888', fontSize: 12 }}>{formatDateTime(detail.createTime)}</p>
          <p style={{ margin: 0 }}>申请人：{detail.applyUserName || '-'}</p>
        </div>
      )
    })

    if (detail.auditTime || detail.auditUserName) {
      const isApproved = detail.status === 'APPROVED' || detail.status === 'PROCESSING' || detail.status === 'COMPLETED'
      items.push({
        color: isApproved ? 'green' : 'red',
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {isApproved ? '审核通过' : '审核驳回'}
            </p>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>
              {detail.auditTime ? formatDateTime(detail.auditTime) : '-'}
            </p>
            <p style={{ margin: 0 }}>审核人：{detail.auditUserName || '-'}</p>
            {detail.auditOpinion && <p style={{ margin: 0 }}>审核意见：{detail.auditOpinion}</p>}
          </div>
        )
      })
    }

    if (detail.status === 'PROCESSING' || detail.status === 'COMPLETED' || detail.status === 'FAILED') {
      items.push({
        color: detail.status === 'FAILED' ? 'red' : 'blue',
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {detail.status === 'COMPLETED' ? '退款完成' : detail.status === 'FAILED' ? '退款失败' : '退款处理中'}
            </p>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>
              {detail.processTime ? formatDateTime(detail.processTime) : '-'}
            </p>
            {detail.processRemark && <p style={{ margin: 0 }}>处理说明：{detail.processRemark}</p>}
          </div>
        )
      })
    }

    if (detail.status === 'COMPLETED' && detail.completeTime) {
      items.push({
        color: 'green',
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>确认完成</p>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>{formatDateTime(detail.completeTime)}</p>
            <p style={{ margin: 0 }}>操作人：{detail.completeUserName || '-'}</p>
          </div>
        )
      })
    }

    return items
  }

  return (
    <Modal
      title="退款详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      {detail && (
        <div>
          <Descriptions title="基本信息" column={2} size="small" bordered>
            <Descriptions.Item label="退款编号" span={1}>
              {detail.refundNo}
            </Descriptions.Item>
            <Descriptions.Item label="申请状态" span={1}>
              {renderStatusTag(detail.status)}
            </Descriptions.Item>
            <Descriptions.Item label="退款类型" span={1}>
              {renderTypeTag(detail.refundType)}
            </Descriptions.Item>
            <Descriptions.Item label="退款金额" span={1}>
              <span style={{ color: '#f5222d', fontWeight: 500 }}>
                ¥{formatMoney(detail.refundAmount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间" span={1}>
              {formatDateTime(detail.createTime)}
            </Descriptions.Item>
            <Descriptions.Item label="申请人" span={1}>
              {detail.applyUserName || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions title="保证金信息" column={2} size="small" bordered style={{ marginTop: 16 }}>
            <Descriptions.Item label="保证金编号" span={1}>
              {detail.depositNo}
            </Descriptions.Item>
            <Descriptions.Item label="标的名称" span={1}>
              {detail.itemName}
            </Descriptions.Item>
            <Descriptions.Item label="竞买人" span={1}>
              {detail.bidderName}
            </Descriptions.Item>
            <Descriptions.Item label="保证金金额" span={1}>
              ¥{formatMoney(detail.depositAmount)}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions title="收款信息" column={1} size="small" bordered style={{ marginTop: 16 }}>
            <Descriptions.Item label="开户名">
              {detail.bankAccountName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开户银行">
              {detail.bankName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="银行账号">
              {detail.bankAccountNo || '-'}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 12 }}>退款原因</h4>
            <p style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, margin: 0 }}>
              {detail.refundReason || '-'}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 12 }}>状态流转</h4>
            <Timeline items={getTimelineItems()} />
          </div>

          {detail.auditList && detail.auditList.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>审核记录</h4>
              {detail.auditList.map((audit, index) => (
                <div
                  key={index}
                  style={{ padding: 12, background: '#f5f5f5', borderRadius: 6, marginBottom: 8 }}
                >
                  <p style={{ margin: '0 0 4px 0' }}>
                    <span style={{ fontWeight: 500 }}>{audit.auditUserName || '-'}</span>
                    <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                      {audit.auditTime ? formatDateTime(audit.auditTime) : '-'}
                    </span>
                    <Tag style={{ marginLeft: 8 }} color={audit.auditResult === 'APPROVED' ? 'green' : 'red'}>
                      {audit.auditResult === 'APPROVED' ? '通过' : '驳回'}
                    </Tag>
                  </p>
                  {audit.auditOpinion && <p style={{ margin: 0 }}>意见：{audit.auditOpinion}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default DetailModal
