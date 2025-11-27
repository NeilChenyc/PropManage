import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserContextType, Tenant } from '../types';
import { getTenants } from '../services/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [role, setRole] = useState<'landlord' | 'tenant'>(() => {
    return (localStorage.getItem('role') as 'landlord' | 'tenant') || 'landlord';
  });

  const [tenantId, setTenantId] = useState<number | null>(() => {
    const stored = localStorage.getItem('tenantId');
    return stored ? parseInt(stored) : null;
  });

  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    // 加载租客列表
    const loadTenants = async () => {
      try {
        const data = await getTenants();
        setTenants(data);
      } catch (error) {
        console.error('Failed to load tenants:', error);
      }
    };

    loadTenants();
  }, []);

  useEffect(() => {
    localStorage.setItem('role', role);
    if (tenantId !== null) {
      localStorage.setItem('tenantId', tenantId.toString());
    } else {
      localStorage.removeItem('tenantId');
    }
  }, [role, tenantId]);

  const value: UserContextType = {
    role,
    tenantId,
    setRole,
    setTenantId,
    tenants,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};