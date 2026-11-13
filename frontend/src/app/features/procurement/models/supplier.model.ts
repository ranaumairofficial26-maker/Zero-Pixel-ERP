export interface SupplierListItem {
  id: number;
  supplierName: string;
  contactPerson?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  status: 'Active' | 'Inactive' | string;
  leadTimeWorkingDays?: number | null;
  createdAt: string;
}

export interface Supplier {
  id: number;
  supplierName: string;
  contactPerson?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  leadTimeWorkingDays?: number | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumberOrIban?: string | null;
  status: 'Active' | 'Inactive' | string;
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  supplierName: string;
  contactPerson?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  leadTimeWorkingDays?: number | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumberOrIban?: string | null;
  status: 'Active' | 'Inactive';
  services: string[];
}

export type UpdateSupplierRequest = CreateSupplierRequest;

export interface PaginatedSuppliersResponse {
  items: SupplierListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

