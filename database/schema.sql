-- =============================================
-- 司法拍卖保证金退还系统 - 数据库设计
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS auction_deposit DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auction_deposit;

-- =============================================
-- 1. 用户表
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    id_card VARCHAR(18) COMMENT '身份证号',
    bank_account VARCHAR(50) COMMENT '银行账号',
    bank_name VARCHAR(100) COMMENT '开户银行',
    bank_branch VARCHAR(100) COMMENT '开户支行',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 角色表
-- =============================================
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- =============================================
-- 3. 用户角色关联表
-- =============================================
DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- =============================================
-- 4. 权限表
-- =============================================
DROP TABLE IF EXISTS sys_permission;
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    perm_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    perm_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    perm_type VARCHAR(20) DEFAULT 'menu' COMMENT '权限类型：menu-菜单 button-按钮',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    url VARCHAR(200) COMMENT '路由地址',
    icon VARCHAR(50) COMMENT '图标',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- =============================================
-- 5. 角色权限关联表
-- =============================================
DROP TABLE IF EXISTS sys_role_permission;
CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_perm (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- =============================================
-- 6. 拍卖标的物表
-- =============================================
DROP TABLE IF EXISTS auction_item;
CREATE TABLE auction_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标的物ID',
    item_code VARCHAR(50) NOT NULL UNIQUE COMMENT '标的编号',
    item_name VARCHAR(200) NOT NULL COMMENT '标的名称',
    item_type VARCHAR(50) COMMENT '标的类型：房产-车辆-股权-其他',
    item_desc TEXT COMMENT '标的描述',
    court_name VARCHAR(200) NOT NULL COMMENT '法院名称',
    starting_price DECIMAL(15,2) NOT NULL COMMENT '起拍价',
    deposit_amount DECIMAL(15,2) NOT NULL COMMENT '保证金金额',
    auction_start_time DATETIME NOT NULL COMMENT '拍卖开始时间',
    auction_end_time DATETIME NOT NULL COMMENT '拍卖结束时间',
    item_status VARCHAR(20) DEFAULT 'pending' COMMENT '标的状态：pending-待开始 ongoing-进行中 ended-已结束 suspended-已中止',
    deal_status VARCHAR(20) DEFAULT 'undealed' COMMENT '成交状态：undealed-未成交 dealed-已成交',
    winner_id BIGINT COMMENT '竞得人ID',
    deal_price DECIMAL(15,2) COMMENT '成交价',
    deal_time DATETIME COMMENT '成交时间',
    tail_paid_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '尾款支付状态：unpaid-未支付 partial-部分支付 paid-已支付',
    tail_paid_amount DECIMAL(15,2) DEFAULT 0 COMMENT '已付尾款金额',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT COMMENT '更新人ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_item_status (item_status),
    INDEX idx_deal_status (deal_status),
    INDEX idx_auction_time (auction_start_time, auction_end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拍卖标的物表';

-- =============================================
-- 7. 竞买记录表
-- =============================================
DROP TABLE IF EXISTS auction_bid;
CREATE TABLE auction_bid (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '竞买记录ID',
    item_id BIGINT NOT NULL COMMENT '标的物ID',
    bidder_id BIGINT NOT NULL COMMENT '竞买人ID',
    bid_price DECIMAL(15,2) NOT NULL COMMENT '出价金额',
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '出价时间',
    is_winner TINYINT DEFAULT 0 COMMENT '是否竞得：0-否 1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_item_id (item_id),
    INDEX idx_bidder_id (bidder_id),
    INDEX idx_is_winner (is_winner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='竞买记录表';

-- =============================================
-- 8. 保证金表
-- =============================================
DROP TABLE IF EXISTS auction_deposit;
CREATE TABLE auction_deposit (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '保证金ID',
    deposit_no VARCHAR(50) NOT NULL UNIQUE COMMENT '保证金编号',
    item_id BIGINT NOT NULL COMMENT '标的物ID',
    bidder_id BIGINT NOT NULL COMMENT '竞买人ID',
    deposit_amount DECIMAL(15,2) NOT NULL COMMENT '保证金金额',
    pay_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '缴纳状态：unpaid-未支付 paid-已支付 failed-支付失败',
    pay_time DATETIME COMMENT '支付时间',
    pay_method VARCHAR(20) COMMENT '支付方式：bank_transfer-银行转账 online-在线支付',
    pay_order_no VARCHAR(100) COMMENT '支付流水号',
    bid_status VARCHAR(20) DEFAULT 'bidding' COMMENT '竞买状态：bidding-竞买中 won-竞得 lost-未竞得',
    refund_status VARCHAR(20) DEFAULT 'norefund' COMMENT '退款状态：norefund-未退款 refunding-退款中 refunded-已退款 refund_failed-退款失败',
    deduct_status VARCHAR(20) DEFAULT 'nodeduct' COMMENT '抵扣状态：nodeduct-未抵扣 deducted-已抵扣 partial_deducted-部分抵扣',
    deduct_amount DECIMAL(15,2) DEFAULT 0 COMMENT '已抵扣金额',
    refundable_amount DECIMAL(15,2) DEFAULT 0 COMMENT '可退款金额',
    refund_time DATETIME COMMENT '退款时间',
    bank_account_editable TINYINT DEFAULT 1 COMMENT '收款账号是否可修改：1-可修改 0-不可修改',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_deposit_no (deposit_no),
    INDEX idx_item_id (item_id),
    INDEX idx_bidder_id (bidder_id),
    INDEX idx_pay_status (pay_status),
    INDEX idx_refund_status (refund_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保证金表';

-- =============================================
-- 9. 退款申请表
-- =============================================
DROP TABLE IF EXISTS refund_apply;
CREATE TABLE refund_apply (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '退款申请ID',
    refund_no VARCHAR(50) NOT NULL UNIQUE COMMENT '退款编号',
    deposit_id BIGINT NOT NULL COMMENT '保证金ID',
    item_id BIGINT NOT NULL COMMENT '标的物ID',
    bidder_id BIGINT NOT NULL COMMENT '竞买人ID',
    refund_amount DECIMAL(15,2) NOT NULL COMMENT '退款金额',
    refund_type VARCHAR(20) NOT NULL COMMENT '退款类型：full-全额退款 partial-部分退款',
    refund_reason VARCHAR(500) COMMENT '退款原因',
    bank_account VARCHAR(50) COMMENT '收款银行账号',
    bank_name VARCHAR(100) COMMENT '开户银行',
    bank_branch VARCHAR(100) COMMENT '开户支行',
    payee_name VARCHAR(50) COMMENT '收款人姓名',
    apply_status VARCHAR(20) DEFAULT 'pending' COMMENT '申请状态：pending-待审核 approved-已审核 rejected-已驳回 processing-处理中 completed-已完成 failed-失败',
    apply_by BIGINT COMMENT '申请人ID（财务）',
    apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    auditor_id BIGINT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(500) COMMENT '审核意见',
    pay_order_no VARCHAR(100) COMMENT '退款支付流水号',
    complete_time DATETIME COMMENT '完成时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_refund_no (refund_no),
    INDEX idx_deposit_id (deposit_id),
    INDEX idx_bidder_id (bidder_id),
    INDEX idx_apply_status (apply_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款申请表';

-- =============================================
-- 10. 抵扣记录表
-- =============================================
DROP TABLE IF EXISTS deduct_record;
CREATE TABLE deduct_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '抵扣记录ID',
    deduct_no VARCHAR(50) NOT NULL UNIQUE COMMENT '抵扣编号',
    deposit_id BIGINT NOT NULL COMMENT '保证金ID',
    item_id BIGINT NOT NULL COMMENT '标的物ID',
    bidder_id BIGINT NOT NULL COMMENT '竞买人ID',
    deduct_amount DECIMAL(15,2) NOT NULL COMMENT '抵扣金额',
    deduct_type VARCHAR(20) NOT NULL COMMENT '抵扣类型：tail_payment-抵扣尾款 other-其他',
    deduct_reason VARCHAR(500) COMMENT '抵扣原因',
    operator_id BIGINT COMMENT '操作人ID（财务）',
    operate_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_deduct_no (deduct_no),
    INDEX idx_deposit_id (deposit_id),
    INDEX idx_item_id (item_id),
    INDEX idx_bidder_id (bidder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抵扣记录表';

-- =============================================
-- 11. 资金流水表
-- =============================================
DROP TABLE IF EXISTS fund_flow;
CREATE TABLE fund_flow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '流水ID',
    flow_no VARCHAR(50) NOT NULL UNIQUE COMMENT '流水编号',
    flow_type VARCHAR(20) NOT NULL COMMENT '流水类型：deposit_pay-保证金缴纳 deposit_refund-保证金退款 deposit_deduct-保证金抵扣 tail_pay-尾款支付',
    amount DECIMAL(15,2) NOT NULL COMMENT '交易金额',
    direction VARCHAR(10) NOT NULL COMMENT '资金方向：in-收入 out-支出',
    relate_type VARCHAR(20) COMMENT '关联类型：deposit-保证金 refund-退款 deduct-抵扣',
    relate_id BIGINT COMMENT '关联业务ID',
    item_id BIGINT COMMENT '标的物ID',
    user_id BIGINT COMMENT '用户ID',
    pay_method VARCHAR(20) COMMENT '支付方式',
    pay_order_no VARCHAR(100) COMMENT '支付流水号',
    flow_status VARCHAR(20) DEFAULT 'success' COMMENT '流水状态：success-成功 failed-失败 processing-处理中',
    remark VARCHAR(500) COMMENT '备注',
    operator_id BIGINT COMMENT '操作人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_flow_no (flow_no),
    INDEX idx_flow_type (flow_type),
    INDEX idx_relate (relate_type, relate_id),
    INDEX idx_user_id (user_id),
    INDEX idx_item_id (item_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金流水表';

-- =============================================
-- 12. 审核痕迹表
-- =============================================
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    biz_type VARCHAR(50) NOT NULL COMMENT '业务类型：deposit_pay-保证金缴纳 deposit_confirm-成交确认 refund_apply-退款申请 refund_audit-退款审核 refund_complete-退款完成 deduct-保证金抵扣',
    biz_id BIGINT NOT NULL COMMENT '业务ID',
    biz_no VARCHAR(50) COMMENT '业务编号',
    operate_type VARCHAR(20) NOT NULL COMMENT '操作类型：create-创建 update-更新 submit-提交 approve-通过 reject-驳回 cancel-取消',
    operate_desc VARCHAR(500) COMMENT '操作描述',
    before_status VARCHAR(20) COMMENT '操作前状态',
    after_status VARCHAR(20) COMMENT '操作后状态',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    operator_role VARCHAR(50) COMMENT '操作人角色',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_biz (biz_type, biz_id),
    INDEX idx_operator (operator_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核痕迹表';

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化角色
INSERT INTO sys_role (role_code, role_name, description) VALUES
('bidder', '竞买人', '参与司法拍卖的竞买人'),
('court_finance', '法院财务', '负责保证金退还、抵扣的财务人员'),
('auction_admin', '拍卖管理员', '负责拍卖管理、成交确认的管理员'),
('super_admin', '超级管理员', '系统超级管理员');

-- 初始化权限
INSERT INTO sys_permission (perm_code, perm_name, perm_type, parent_id, sort_order, url, icon) VALUES
('dashboard', '工作台', 'menu', 0, 1, '/dashboard', 'DashboardOutlined'),
('auction', '拍卖管理', 'menu', 0, 2, '/auction', 'HddOutlined'),
('auction:item', '标的物管理', 'menu', 2, 1, '/auction/item', ''),
('auction:bid', '竞买记录', 'menu', 2, 2, '/auction/bid', ''),
('deposit', '保证金管理', 'menu', 0, 3, '/deposit', 'DollarOutlined'),
('deposit:list', '保证金列表', 'menu', 5, 1, '/deposit/list', ''),
('deposit:pay', '保证金缴纳', 'menu', 5, 2, '/deposit/pay', ''),
('refund', '退款管理', 'menu', 0, 4, '/refund', 'RedoOutlined'),
('refund:apply', '退款申请', 'menu', 8, 1, '/refund/apply', ''),
('refund:audit', '退款审核', 'menu', 8, 2, '/refund/audit', ''),
('refund:list', '退款记录', 'menu', 8, 3, '/refund/list', ''),
('deduct', '抵扣管理', 'menu', 0, 5, '/deduct', 'PlusOutlined'),
('deduct:list', '抵扣记录', 'menu', 12, 1, '/deduct/list', ''),
('fund', '资金流水', 'menu', 0, 6, '/fund', 'WalletOutlined'),
('fund:flow', '流水查询', 'menu', 14, 1, '/fund/flow', ''),
('system', '系统管理', 'menu', 0, 7, '/system', 'SettingOutlined'),
('system:user', '用户管理', 'menu', 16, 1, '/system/user', ''),
('system:role', '角色管理', 'menu', 16, 2, '/system/role', ''),
('system:audit', '操作日志', 'menu', 16, 3, '/system/audit', '');

-- 初始化超级管理员用户 (密码: 123456)
INSERT INTO sys_user (username, password, real_name, phone, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '超级管理员', '13800000000', 1);

-- 给超级管理员分配角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 4);

-- 初始化测试用户
INSERT INTO sys_user (username, password, real_name, phone, id_card, bank_account, bank_name, bank_branch, status) VALUES
('bidder01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', '13900000001', '110101199001011234', '6222021234567890123', '中国工商银行', '北京朝阳支行', 1),
('bidder02', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李四', '13900000002', '110101199002022345', '6222021234567890456', '中国建设银行', '上海浦东支行', 1),
('finance01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王财务', '13700000001', NULL, NULL, NULL, NULL, 1),
('admin01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵管理员', '13600000001', NULL, NULL, NULL, NULL, 1);

-- 分配角色
INSERT INTO sys_user_role (user_id, role_id) VALUES
(2, 1),
(3, 1),
(4, 2),
(5, 3);

-- 初始化测试拍卖标的
INSERT INTO auction_item (item_code, item_name, item_type, item_desc, court_name, starting_price, deposit_amount, auction_start_time, auction_end_time, item_status, create_by) VALUES
('PM2024001', '北京市朝阳区某小区101室房产', '房产', '建筑面积89.5平方米，位于3层，南北通透', '北京市朝阳区人民法院', 5000000.00, 500000.00, '2024-01-15 10:00:00', '2024-01-16 10:00:00', 'ended', 5),
('PM2024002', '京A12345宝马X5越野车', '车辆', '2020款宝马X5 xDrive30i，行驶里程3.5万公里', '北京市海淀区人民法院', 450000.00, 45000.00, '2024-01-20 10:00:00', '2024-01-21 10:00:00', 'ongoing', 5),
('PM2024003', '某科技有限公司30%股权', '股权', '某科技有限公司注册资本1000万，对应30%股权', '北京市西城区人民法院', 2000000.00, 200000.00, '2024-02-01 10:00:00', '2024-02-02 10:00:00', 'pending', 5);

-- 初始化测试保证金记录
INSERT INTO auction_deposit (deposit_no, item_id, bidder_id, deposit_amount, pay_status, pay_time, pay_method, pay_order_no, bid_status, refund_status, refundable_amount, bank_account_editable) VALUES
('BZJ202401001', 1, 2, 500000.00, 'paid', '2024-01-10 14:30:00', 'bank_transfer', 'PAY20240110001', 'won', 'norefund', 500000.00, 0),
('BZJ202401002', 1, 3, 500000.00, 'paid', '2024-01-11 09:15:00', 'bank_transfer', 'PAY20240111001', 'lost', 'norefund', 500000.00, 1),
('BZJ202401003', 2, 2, 45000.00, 'paid', '2024-01-18 16:00:00', 'online', 'PAY20240118001', 'bidding', 'norefund', 45000.00, 1);

-- 初始化测试竞买记录
INSERT INTO auction_bid (item_id, bidder_id, bid_price, bid_time, is_winner) VALUES
(1, 2, 5100000.00, '2024-01-15 10:30:00', 1),
(1, 3, 5050000.00, '2024-01-15 10:20:00', 0),
(2, 2, 460000.00, '2024-01-20 11:00:00', 0);

-- 初始化资金流水
INSERT INTO fund_flow (flow_no, flow_type, amount, direction, relate_type, relate_id, item_id, user_id, pay_method, pay_order_no, flow_status, operator_id) VALUES
('LS20240110001', 'deposit_pay', 500000.00, 'in', 'deposit', 1, 1, 2, 'bank_transfer', 'PAY20240110001', 'success', 2),
('LS20240111001', 'deposit_pay', 500000.00, 'in', 'deposit', 2, 1, 3, 'bank_transfer', 'PAY20240111001', 'success', 3),
('LS20240118001', 'deposit_pay', 45000.00, 'in', 'deposit', 3, 2, 2, 'online', 'PAY20240118001', 'success', 2);

-- 初始化审核痕迹
INSERT INTO audit_log (biz_type, biz_id, biz_no, operate_type, operate_desc, before_status, after_status, operator_id, operator_name, operator_role) VALUES
('deposit_pay', 1, 'BZJ202401001', 'create', '张三缴纳拍卖保证金50万元', 'unpaid', 'paid', 2, '张三', 'bidder'),
('deposit_pay', 2, 'BZJ202401002', 'create', '李四缴纳拍卖保证金50万元', 'unpaid', 'paid', 3, '李四', 'bidder'),
('deposit_pay', 3, 'BZJ202401003', 'create', '张三缴纳拍卖保证金4.5万元', 'unpaid', 'paid', 2, '张三', 'bidder');
