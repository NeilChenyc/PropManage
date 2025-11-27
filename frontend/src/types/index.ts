export interface Building {
  id: number;
  name: string;
  address: string;
  rooms: Room[];
}

export interface Room {
  id: number;
  building_id: number;
  room_number: string;
  area: number;
  status: string;
  last_water_reading: number;
  last_elec_reading: number;
}

export interface Tenant {
  id: number;
  name: string;
  phone: string;
}

export interface Lease {
  id: number;
  room_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit: number;
  status: string;
  bills: Bill[];
  room?: Room;
  tenant?: Tenant;
}

export interface Bill {
  id: number;
  lease_id: number;
  period: string;
  rent_fee: number;
  water_fee: number;
  elec_fee: number;
  total_amount: number;
  status: string;
  due_date: string;
}

export interface MeterReadingInput {
  current_water_reading: number;
  current_elec_reading: number;
}

export interface UserContextType {
  role: 'landlord' | 'tenant';
  tenantId: number | null;
  setRole: (role: 'landlord' | 'tenant') => void;
  setTenantId: (tenantId: number | null) => void;
  tenants: Tenant[];
}

export interface BillWithDetails extends Bill {
  room_number?: string;
  tenant_name?: string;
}