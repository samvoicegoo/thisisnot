import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Partner, Delivery, Settlement } from '../types';

interface AppContextType {
  partners: Partner[];
  deliveries: Delivery[];
  settlements: Settlement[];
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  updateSettlement: (id: string, settlement: Partial<Settlement>) => void;
  deleteSettlement: (id: string) => void;
  getPartnerById: (id: string) => Partner | undefined;
  getDeliveriesByPartner: (partnerId: string, fromDate?: string, toDate?: string) => Delivery[];
  checkDeliveryExists: (date: string) => Delivery | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPartners = localStorage.getItem('greenhouse-partners');
    const savedDeliveries = localStorage.getItem('greenhouse-deliveries');
    const savedSettlements = localStorage.getItem('greenhouse-settlements');

    if (savedPartners) {
      setPartners(JSON.parse(savedPartners));
    }
    if (savedDeliveries) {
      setDeliveries(JSON.parse(savedDeliveries));
    }
    if (savedSettlements) {
      setSettlements(JSON.parse(savedSettlements));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('greenhouse-partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('greenhouse-deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('greenhouse-settlements', JSON.stringify(settlements));
  }, [settlements]);

  const addPartner = (partner: Omit<Partner, 'id' | 'createdAt'>) => {
    const newPartner: Partner = {
      ...partner,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPartners(prev => [...prev, newPartner]);
  };

  const updatePartner = (id: string, partner: Partial<Partner>) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...partner } : p));
  };

  const deletePartner = (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const addDelivery = (delivery: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDelivery: Delivery = {
      ...delivery,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setDeliveries(prev => [...prev, newDelivery]);
  };

  const updateDelivery = (id: string, delivery: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...delivery } : d));
  };

  const deleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };

  const addSettlement = (settlement: Omit<Settlement, 'id' | 'createdAt'>) => {
    const newSettlement: Settlement = {
      ...settlement,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSettlements(prev => [...prev, newSettlement]);
  };

  const updateSettlement = (id: string, settlement: Partial<Settlement>) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, ...settlement } : s));
  };

  const deleteSettlement = (id: string) => {
    setSettlements(prev => prev.filter(s => s.id !== id));
  };

  const getPartnerById = (id: string) => {
    return partners.find(p => p.id === id);
  };

  const getDeliveriesByPartner = (partnerId: string, fromDate?: string, toDate?: string) => {
    return deliveries.filter(d => {
      if (d.recipientId !== partnerId) return false;
      if (fromDate && d.date < fromDate) return false;
      if (toDate && d.date > toDate) return false;
      return true;
    });
  };

  const checkDeliveryExists = (date: string) => {
    return deliveries.find(d => d.date === date);
  };

  return (
    <AppContext.Provider
      value={{
        partners,
        deliveries,
        settlements,
        addPartner,
        updatePartner,
        deletePartner,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        addSettlement,
        updateSettlement,
        deleteSettlement,
        getPartnerById,
        getDeliveriesByPartner,
        checkDeliveryExists,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};