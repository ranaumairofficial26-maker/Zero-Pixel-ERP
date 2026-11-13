export interface SupplierBillItem {
  id?: number;
  serialNumber: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface SupplierBillListItem {
  id: number;
  internalBillNumber: string;
  supplierInvoiceNumber: string;
  supplierId: number;
  supplierName: string;
  purchaseOrderId?: number | null;
  purchaseOrderNumber?: string | null;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | string;
  itemCount: number;
  createdAt: string;
}

export interface SupplierBill {
  id: number;
  internalBillNumber: string;
  supplierInvoiceNumber: string;
  supplierId: number;
  supplierName: string;
  supplierContactPerson?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  supplierAddress?: string | null;
  purchaseOrderId?: number | null;
  purchaseOrderNumber?: string | null;
  billDate: string;
  dueDate: string;
  description?: string | null;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  items: SupplierBillItem[];
}

export interface SupplierBillItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateSupplierBillRequest {
  internalBillNumber?: string | null;
  supplierInvoiceNumber: string;
  supplierId: number;
  purchaseOrderId?: number | null;
  billDate: string;
  dueDate: string;
  description?: string | null;
  items: SupplierBillItemInput[];
}

export interface UpdateSupplierBillRequest {
  supplierInvoiceNumber: string;
  supplierId: number;
  purchaseOrderId?: number | null;
  billDate: string;
  dueDate: string;
  description?: string | null;
  items: SupplierBillItemInput[];
}

export interface PaginatedSupplierBillsResponse {
  items: SupplierBillListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SupplierBillSummary {
  outstandingPayables: number;
  overdueBillsCount: number;
  paidThisMonth: string;
}

export interface SupplierBillAgingItem {
  billId: number;
  internalBillNumber: string;
  supplierInvoiceNumber: string;
  supplierId: number;
  supplierName: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
  agingCategory: string;
}

export interface SupplierBillAgingReport {
  totalOutstanding: number;
  totalNotYetDue: number;
  total1To30Days: number;
  total31To60Days: number;
  total61To90Days: number;
  totalOver90Days: number;
  items: SupplierBillAgingItem[];
}

