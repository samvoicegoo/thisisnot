export interface Partner {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Delivery {
  id: string;
  date: string;
  quantity: number;
  boxes: number;
  destination: string;
  recipientId: string;
  notes?: string;
  createdAt: Date;
}

export interface Settlement {
  id: string;
  fromDate: string;
  toDate: string;
  recipientId: string;
  quantity: number;
  amountPaid: number;
  notes?: string;
  createdAt: Date;
}

export interface FilterOptions {
  dateRange?: {
    from: string;
    to: string;
  };
  recipientId?: string;
  quantityRange?: {
    min: number;
    max: number;
  };
  boxRange?: {
    min: number;
    max: number;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  destination?: string;
}