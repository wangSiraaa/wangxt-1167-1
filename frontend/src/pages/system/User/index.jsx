import React, { useState, useEffect } from 'react'
import { Table, Form, Modal, Input, Select, Switch, Button, Space, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import request from '../../../utils/request'

const { Option } = Select

function User() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchForm] = Form.useForm()
  const [userForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalType, setModalType] = useState('add')
  const [record, setRecord] = useState(null)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [roleForm] = Form.useForm()
  const [roleList, setRoleList] = useState([])

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (
        <span style={{ color: text === 1 ? '#52c41a' : '#ff4d4f' }}>
          {text === 1 ? '启用' : '禁用'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => handleAssignRole(record)}>
            分配角色
          </Button>
          <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/system/user/list', {
        params: {
          page,
          pageSize,
          ...params
        }
      })
      if (res.code === 200) {
        setDataSource(res.data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: res.data.total || 0
        })
      } else {
        message.error(res.message || '查询失败')
      }
    } catch (error) {
      console.error('查询用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleList = async () => {
    try {
      const res = await request.get('/system/role/list')
      if (res.code === 200) {
        setRoleList(res.data.list || [])
      }
    } catch (error) {
      console.error('查询角色列表失败:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchRoleList()
  }, [])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.pageSize)
  }

  const handlePageChange = (page, pageSize) => {
    const values = searchForm.getFieldsValue()
    fetchData(page, pageSize, values)
  }

  const handleAdd = () => {
    setModalTitle('新增用户')
    setModalType('add')
    setRecord(null)
    userForm.resetFields()
    userForm.setFieldsValue({ status: true })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setModalTitle('编辑用户')
    setModalType('edit')
    setRecord(record)
    userForm.setFieldsValue({
      ...record,
      status: record.status === 1
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await userForm.validateFields()
      const submitData = {
        ...values,
        status: values.status ? 1 : 0
      }
      if (modalType === 'add') {
        const res = await request.post('/system/user/add', submitData)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          fetchData(pagination.current, pagination.pageSize)
        } else {
          message.error(res.message || '新增失败')
        }
      } else {
        const res = await request.put('/system/user/update', { ...submitData, id: record.id })
        if (res.code === 200) {
          message.success('更新成功')
          setModalVisible(false)
          fetchData(pagination.current, pagination.pageSize)
        } else {
          message.error(res.message || '更新失败')
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  const handleDelete = async (record) => {
    try {
      const res = await request.delete(`/system/user/delete/${record.id}`)
      if (res.code === 200) {
        message.success('删除成功')
        fetchData(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleAssignRole = (record) => {
    setRecord(record)
    roleForm.setFieldsValue({
      roleIds: record.roleIds || []
    })
    setRoleModalVisible(true)
  }

  const handleRoleModalOk = async () => {
    try {
      const values = await roleForm.validateFields()
      const res = await request.post('/system/user/assignRole', {
        userId: record.id,
        roleIds: values.roleIds
      })
      if (res.code === 200) {
        message.success('分配角色成功')
        setRoleModalVisible(false)
        fetchData(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '分配角色失败')
      }
    } catch (error) {
      console.error('分配角色失败:', error)
    }
  }

  return (
    <div className="page-container">
      <Card className="search-card" variant="outlined">
        <Form form={searchForm} layout="inline">
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名">
            <Input placeholder="请输入真实姓名" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 140 }}>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="table-card" variant="outlined" style={{ marginTop: 16 }}>
        <div className="table-header">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePageChange
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={userForm} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={modalType === 'edit'} />
          </Form.Item>
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {modalType === 'add' && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配角色"
        open={roleModalVisible}
        onOk={handleRoleModalOk}
        onCancel={() => setRoleModalVisible(false)}
        width={400}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            name="roleIds"
            label="选择角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select mode="multiple" placeholder="请选择角色" style={{ width: '100%' }}>
              {roleList.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default User
