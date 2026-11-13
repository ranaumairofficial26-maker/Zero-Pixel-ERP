import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SupplierBill,
  SupplierBillListItem,
  CreateSupplierBillRequest,
  UpdateSupplierBillRequest,
  PaginatedSupplierBillsResponse,
  SupplierBillSummary,
  SupplierBillAgingReport
} from '../models/supplier-bill.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierBillService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/supplier-bills`;
  }

  getSupplierBills(search?: string, status?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedSupplierBillsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status && status !== 'All') {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedSupplierBillsResponse>(this.apiUrl, { params });
  }

  getSummary(): Observable<SupplierBillSummary> {
    return this.http.get<SupplierBillSummary>(`${this.apiUrl}/summary`);
  }

  getAgingReport(): Observable<SupplierBillAgingReport> {
    return this.http.get<SupplierBillAgingReport>(`${this.apiUrl}/aging-report`);
  }

  getNextInternalBillNumber(): Observable<{ internalBillNumber: string }> {
    return this.http.get<{ internalBillNumber: string }>(`${this.apiUrl}/next-number`);
  }

  getBillsBySupplier(supplierId: number): Observable<SupplierBillListItem[]> {
    return this.http.get<SupplierBillListItem[]>(`${this.apiUrl}/by-supplier/${supplierId}`);
  }

  getSupplierBillById(id: number): Observable<SupplierBill> {
    return this.http.get<SupplierBill>(`${this.apiUrl}/${id}`);
  }

  createSupplierBill(payload: CreateSupplierBillRequest): Observable<SupplierBill> {
    return this.http.post<SupplierBill>(this.apiUrl, payload);
  }

  updateSupplierBill(id: number, payload: UpdateSupplierBillRequest): Observable<SupplierBill> {
    return this.http.put<SupplierBill>(`${this.apiUrl}/${id}`, payload);
  }

  cancelSupplierBill(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }
}

