export function formatMoney(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00'
  }
  const num = Number(value)
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatDate(value, format = 'YYYY-MM-DD') {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(value) {
  return formatDate(value, 'YYYY-MM-DD HH:mm:ss')
}

export function formatStatus(status, statusMap) {
  if (status === null || status === undefined) return '-'
  return statusMap[status] || status
}

export const STATUS_MAP = {
  0: '禁用',
  1: '启用'
}

export const AUDIT_STATUS_MAP = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝'
}
