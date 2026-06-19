const API_PREFIX = '/api'

const api = {
  login: `${API_PREFIX}/auth/login`,
  logout: `${API_PREFIX}/auth/logout`,
  getUserInfo: `${API_PREFIX}/user/info`,
  getUserList: `${API_PREFIX}/user/list`,

  depositList: `${API_PREFIX}/deposit/list`,
  depositDetail: `${API_PREFIX}/deposit`,
  depositMyList: `${API_PREFIX}/deposit/myList`,
  depositPay: `${API_PREFIX}/deposit/pay`,
  depositBankAccount: `${API_PREFIX}/deposit/bankAccount`,

  itemList: `${API_PREFIX}/item/list`,
  itemDetail: `${API_PREFIX}/item`,

  fundFlowList: `${API_PREFIX}/fund/flow/list`,

  auditLogList: `${API_PREFIX}/system/audit/list`,

  refundApply: `${API_PREFIX}/refund/apply`,
  refundList: `${API_PREFIX}/refund/list`,
  refundDetail: `${API_PREFIX}/refund`,
  refundAudit: `${API_PREFIX}/refund/audit`,
  refundConfirm: `${API_PREFIX}/refund/confirm`,

  deductExecute: `${API_PREFIX}/deduct/execute`,
  deductList: `${API_PREFIX}/deduct/list`,
  deductDetail: `${API_PREFIX}/deduct`
}

export default api
