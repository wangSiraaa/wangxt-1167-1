const API_PREFIX = '/api'

const api = {
  login: `${API_PREFIX}/auth/login`,
  logout: `${API_PREFIX}/auth/logout`,
  getUserInfo: `${API_PREFIX}/auth/userinfo`,

  userList: `${API_PREFIX}/system/user/list`,
  userAdd: `${API_PREFIX}/system/user`,
  userUpdate: `${API_PREFIX}/system/user`,
  userDelete: `${API_PREFIX}/system/user`,
  userUpdateBankAccount: `${API_PREFIX}/system/user/bankAccount`,

  itemList: `${API_PREFIX}/auction/item/list`,
  itemDetail: `${API_PREFIX}/auction/item`,
  itemAdd: `${API_PREFIX}/auction/item`,
  itemUpdate: `${API_PREFIX}/auction/item`,
  itemDelete: `${API_PREFIX}/auction/item`,
  itemConfirmDeal: `${API_PREFIX}/auction/item/confirmDeal`,
  itemTailPayment: `${API_PREFIX}/auction/item/tailPayment`,

  bidList: `${API_PREFIX}/auction/bid/list`,

  depositList: `${API_PREFIX}/deposit/list`,
  depositDetail: `${API_PREFIX}/deposit`,
  depositMyList: `${API_PREFIX}/deposit/myList`,
  depositPay: `${API_PREFIX}/deposit/pay`,
  depositBankAccount: `${API_PREFIX}/deposit/bankAccount`,

  refundList: `${API_PREFIX}/refund/list`,
  refundDetail: `${API_PREFIX}/refund`,
  refundApply: `${API_PREFIX}/refund/apply`,
  refundAudit: `${API_PREFIX}/refund/audit`,
  refundComplete: `${API_PREFIX}/refund/complete`,
  refundMyRefund: `${API_PREFIX}/refund/myRefund`,

  deductList: `${API_PREFIX}/deduct/list`,
  deductDetail: `${API_PREFIX}/deduct`,
  deductExecute: `${API_PREFIX}/deduct/execute`,

  fundFlowList: `${API_PREFIX}/fund/flow/list`,
  fundFlowDetail: `${API_PREFIX}/fund/flow`,
  fundFlowMyFlow: `${API_PREFIX}/fund/flow/myFlow`,

  auditLogList: `${API_PREFIX}/system/audit/list`,

  roleList: `${API_PREFIX}/system/role/list`
}

export default api
