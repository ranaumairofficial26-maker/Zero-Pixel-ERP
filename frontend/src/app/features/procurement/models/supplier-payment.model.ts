export interface SupplierPaymentListItem {
  id: number;
  paymentNumber: string;
  supplierId: number;
  supplierName: string;
  supplierBillId: number;
  internalBillNumber: string;
  supplierInvoiceNumber: string;
  billTotalAmount?: number;
  billPaidAmount?: number;
  billOutstandingBalance?: number;
  billStatus?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | string;
  paymentAccountReference?: string | null;
  transactionReference?: string | null;
  status: 'Posted' | 'Reversed' | string;
  createdAt: string;
}

export interface SupplierPayment {
  id: number;
  paymentNumber: string;
  supplierId: number;
  supplierName: string;
  supplierContactPerson?: string | null;
  supplierBillId: number;
  internalBillNumber: string;
  supplierInvoiceNumber: string;
  billTotalAmount: number;
  billPaidAmount: number;
  billOutstandingBalance: number;
  billStatus: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | string;
  paymentAccountReference?: string | null;
  transactionReference?: string | null;
  notes?: string | null;
  status: 'Posted' | 'Reversed' | string;
  reversalReason?: string | null;
  reversedAt?: string | null;
  reversedBy?: string | null;
  createdBy?: string | null;
  recordIntegrityHash?: string | null;
  isIntegrityVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPaymentRequest {
  supplierId: number;
  supplierBillId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | string;
  paymentAccountReference?: string | null;
  transactionReference?: string | null;
  notes?: string | null;
  idempotencyKey?: string | null;
}

export interface ReverseSupplierPaymentRequest {
  reversalReason: string;
}

export interface UpdateSupplierPaymentRequest {
  paymentDate: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | string;
  paymentAccountReference?: string | null;
  transactionReference?: string | null;
  notes?: string | null;
}

export interface PaginatedSupplierPaymentsResponse {
  items: SupplierPaymentListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
