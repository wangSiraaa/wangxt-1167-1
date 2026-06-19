import React, { useState, useEffect } from 'react'
import { Table, Form, Modal, Input, Select, Button, Space, message, Popconfirm, Tree, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons'
import request from '../../../utils/request'

const { Option } = Select

function Role() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalType, setModalType] = useState('add')
  const [record, setRecord] = useState(null)
  const [form] = Form.useForm()
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [permissionTree, setPermissionTree] = useState([])
  const [checkedKeys, setCheckedKeys] = useState([])

  const columns = [
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 150
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
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
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleAssignPermission(record)}>
            分配权限
          </Button>
          <Popconfirm title="确定删除该角色吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await request.get('/system/role/list', {
        params: {
          page,
          pageSize
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
      console.error('查询角色列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissionTree = async () => {
    try {
      const res = await request.get('/system/permission/tree')
      if (res.code === 200) {
        setPermissionTree(res.data || [])
      }
    } catch (error) {
      console.error('查询权限树失败:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchPermissionTree()
  }, [])

  const handlePageChange = (page, pageSize) => {
    fetchData(page, pageSize)
  }

  const handleAdd = () => {
    setModalTitle('新增角色')
    setModalType('add')
    setRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setModalTitle('编辑角色')
    setModalType('edit')
    setRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (modalType === 'add') {
        const res = await request.post('/system/role/add', values)
        if (res.code === 200) {
          message.success('新增成功')
          setModalVisible(false)
          fetchData(pagination.current, pagination.pageSize)
        } else {
          message.error(res.message || '新增失败')
        }
      } else {
        const res = await request.put('/system/role/update', { ...values, id: record.id })
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
      const res = await request.delete(`/system/role/delete/${record.id}`)
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

  const handleAssignPermission = (record) => {
    setRecord(record)
    setCheckedKeys(record.permissionIds || [])
    setPermissionModalVisible(true)
  }

  const handlePermissionModalOk = async () => {
    try {
      const res = await request.post('/system/role/assignPermission', {
        roleId: record.id,
        permissionIds: checkedKeys
      })
      if (res.code === 200) {
        message.success('分配权限成功')
        setPermissionModalVisible(false)
      } else {
        message.error(res.message || '分配权限失败')
      }
    } catch (error) {
      console.error('分配权限失败:', error)
    }
  }

  const onCheck = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue)
  }

  return (
    <div className="page-container">
      <Card className="table-card" variant="outlined">
        <div className="table-header">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
            刷新
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
          scroll={{ x: 800 }}
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
        <Form form={form} layout="vertical" initialValues={{ status: 1 }}>
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" disabled={modalType === 'edit'} />
          </Form.Item>
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: '100%' }}>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配权限"
        open={permissionModalVisible}
        onOk={handlePermissionModalOk}
        onCancel={() => setPermissionModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Tree
          checkable
          defaultExpandAll
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          treeData={permissionTree}
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
        />
      </Modal>
    </div>
  )
}

export default Role
