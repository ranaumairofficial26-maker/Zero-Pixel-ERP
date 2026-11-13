import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SupplierPayment,
  SupplierPaymentListItem,
  CreateSupplierPaymentRequest,
  ReverseSupplierPaymentRequest,
  PaginatedSupplierPaymentsResponse
} from '../models/supplier-payment.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierPaymentService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/supplier-payments`;
  }

  getSupplierPayments(search?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedSupplierPaymentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedSupplierPaymentsResponse>(this.apiUrl, { params });
  }

  getNextPaymentNumber(): Observable<{ paymentNumber: string }> {
    return this.http.get<{ paymentNumber: string }>(`${this.apiUrl}/next-number`);
  }

  getPaymentsBySupplier(supplierId: number): Observable<SupplierPaymentListItem[]> {
    return this.http.get<SupplierPaymentListItem[]>(`${this.apiUrl}/by-supplier/${supplierId}`);
  }

  getPaymentsByBill(billId: number): Observable<SupplierPaymentListItem[]> {
    return this.http.get<SupplierPaymentListItem[]>(`${this.apiUrl}/by-bill/${billId}`);
  }

  getSupplierPaymentById(id: number): Observable<SupplierPayment> {
    return this.http.get<SupplierPayment>(`${this.apiUrl}/${id}`);
  }

  createSupplierPayment(payload: CreateSupplierPaymentRequest): Observable<SupplierPayment> {
    return this.http.post<SupplierPayment>(this.apiUrl, payload);
  }

  reverseSupplierPayment(id: number, payload: ReverseSupplierPaymentRequest): Observable<SupplierPayment> {
    return this.http.post<SupplierPayment>(`${this.apiUrl}/${id}/reverse`, payload);
  }
}
