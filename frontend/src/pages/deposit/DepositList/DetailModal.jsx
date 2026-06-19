import React, { useState, useEffect } from 'react'
import { Modal, Tabs, Descriptions, Table, Tag, Timeline } from 'antd'
import request from '../../../utils/request'
import { formatMoney, formatDateTime } from '../../../utils/format'
import api from '../../../config/api'

const { TabPane } = Tabs

const PAY_STATUS_MAP = {
  UNPAID: { text: '未缴纳', color: 'default' },
  PAID: { text: '已缴纳', color: 'green' },
  PARTIAL: { text: '部分缴纳', color: 'orange' }
}

const BID_STATUS_MAP = {
  NOT_BID: { text: '未竞买', color: 'default' },
  BIDDING: { text: '竞买中', color: 'blue' },
  WON: { text: '已竞得', color: 'green' },
  LOST: { text: '未竞得', color: 'orange' }
}

const REFUND_STATUS_MAP = {
  NOT_REFUND: { text: '未退款', color: 'default' },
  REFUNDING: { text: '退款中', color: 'blue' },
  REFUNDED: { text: '已退款', color: 'green' },
  REFUND_FAILED: { text: '退款失败', color: 'red' }
}

const DEDUCT_STATUS_MAP = {
  NOT_DEDUCT: { text: '未抵扣', color: 'default' },
  DEDUCTED: { text: '已抵扣', color: 'green' },
  PARTIAL_DEDUCT: { text: '部分抵扣', color: 'orange' }
}

const FLOW_TYPE_MAP = {
  PAY: { text: '保证金缴纳', color: 'green' },
  REFUND: { text: '保证金退款', color: 'red' },
  DEDUCT: { text: '保证金抵扣', color: 'orange' }
}

const FLOW_DIRECTION_MAP = {
  IN: '收入',
  OUT: '支出'
}

function DetailModal({ visible, depositId, onCancel }) {
  const [deposit, setDeposit] = useState(null)
  const [fundFlows, setFundFlows] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && depositId) {
      loadDetail()
    }
  }, [visible, depositId])

  const loadDetail = async () => {
    setLoading(true)
    try {
      const [depositRes, flowRes, logRes] = await Promise.all([
        request.get(`${api.depositDetail}/${depositId}`),
        request.get(api.fundFlowList, { params: { relateId: depositId, current: 1, size: 50 } }),
        request.get(api.auditLogList, { params: { bizId: depositId, current: 1, size: 50 } })
      ])
      setDeposit(depositRes.data)
      setFundFlows(flowRes.data?.records || flowRes.data?.list || [])
      setAuditLogs(logRes.data?.records || logRes.data?.list || [])
    } catch (e) {
      console.error('加载详情失败', e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status, statusMap) => {
    const info = statusMap[status]
    if (!info) return <Tag>{status}</Tag>
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const flowColumns = [
    { title: '流水编号', dataIndex: 'flowNo', key: 'flowNo', width: 180 },
    {
      title: '流水类型',
      dataIndex: 'flowType',
      key: 'flowType',
      width: 120,
      render: (val) => {
        const info = FLOW_TYPE_MAP[val]
        return info ? <Tag color={info.color}>{info.text}</Tag> : val
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (val, record) => (
        <span style={{ color: record.direction === 'IN' ? '#52c41a' : '#ff4d4f' }}>
          {record.direction === 'IN' ? '+' : '-'}
          {formatMoney(val)}
        </span>
      )
    },
    { title: '收支方向', dataIndex: 'direction', key: 'direction', width: 100, render: (val) => FLOW_DIRECTION_MAP[val] || val },
    { title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 100 },
    { title: '流水状态', dataIndex: 'flowStatus', key: 'flowStatus', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, render: (val) => formatDateTime(val) },
    { title: '备注', dataIndex: 'remark', key: 'remark' }
  ]

  const logColumns = [
    { title: '操作类型', dataIndex: 'operateType', key: 'operateType', width: 120 },
    { title: '操作描述', dataIndex: 'operateDesc', key: 'operateDesc' },
    { title: '操作前状态', dataIndex: 'beforeStatus', key: 'beforeStatus', width: 120 },
    { title: '操作后状态', dataIndex: 'afterStatus', key: 'afterStatus', width: 120 },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 100 },
    { title: '操作人角色', dataIndex: 'operatorRole', key: 'operatorRole', width: 100 },
    { title: '操作时间', dataIndex: 'createTime', key: 'createTime', width: 180, render: (val) => formatDateTime(val) },
    { title: '备注', dataIndex: 'remark', key: 'remark' }
  ]

  const statusTimeline = () => {
    const items = []
    if (deposit) {
      items.push({
        color: 'green',
        children: (
          <div>
            <p style={{ margin: 0 }}>创建保证金</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{formatDateTime(deposit.createTime)}</p>
          </div>
        )
      })
      if (deposit.payStatus === 'PAID') {
        items.push({
          color: 'green',
          children: (
            <div>
              <p style={{ margin: 0 }}>保证金缴纳</p>
              <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{formatDateTime(deposit.payTime)}</p>
            </div>
          )
        })
      }
      if (deposit.deductStatus === 'DEDUCTED') {
        items.push({
          color: 'orange',
          children: (
            <div>
              <p style={{ margin: 0 }}>保证金抵扣</p>
              <p style={{ margin: 0, color: '#999', fontSize: 12 }}>抵扣金额：{formatMoney(deposit.deductAmount)}</p>
            </div>
          )
        })
      }
      if (deposit.refundStatus === 'REFUNDED') {
        items.push({
          color: 'blue',
          children: (
            <div>
              <p style={{ margin: 0 }}>保证金退款</p>
              <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{formatDateTime(deposit.refundTime)}</p>
            </div>
          )
        })
      }
    }
    return items
  }

  return (
    <Modal
      title="保证金详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      {deposit && (
        <Tabs defaultActiveKey="base">
          <TabPane tab="基本信息" key="base">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="保证金编号">{deposit.depositNo}</Descriptions.Item>
              <Descriptions.Item label="标的名称">{deposit.itemName || '-'}</Descriptions.Item>
              <Descriptions.Item label="竞买人">{deposit.bidderName || '-'}</Descriptions.Item>
              <Descriptions.Item label="保证金金额">
                <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{formatMoney(deposit.depositAmount)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="缴纳状态">{getStatusTag(deposit.payStatus, PAY_STATUS_MAP)}</Descriptions.Item>
              <Descriptions.Item label="竞买状态">{getStatusTag(deposit.bidStatus, BID_STATUS_MAP)}</Descriptions.Item>
              <Descriptions.Item label="退款状态">{getStatusTag(deposit.refundStatus, REFUND_STATUS_MAP)}</Descriptions.Item>
              <Descriptions.Item label="抵扣状态">{getStatusTag(deposit.deductStatus, DEDUCT_STATUS_MAP)}</Descriptions.Item>
              <Descriptions.Item label="已抵扣金额">{formatMoney(deposit.deductAmount)}</Descriptions.Item>
              <Descriptions.Item label="可退款金额">
                <span style={{ color: '#52c41a' }}>¥{formatMoney(deposit.refundableAmount)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">{deposit.payMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{formatDateTime(deposit.payTime)}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{deposit.remark || '-'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="竞买人信息" key="bidder">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="竞买人姓名">{deposit.bidderName || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{deposit.bidderPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="身份证号">{deposit.bidderIdCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户账号">{deposit.bidderUsername || '-'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="银行账号" key="bank">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="银行账号">{deposit.bankAccount || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户银行">{deposit.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户支行" span={2}>{deposit.bankBranch || '-'}</Descriptions.Item>
              <Descriptions.Item label="账号可编辑" span={2}>
                {deposit.bankAccountEditable === 0 ? '否（退款完成后不可修改' : '是'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="状态流转" key="status">
            <Timeline items={statusTimeline()} />
          </TabPane>

          <TabPane tab="资金流水" key="flow">
            <Table
              columns={flowColumns}
              dataSource={fundFlows}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loading}
            />
          </TabPane>

          <TabPane tab="审核日志" key="audit">
            <Table
              columns={logColumns}
              dataSource={auditLogs}
              rowKey="id"
              size="small"
              pagination={false}
              loading={loading}
            />
          </TabPane>
        </Tabs>
      )}
    </Modal>
  )
}

export default DetailModal
