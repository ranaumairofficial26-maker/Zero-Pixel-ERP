export interface PurchaseOrderItem {
  id?: number;
  serialNumber: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PurchaseOrderListItem {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  supplierQuoteId?: number | null;
  supplierQuoteNumber?: string | null;
  projectJobId?: number | null;
  projectJobNumber?: string | null;
  projectJobLabel?: string | null;
  poDate: string;
  status: 'Draft' | 'Issued' | 'Cancelled' | string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  supplierContactPerson?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  supplierAddress?: string | null;
  supplierQuoteId?: number | null;
  supplierQuoteNumber?: string | null;
  projectJobId?: number | null;
  projectJobNumber?: string | null;
  projectJobLabel?: string | null;
  poDate: string;
  status: 'Draft' | 'Issued' | 'Cancelled' | string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string | null;
  cancelledAt?: string | null;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreatePurchaseOrderRequest {
  poNumber?: string | null;
  supplierId: number;
  supplierQuoteId?: number | null;
  projectJobId?: number | null;
  poDate: string;
  items: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderRequest {
  supplierId: number;
  supplierQuoteId?: number | null;
  projectJobId?: number | null;
  poDate: string;
  items: PurchaseOrderItemInput[];
}

export interface PaginatedPurchaseOrdersResponse {
  items: PurchaseOrderListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

