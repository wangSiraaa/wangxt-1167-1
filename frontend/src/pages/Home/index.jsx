import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'

function Home() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>首页</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="用户总数" value={1234} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="订单数量" value={93} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日访问" value={1128} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="系统消息" value={8} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
