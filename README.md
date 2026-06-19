# 司法拍卖保证金退还系统

## 项目简介

司法拍卖保证金退还系统，实现竞买人、法院财务、拍卖管理员三方协同的保证金管理流程。

## 功能特性

### 核心业务流程

1. **保证金缴纳**：竞买人缴纳拍卖保证金
2. **成交确认**：拍卖管理员确认成交结果
3. **保证金退还**：财务发起保证金退还申请
4. **保证金抵扣**：财务执行保证金抵扣尾款

### 业务规则

- ✅ 成交人未付尾款不能退保证金
- ✅ 未成交人账户信息不完整不能退款
- ✅ 退款完成后不能修改收款账号
- ✅ 完整的资金流水记录
- ✅ 完整的审核痕迹记录

### 角色权限

| 角色 | 功能 |
|------|------|
| 竞买人 | 查看我的保证金、更新收款账号、查看退款记录 |
| 法院财务 | 保证金管理、发起退款、执行抵扣、资金流水查询 |
| 拍卖管理员 | 拍卖标的管理、成交确认、竞买记录查询 |
| 超级管理员 | 用户管理、角色管理、系统设置、操作日志 |

## 技术栈

### 后端
- Java 8 + Spring Boot 2.7.x
- MyBatis-Plus 3.5.x
- MySQL 8.0
- Redis 7.x
- Spring Security + JWT
- Knife4j API文档

### 前端
- React 18 + React Router v6
- Ant Design 5.x
- Axios
- Context API状态管理

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/auction/deposit/
│   │       │   ├── controller/     # 控制器层
│   │       │   ├── service/        # 服务层
│   │       │   ├── mapper/         # 数据访问层
│   │       │   ├── entity/         # 实体类
│   │       │   ├── dto/            # 数据传输对象
│   │       │   ├── security/       # 安全认证
│   │       │   ├── config/         # 配置类
│   │       │   └── common/         # 公共类
│   │       └── resources/
│   └── pom.xml
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── layouts/         # 布局组件
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── utils/           # 工具函数
│   │   ├── config/          # 配置文件
│   │   └── ...
│   └── package.json
├── database/                # 数据库脚本
│   └── schema.sql
├── docker-compose.yml       # Docker Compose配置
└── start.sh                 # 启动脚本
```

## 快速开始

### 方式一：Docker Compose启动（推荐）

```bash
# 一键启动
chmod +x start.sh
./start.sh
```

或手动执行：

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式二：本地开发

#### 后端启动

```bash
cd backend

# 安装依赖
mvn clean install

# 启动服务
mvn spring-boot:run
```

后端服务地址: http://localhost:19467/api  
API文档: http://localhost:19467/api/doc.html

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端地址: http://localhost:20467

## 数据库设计

### 核心数据表

| 表名 | 说明 |
|------|------|
| sys_user | 用户表 |
| sys_role | 角色表 |
| sys_permission | 权限表 |
| auction_item | 拍卖标的物表 |
| auction_bid | 竞买记录表 |
| auction_deposit | 保证金表 |
| refund_apply | 退款申请表 |
| deduct_record | 抵扣记录表 |
| fund_flow | 资金流水表 |
| audit_log | 审核痕迹表 |

### 状态说明

**保证金状态**
- 缴纳状态: unpaid-未支付 paid-已支付 failed-支付失败
- 竞买状态: bidding-竞买中 won-竞得 lost-未竞得
- 退款状态: norefund-未退款 refunding-退款中 refunded-已退款 refund_failed-退款失败
- 抵扣状态: nodeduct-未抵扣 deducted-已抵扣 partial_deducted-部分抵扣

**退款申请状态**
- pending-待审核 approved-已审核 rejected-已驳回 processing-处理中 completed-已完成 failed-失败

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/userinfo` - 获取用户信息
- `POST /api/auth/logout` - 退出登录

### 拍卖管理
- `GET /api/auction/item/list` - 标的列表
- `GET /api/auction/item/{id}` - 标的详情
- `POST /api/auction/item` - 新增标的
- `PUT /api/auction/item` - 修改标的
- `DELETE /api/auction/item/{id}` - 删除标的
- `PUT /api/auction/item/confirmDeal` - 确认成交

### 保证金管理
- `GET /api/deposit/list` - 保证金列表
- `GET /api/deposit/myList` - 我的保证金
- `GET /api/deposit/{id}` - 保证金详情
- `POST /api/deposit/pay` - 缴纳保证金
- `PUT /api/deposit/bankAccount` - 更新收款账号

### 退款管理
- `GET /api/refund/list` - 退款申请列表
- `POST /api/refund/apply` - 发起退款申请
- `PUT /api/refund/audit` - 审核退款
- `PUT /api/refund/complete` - 确认退款完成

### 抵扣管理
- `GET /api/deduct/list` - 抵扣记录列表
- `POST /api/deduct/execute` - 执行抵扣

### 资金流水
- `GET /api/fund/flow/list` - 资金流水列表
- `GET /api/fund/flow/{id}` - 流水详情

### 系统管理
- `GET /api/system/user/list` - 用户列表
- `POST /api/system/user` - 新增用户
- `PUT /api/system/user` - 修改用户
- `DELETE /api/system/user/{id}` - 删除用户
- `GET /api/system/audit/list` - 操作日志

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |
| bidder01 | 123456 | 竞买人 |
| bidder02 | 123456 | 竞买人 |
| finance01 | 123456 | 法院财务 |
| admin01 | 123456 | 拍卖管理员 |

## 业务流程说明

### 保证金退还流程

1. **竞买人缴纳保证金**
   - 选择拍卖标的
   - 确认保证金金额
   - 完成支付
   - 系统生成保证金记录和资金流水

2. **管理员确认成交**
   - 拍卖结束后，管理员确认竞得人
   - 系统更新所有竞买人的竞买状态（won/lost）
   - 更新保证金的竞买状态

3. **财务发起退款**
   - **竞得人**：需付清尾款后才能退还保证金（或抵扣尾款）
   - **未竞得人**：需银行账户信息完整才能退款
   - 财务选择保证金记录，填写退款信息
   - 提交退款申请，锁定收款账号

4. **审核退款（可选）**
   - 管理员/财务主管审核退款申请
   - 审核通过进入支付流程，审核驳回则解锁账号

5. **确认退款完成**
   - 支付成功后，确认退款完成
   - 更新保证金状态为已退款
   - 生成退款资金流水
   - 记录审核日志

### 保证金抵扣流程

1. 财务选择需要抵扣的保证金
2. 填写抵扣金额和原因
3. 执行抵扣
4. 更新保证金抵扣状态
5. 生成抵扣资金流水和审核日志

## 开发说明

### 后端开发规范

- 统一返回格式：`{ code, message, data }`
- 分页参数：`current`, `size`
- 异常处理：统一异常拦截，返回业务异常信息
- 事务管理：使用 `@Transactional` 保证数据一致性
- 操作日志：关键操作记录审核日志

### 前端开发规范

- 使用 Function Component + Hooks
- 页面组件按功能模块划分
- 统一使用 Ant Design 组件
- API 请求使用封装的 request 工具
- 状态管理使用 Context API

## 注意事项

1. 生产环境请修改默认密码
2. 请妥善保管数据库和Redis密码
3. 建议配置HTTPS
4. 定期备份数据库
5. 大额资金操作建议增加二次验证

## License

MIT License
