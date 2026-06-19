import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Content } = Layout

function BasicLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f0f2f5'
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  )
}

export default BasicLayout
