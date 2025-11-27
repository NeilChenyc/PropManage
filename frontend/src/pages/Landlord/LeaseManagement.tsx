import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, InputNumber, message, Tag, Select } from 'antd';
import { EditOutlined, CalendarOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import type { Lease, Bill, Building } from '../../types';
import { getLeases, getBills, addMeterReading, getBuildings } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const LeaseManagement: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // 模态框状态
  const [isBillModalVisible, setIsBillModalVisible] = useState(false);
  const [isMeterReadingModalVisible, setIsMeterReadingModalVisible] = useState(false);
  const [meterReadingForm] = Form.useForm();

  // 筛选状态
  const [selectedBuilding, setSelectedBuilding] = useState<number | undefined>();
  const [billStatus, setBillStatus] = useState<string | undefined>();

  useEffect(() => {
    loadLeases();
    loadBuildings();
  }, []);

  useEffect(() => {
    loadBills();
  }, [selectedBuilding, billStatus]);

  const loadLeases = async () => {
    setLoading(true);
    try {
      const data = await getLeases();
      setLeases(data);
    } catch (error) {
      message.error('加载合同失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await getBills(billStatus, selectedBuilding);
      setBills(data);
    } catch (error) {
      message.error('加载账单失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const data = await getBuildings();
      setBuildings(data);
    } catch (error) {
      message.error('加载楼宇失败');
    }
  };

  const handleViewBills = (lease: Lease) => {
    setSelectedLease(lease);
    setIsBillModalVisible(true);
  };

  const handleAddMeterReading = (bill: Bill) => {
    setSelectedBill(bill);
    setIsMeterReadingModalVisible(true);
    meterReadingForm.resetFields();
  };

  const handleMeterReadingSubmit = async (values: any) => {
    if (!selectedBill) return;

    try {
      await addMeterReading(selectedBill.id, {
        current_water_reading: values.current_water_reading,
        current_elec_reading: values.current_elec_reading,
      });

      message.success('抄表成功！');
      setIsMeterReadingModalVisible(false);
      loadBills(); // 刷新账单数据
    } catch (error: any) {
      message.error(error.response?.data?.detail || '抄表失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Terminated':
        return 'red';
      case 'Pending':
        return 'orange';
      case 'Paid':
        return 'green';
      case 'Overdue':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return '进行中';
      case 'Terminated':
        return '已终止';
      case 'Pending':
        return '待支付';
      case 'Paid':
        return '已支付';
      case 'Overdue':
        return '已逾期';
      default:
        return status;
    }
  };

  const leaseColumns = [
    {
      title: '房间',
      dataIndex: ['room', 'room_number'],
      key: 'room_number',
      render: (roomNumber: string) => <span><HomeOutlined /> {roomNumber}</span>,
    },
    {
      title: '租客',
      dataIndex: ['tenant', 'name'],
      key: 'tenant_name',
      render: (name: string) => <span><UserOutlined /> {name}</span>,
    },
    {
      title: '租期',
      key: 'period',
      render: (record: Lease) => (
        <span>
          <CalendarOutlined /> {dayjs(record.start_date).format('YYYY-MM-DD')} 至 {dayjs(record.end_date).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '月租金',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Lease) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleViewBills(record)}
        >
          查看账单
        </Button>
      ),
    },
  ];

  const billColumns = [
    {
      title: '房间',
      dataIndex: ['room', 'room_number'],
      key: 'room_number',
      render: (roomNumber: string) => <span><HomeOutlined /> {roomNumber}</span>,
    },
    {
      title: '租客',
      dataIndex: ['tenant', 'name'],
      key: 'tenant_name',
      render: (name: string) => <span><UserOutlined /> {name}</span>,
    },
    {
      title: '账单周期',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '租金',
      dataIndex: 'rent_fee',
      key: 'rent_fee',
      render: (fee: number) => `¥${fee.toFixed(2)}`,
    },
    {
      title: '水费',
      dataIndex: 'water_fee',
      key: 'water_fee',
      render: (fee: number) => `¥${fee.toFixed(2)}`,
    },
    {
      title: '电费',
      dataIndex: 'elec_fee',
      key: 'elec_fee',
      render: (fee: number) => `¥${fee.toFixed(2)}`,
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <strong>¥{amount.toFixed(2)}</strong>,
    },
    {
      title: '截止日期',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Bill) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAddMeterReading(record)}
          disabled={record.status === 'Paid'}
        >
          录入水电
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <Card title="合同管理" style={{ flex: 1 }}>
          <Table
            columns={leaseColumns}
            dataSource={leases}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <Card title="账单管理">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="选择楼宇"
              style={{ width: 200 }}
              value={selectedBuilding}
              onChange={setSelectedBuilding}
            >
              <Option value={undefined}>全部楼宇</Option>
              {buildings.map(building => (
                <Option key={building.id} value={building.id}>{building.name}</Option>
              ))}
            </Select>

            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              value={billStatus}
              onChange={setBillStatus}
            >
              <Option value={undefined}>全部状态</Option>
              <Option value="Pending">待支付</Option>
              <Option value="Paid">已支付</Option>
              <Option value="Overdue">已逾期</Option>
            </Select>

            <Button type="primary" onClick={loadBills}>
              查询
            </Button>
          </Space>
        </div>

        <Table
          columns={billColumns}
          dataSource={bills}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 合同账单详情模态框 */}
      <Modal
        title={`合同 ${selectedLease?.id} - 账单详情`}
        open={isBillModalVisible}
        onCancel={() => setIsBillModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedLease && (
          <div>
            <p><strong>房间:</strong> {selectedLease.room?.room_number}</p>
            <p><strong>租客:</strong> {selectedLease.tenant?.name}</p>
            <p><strong>租期:</strong> {dayjs(selectedLease.start_date).format('YYYY-MM-DD')} 至 {dayjs(selectedLease.end_date).format('YYYY-MM-DD')}</p>
            <p><strong>月租金:</strong> ¥{selectedLease.rent_amount.toFixed(2)}</p>
            <Table
              columns={billColumns.filter(col => col.key !== 'action')}
              dataSource={selectedLease.bills}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
              style={{ marginTop: 20 }}
            />
          </div>
        )}
      </Modal>

      {/* 录入水电读数模态框 */}
      <Modal
        title={`为账单 ${selectedBill?.period} 录入水电读数`}
        open={isMeterReadingModalVisible}
        onCancel={() => setIsMeterReadingModalVisible(false)}
        footer={null}
      >
        <Form
          form={meterReadingForm}
          layout="vertical"
          onFinish={handleMeterReadingSubmit}
        >
          <Form.Item
            name="current_water_reading"
            label="当前水表读数 (吨)"
            rules={[
              { required: true, message: '请输入水表读数' },
              { type: 'number', min: 0, message: '读数不能为负数' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="current_elec_reading"
            label="当前电表读数 (度)"
            rules={[
              { required: true, message: '请输入电表读数' },
              { type: 'number', min: 0, message: '读数不能为负数' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认录入
              </Button>
              <Button onClick={() => setIsMeterReadingModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaseManagement;