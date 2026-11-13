export type InvoiceAdjustmentType = 'advance' | 'tax_amount' | 'tax_percent' | 'percent_off';

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  serialNumber: number;
  grNumber?: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  ntnNumber?: string | null;
  clientPoNumber?: string | null;
  customerId: number;

  // Snapshot
  customerName: string;
  companyName?: string | null;
  contactNumber: string;
  email?: string | null;
  billingAddress?: string | null;

  // Financials
  total: number;
  advance: number;
  adjustmentType?: InvoiceAdjustmentType;
  adjustmentRate?: number | null;
  balance: number;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: number;
  customerName: string;
  companyName?: string | null;
  contactNumber: string;
  total: number;
  advance: number;
  adjustmentType?: InvoiceAdjustmentType;
  adjustmentRate?: number | null;
  balance: number;
  itemCount: number;
  createdAt: string;
}

export interface PaginatedInvoicesResponse {
  items: InvoiceListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateInvoiceRequest {
  customerId: number;
  invoiceDate: string;
  ntnNumber?: string | null;
  clientPoNumber?: string | null;
  advance: number;
  adjustmentType?: InvoiceAdjustmentType;
  adjustmentRate?: number | null;
  notes?: string | null;
  items: {
    grNumber?: string | null;
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export interface UpdateInvoiceRequest {
  customerId: number;
  invoiceDate: string;
  ntnNumber?: string | null;
  clientPoNumber?: string | null;
  advance: number;
  adjustmentType?: InvoiceAdjustmentType;
  adjustmentRate?: number | null;
  notes?: string | null;
  items: {
    grNumber?: string | null;
    description: string;
    quantity: number;
    rate: number;
  }[];
}

