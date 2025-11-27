import axios from 'axios';
import type { Building, Tenant, Lease, Bill, MeterReadingInput } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 设置请求拦截器，添加用户身份信息
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('role') || 'landlord';
  const tenantId = localStorage.getItem('tenantId');

  if (role === 'landlord') {
    config.headers['X-Role'] = 'landlord';
  } else if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});

// 公共API
export const getBuildings = async (): Promise<Building[]> => {
  const response = await api.get('/buildings');
  return response.data;
};

export const getTenants = async (): Promise<Tenant[]> => {
  const response = await api.get('/tenants');
  return response.data;
};

// 房东API
export const getLeases = async (): Promise<Lease[]> => {
  const response = await api.get('/leases');
  return response.data;
};

export const getBills = async (status?: string, building_id?: number): Promise<Bill[]> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (building_id) params.append('building_id', building_id.toString());

  const response = await api.get(`/bills?${params}`);
  return response.data;
};

export const createLease = async (leaseData: any): Promise<Lease> => {
  const response = await api.post('/leases', leaseData);
  return response.data;
};

export const addMeterReading = async (billId: number, meterData: MeterReadingInput): Promise<Bill> => {
  const response = await api.post(`/bills/${billId}/meter-reading`, meterData);
  return response.data;
};

// 租客API
export const getMyLease = async (): Promise<Lease> => {
  const response = await api.get('/my/lease');
  return response.data;
};

export const getMyBills = async (): Promise<Bill[]> => {
  const response = await api.get('/my/bills');
  return response.data;
};

export const payBill = async (billId: number): Promise<Bill> => {
  const response = await api.post(`/my/bills/${billId}/pay`, {});
  return response.data;
};

export default api;