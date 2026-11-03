export interface QuotationListItem {
  quotationId: number;
  quotationNumber: string;
  revisionId: number;
  revisionNumber: number;
  quotationType: string;
  quotationDate: string;
  validUntil: string;
  customerName: string;
  contactPerson?: string;
  customerPhone: string;
  productSummary: string;
  grandTotal: number;
  currency: string;
  status: 'Draft' | 'Finalized';
  productionType?: 'IN_HOUSE' | 'OUTSOURCED';
  sendingStatus: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | 'Revision Requested';
  createdAt: string;
}

export interface QuotationSummary {
  totalQuotations: number;
  draftQuotations: number;
  finalizedQuotations: number;
  approvedQuotations: number;
  expiredQuotations: number;
  convertedQuotations: number;
}

export interface QuotationDetails {
  quotationId: number;
  quotationNumber: string;
  clientId?: number;
  customerName: string;
  contactPerson?: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  quotationType: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  activeRevision: QuotationRevision;
  revisions: QuotationRevisionSummary[];
}

export interface QuotationRevisionSummary {
  revisionId: number;
  revisionNumber: number;
  status: string;
  quotationDate: string;
  grandTotal: number;
  finalizedAt?: string;
  createdAt: string;
}

export interface QuotationRevision {
  revisionId: number;
  quotationId: number;
  revisionNumber: number;
  status: string;
  productionType?: 'IN_HOUSE' | 'OUTSOURCED';
  linkedOrderId?: number;
  linkedOrderNumber?: string;
  linkedOrderStatus?: string;
  quotationDate: string;
  validUntil: string;
  subtotal: number;
  discountType: 'None' | 'Fixed' | 'Percentage';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  internalNotes?: string;
  customerNotes?: string;
  termsAndConditions?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  sendLogs: QuotationSendLog[];
  approvalLogs: QuotationApprovalLog[];
}

export interface QuotationItem {
  itemId?: number;
  revisionId?: number;
  sortOrder: number;
  itemType: 'Printing' | 'Service';
  productionType?: 'IN_HOUSE' | 'OUTSOURCED';
  productName: string;
  description?: string;
  sizeDimensions?: string;
  material?: string;
  gsm?: string;
  printingColor?: string;
  finishing?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  serviceCategory?: string;
  serviceDetails?: string;
  notes?: string;
}

export interface QuotationSendLog {
  sendId: number;
  revisionId: number;
  sendMethod: string;
  recipient: string;
  markedSentAt: string;
  notes?: string;
  createdAt: string;
}

export interface QuotationApprovalLog {
  approvalId: number;
  revisionId: number;
  decision: string;
  responseMethod: string;
  contactName?: string;
  responseAt: string;
  notes?: string;
  createdAt: string;
}

export interface CreateQuotationPayload {
  clientId?: number;
  customerName: string;
  contactPerson?: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  quotationType: string;
  productionType?: 'IN_HOUSE' | 'OUTSOURCED';
  currency: string;
  quotationDate?: string;
  validUntil?: string;
  discountType: 'None' | 'Fixed' | 'Percentage';
  discountValue: number;
  taxRate: number;
  internalNotes?: string;
  customerNotes?: string;
  termsAndConditions?: string;
  items: CreateQuotationItemPayload[];
}

export interface CreateQuotationItemPayload {
  sortOrder: number;
  itemType: string;
  productionType?: 'IN_HOUSE' | 'OUTSOURCED';
  productName: string;
  description?: string;
  sizeDimensions?: string;
  material?: string;
  gsm?: string;
  printingColor?: string;
  finishing?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  serviceCategory?: string;
  serviceDetails?: string;
  notes?: string;
}

export interface PaginatedQuotationsResponse {
  items: QuotationListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RecordSendLogPayload {
  revisionId: number;
  sendMethod: string;
  recipient: string;
  notes?: string;
}

export interface RecordApprovalLogPayload {
  revisionId: number;
  decision: string;
  responseMethod: string;
  contactName?: string;
  notes?: string;
}

