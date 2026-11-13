export interface SupplierQuoteItem {
  id?: number;
  serialNumber: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface SupplierQuoteListItem {
  id: number;
  quoteNumber: string;
  supplierReferenceNumber?: string | null;
  supplierId: number;
  supplierName: string;
  quoteDate: string;
  description?: string | null;
  totalAmount: number;
  status: 'Recorded' | 'Cancelled' | string;
  itemCount: number;
  createdAt: string;
}

export interface SupplierQuote {
  id: number;
  quoteNumber: string;
  supplierReferenceNumber?: string | null;
  supplierId: number;
  supplierName: string;
  supplierContactPerson?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  quoteDate: string;
  description?: string | null;
  totalAmount: number;
  status: 'Recorded' | 'Cancelled' | string;
  createdAt: string;
  updatedAt: string;
  items: SupplierQuoteItem[];
}

export interface SupplierQuoteItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateSupplierQuoteRequest {
  quoteNumber?: string | null;
  supplierReferenceNumber?: string | null;
  supplierId: number;
  quoteDate: string;
  description?: string | null;
  items: SupplierQuoteItemInput[];
}

export interface UpdateSupplierQuoteRequest {
  supplierReferenceNumber?: string | null;
  supplierId: number;
  quoteDate: string;
  description?: string | null;
  items: SupplierQuoteItemInput[];
}

export interface PaginatedSupplierQuotesResponse {
  items: SupplierQuoteListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

