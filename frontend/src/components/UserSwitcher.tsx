import React from 'react';
import { Select, Space } from 'antd';
import { useUser } from '../contexts/UserContext';

const { Option } = Select;

const UserSwitcher: React.FC = () => {
  const { role, tenantId, setRole, setTenantId, tenants } = useUser();

  const handleRoleChange = (newRole: 'landlord' | 'tenant') => {
    setRole(newRole);
    if (newRole === 'landlord') {
      setTenantId(null);
    }
  };

  const handleTenantChange = (newTenantId: number | null) => {
    setTenantId(newTenantId);
  };

  return (
    <Space style={{ marginBottom: 20 }}>
      <Select
        value={role}
        onChange={handleRoleChange}
        style={{ width: 120 }}
        size="large"
      >
        <Option value="landlord">房东</Option>
        <Option value="tenant">租客</Option>
      </Select>

      {role === 'tenant' && (
        <Select
          value={tenantId}
          onChange={handleTenantChange}
          placeholder="选择租客"
          style={{ width: 150 }}
          size="large"
          disabled={tenants.length === 0}
        >
          {tenants.map((tenant) => (
            <Option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </Option>
          ))}
        </Select>
      )}
    </Space>
  );
};

export default UserSwitcher;