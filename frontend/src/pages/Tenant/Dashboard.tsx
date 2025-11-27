import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Table, Tag, Space, message, Empty, Statistic, Row, Col } from 'antd';
import { CalendarOutlined, HomeOutlined, MoneyCollectOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Lease, Bill } from '../../types';
import { getMyLease, getMyBills, payBill } from '../../services/api';
import dayjs from 'dayjs';

const { Content } = Layout;

const Dashboard: React.FC = () => {
  const [lease, setLease] = useState<Lease | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyData();
  }, []);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const [leaseData, billsData] = await Promise.all([
        getMyLease(),
        getMyBills()
      ]);
      setLease(leaseData);
      setBills(billsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (billId: number) => {
    try {
      await payBill(billId);
      message.success('支付成功！');
      loadMyData(); // 刷新数据
    } catch (error: any) {
      message.error(error.response?.data?.detail || '支付失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getOverdueDays = (dueDate: string) => {
    const today = dayjs();
    const due = dayjs(dueDate);
    return today.diff(due, 'day');
  };

  const billColumns = [
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
      render: (date: string) => (
        <span>
          {dayjs(date).format('YYYY-MM-DD')}
          {dayjs(date).isBefore(dayjs()) && (
            <span style={{ color: 'red', marginLeft: 8 }}>
              (逾期{getOverdueDays(date)}天)
            </span>
          )}
        </span>
      ),
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
          icon={<CheckCircleOutlined />}
          onClick={() => handlePayBill(record.id)}
          disabled={record.status === 'Paid'}
        >
          {record.status === 'Paid' ? '已支付' : '支付'}
        </Button>
      ),
    },
  ];

  // 计算统计数据
  const pendingBills = bills.filter(bill => bill.status === 'Pending');
  const overdueBills = bills.filter(bill => bill.status === 'Overdue');
  const paidBills = bills.filter(bill => bill.status === 'Paid');

  const totalPendingAmount = pendingBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalOverdueAmount = overdueBills.reduce((sum, bill) => sum + bill.total_amount, 0);

  return (
    <Layout>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: 24 }}>我的 dashboard</h1>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="待支付金额"
                value={totalPendingAmount}
                precision={2}
                prefix="¥"
                suffix={`(${pendingBills.length}笔)`}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="逾期金额"
                value={totalOverdueAmount}
                precision={2}
                prefix="¥"
                suffix={`(${overdueBills.length}笔)`}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已支付账单"
                value={paidBills.length}
                suffix="笔"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 合同信息 */}
        <Card title="我的合同" style={{ marginBottom: 24 }}>
          {loading ? (
            <div>加载中...</div>
          ) : lease ? (
            <div>
              <Row gutter={16}>
                <Col span={8}>
                  <Space>
                    <HomeOutlined />
                    <span><strong>房间:</strong> {lease.room?.room_number}</span>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space>
                    <CalendarOutlined />
                    <span><strong>租期:</strong> {dayjs(lease.start_date).format('YYYY-MM-DD')} 至 {dayjs(lease.end_date).format('YYYY-MM-DD')}</span>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space>
                    <MoneyCollectOutlined />
                    <span><strong>月租金:</strong> ¥{lease.rent_amount.toFixed(2)}</span>
                  </Space>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <span><strong>押金:</strong> ¥{lease.deposit.toFixed(2)}</span>
                </Col>
                <Col span={8}>
                  <span><strong>合同状态:</strong> <Tag color="green">{lease.status === 'Active' ? '进行中' : lease.status}</Tag></span>
                </Col>
                <Col span={8}>
                  <span><strong>下次交租日:</strong> {bills.length > 0 ? dayjs(bills[0].due_date).format('YYYY-MM-DD') : '暂无'}</span>
                </Col>
              </Row>
            </div>
          ) : (
            <Empty description="暂无合同信息" />
          )}
        </Card>

        {/* 账单列表 */}
        <Card title="我的账单">
          {loading ? (
            <div>加载中...</div>
          ) : bills.length > 0 ? (
            <Table
              columns={billColumns}
              dataSource={bills}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          ) : (
            <Empty description="暂无账单信息" />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Dashboard;