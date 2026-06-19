import React, { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { Spin } from 'antd'
import routes from './router'
import { UserProvider } from './store/userStore'

function App() {
  const element = useRoutes(routes)
  return (
    <UserProvider>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}
          >
            <Spin size="large" />
          </div>
        }
      >
        {element}
      </Suspense>
    </UserProvider>
  )
}

export default App
