import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Modal, Form, Input, InputNumber, Select, message, Empty, Menu } from 'antd';
import { PlusOutlined, ApartmentOutlined, HomeOutlined } from '@ant-design/icons';
import type { Building, Room } from '../../types';
import { getBuildings, createLease, getTenants } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const PropertyManagement: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 模态框状态
  const [isSignLeaseModalVisible, setIsSignLeaseModalVisible] = useState(false);
  const [selectedRoomForLease, setSelectedRoomForLease] = useState<Room | null>(null);
  const [leaseForm] = Form.useForm();

  useEffect(() => {
    loadBuildings();
    loadTenants();
  }, []);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const data = await getBuildings();
      setBuildings(data);
      if (data.length > 0) {
        setSelectedBuilding(data[0]);
      }
    } catch (error) {
      message.error('加载房源失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      message.error('加载租客失败');
    }
  };

  const handleBuildingSelect = (buildingId: number) => {
    const building = buildings.find(b => b.id === buildingId);
    setSelectedBuilding(building || null);
  };

  const handleSignLease = (room: Room) => {
    setSelectedRoomForLease(room);
    setIsSignLeaseModalVisible(true);
    leaseForm.resetFields();
  };

  const handleSignLeaseSubmit = async (values: any) => {
    try {
      await createLease({
        room_id: selectedRoomForLease?.id,
        tenant_id: values.tenant_id,
        start_date: dayjs(values.start_date).format('YYYY-MM-DD'),
        end_date: dayjs(values.end_date).format('YYYY-MM-DD'),
        rent_amount: values.rent_amount,
        deposit: values.deposit,
      });

      message.success('签约成功！');
      setIsSignLeaseModalVisible(false);
      loadBuildings(); // 刷新房源数据
    } catch (error: any) {
      message.error(error.response?.data?.detail || '签约失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Occupied':
        return '#52c41a';
      case 'Vacant':
        return '#1890ff';
      case 'Maintenance':
        return '#fa8c16';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Occupied':
        return '已租';
      case 'Vacant':
        return '空置';
      case 'Maintenance':
        return '维修中';
      default:
        return status;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 24 }}>
      {/* 左侧楼宇列表 */}
      <div style={{ width: 220, borderRight: '1px solid #e8e8e8', padding: '16px 0' }}>
        <Menu
          mode="inline"
          selectedKeys={selectedBuilding ? [selectedBuilding.id.toString()] : []}
          style={{ border: 'none', fontSize: '14px' }}
        >
          {buildings.map(building => (
            <Menu.Item
              key={building.id}
              icon={<ApartmentOutlined />}
              onClick={() => handleBuildingSelect(building.id)}
              style={{ marginBottom: 8 }}
            >
              <div>
                <div>{building.name}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                  {building.rooms.length} 个房间
                </div>
              </div>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* 右侧房间列表 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #e8e8e8'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {selectedBuilding?.name} - 房间列表
          </h2>
          <Button type="primary" icon={<PlusOutlined />}>
            添加房间
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            加载中...
          </div>
        ) : selectedBuilding?.rooms && selectedBuilding.rooms.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
            overflow: 'auto'
          }}>
            {selectedBuilding.rooms.map(room => (
              <Card
                key={room.id}
                title={
                  <Space>
                    <HomeOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>{room.room_number}</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    disabled={room.status !== 'Vacant'}
                    onClick={() => handleSignLease(room)}
                    size="small"
                    style={{
                      backgroundColor: room.status === 'Vacant' ? '#1890ff' : '#999',
                      borderColor: room.status === 'Vacant' ? '#1890ff' : '#999'
                    }}
                  >
                    {room.status === 'Vacant' ? '签约' : getStatusText(room.status)}
                  </Button>
                }
                style={{
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.3s ease'
                }}
                hoverable
              >
                <div style={{ lineHeight: '1.8', fontSize: '14px' }}>
                  <p style={{ margin: '8px 0', color: '#666' }}>
                    面积: <strong style={{ color: '#333' }}>{room.area}㎡</strong>
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    状态:
                    <span
                      style={{
                        color: getStatusColor(room.status),
                        fontWeight: 500,
                        marginLeft: 8
                      }}
                    >
                      {getStatusText(room.status)}
                    </span>
                  </p>
                  <p style={{ margin: '8px 0', color: '#666' }}>
                    上次水表: <strong style={{ color: '#333' }}>{room.last_water_reading}吨</strong>
                  </p>
                  <p style={{ margin: '8px 0', color: '#666' }}>
                    上次电表: <strong style={{ color: '#333' }}>{room.last_elec_reading}度</strong>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            description="暂无房间数据"
            style={{ padding: '80px 0' }}
          />
        )}
      </div>

      {/* 签约模态框 */}
      <Modal
        title={`为 ${selectedRoomForLease?.room_number} 签订租赁合同`}
        open={isSignLeaseModalVisible}
        onCancel={() => setIsSignLeaseModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={leaseForm}
          layout="vertical"
          onFinish={handleSignLeaseSubmit}
          initialValues={{
            start_date: dayjs().format('YYYY-MM-DD'),
            end_date: dayjs().add(1, 'year').format('YYYY-MM-DD')
          }}
        >
          <Form.Item
            name="tenant_id"
            label="选择租客"
            rules={[{ required: true, message: '请选择租客' }]}
          >
            <Select placeholder="请选择租客">
              {tenants.map(tenant => (
                <Option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.phone})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <Input type="date" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="结束日期"
            rules={[
              { required: true, message: '请选择结束日期' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('start_date')) {
                    return Promise.resolve();
                  }
                  if (dayjs(value).isBefore(dayjs(getFieldValue('start_date')))) {
                    return Promise.reject(new Error('结束日期不能早于开始日期'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="date" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="rent_amount"
            label="月租金 (元)"
            rules={[{ required: true, message: '请输入月租金' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入月租金"
            />
          </Form.Item>

          <Form.Item
            name="deposit"
            label="押金 (元)"
            rules={[{ required: true, message: '请输入押金' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入押金"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsSignLeaseModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认签约
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PropertyManagement;