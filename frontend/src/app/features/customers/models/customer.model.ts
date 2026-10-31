export interface Customer {
  clientId: number;
  companyName: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isArchived: boolean;
}

export interface CreateCustomerRequest {
  companyName: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface UpdateCustomerRequest {
  companyName: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface PaginatedCustomerResponse {
  items: Customer[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DuplicateWarningResponse {
  isDuplicate: boolean;
  message: string;
  existingClient: Customer;
}

