import React from 'react'
import { Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import BasicLayout from '../layouts/BasicLayout'
import Login from '../pages/Login'

const Dashboard = React.lazy(() => import('../pages/Dashboard'))
const AuctionItem = React.lazy(() => import('../pages/auction/AuctionItem'))
const AuctionBid = React.lazy(() => import('../pages/auction/AuctionBid'))
const DepositList = React.lazy(() => import('../pages/deposit/DepositList'))
const MyDeposit = React.lazy(() => import('../pages/deposit/MyDeposit'))
const RefundApply = React.lazy(() => import('../pages/refund/RefundApply'))
const DeductRecord = React.lazy(() => import('../pages/deduct/DeductRecord'))
const FundFlow = React.lazy(() => import('../pages/fund/FundFlow'))
const UserManage = React.lazy(() => import('../pages/system/User'))
const RoleManage = React.lazy(() => import('../pages/system/Role'))
const AuditLog = React.lazy(() => import('../pages/system/AuditLog'))

const routes = [
  {
    path: '/login',
    element: <BasicLayout />,
    children: [
      {
        path: '',
        element: <Login />
      }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'auction',
        children: [
          {
            path: '',
            element: <Navigate to="/auction/item" replace />
          },
          {
            path: 'item',
            element: <AuctionItem />
          },
          {
            path: 'bid',
            element: <AuctionBid />
          }
        ]
      },
      {
        path: 'deposit',
        children: [
          {
            path: '',
            element: <Navigate to="/deposit/list" replace />
          },
          {
            path: 'list',
            element: <DepositList />
          },
          {
            path: 'my',
            element: <MyDeposit />
          }
        ]
      },
      {
        path: 'refund',
        children: [
          {
            path: '',
            element: <Navigate to="/refund/apply" replace />
          },
          {
            path: 'apply',
            element: <RefundApply />
          }
        ]
      },
      {
        path: 'deduct',
        children: [
          {
            path: '',
            element: <Navigate to="/deduct/list" replace />
          },
          {
            path: 'list',
            element: <DeductRecord />
          }
        ]
      },
      {
        path: 'fund',
        children: [
          {
            path: '',
            element: <Navigate to="/fund/flow" replace />
          },
          {
            path: 'flow',
            element: <FundFlow />
          }
        ]
      },
      {
        path: 'system',
        children: [
          {
            path: '',
            element: <Navigate to="/system/user" replace />
          },
          {
            path: 'user',
            element: <UserManage />
          },
          {
            path: 'role',
            element: <RoleManage />
          },
          {
            path: 'audit',
            element: <AuditLog />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]

export default routes
