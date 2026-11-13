import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PurchaseOrder,
  PurchaseOrderListItem,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PaginatedPurchaseOrdersResponse
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/purchase-orders`;
  }

  getPurchaseOrders(search?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedPurchaseOrdersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedPurchaseOrdersResponse>(this.apiUrl, { params });
  }

  getPurchaseOrdersBySupplier(supplierId: number): Observable<PurchaseOrderListItem[]> {
    return this.http.get<PurchaseOrderListItem[]>(`${this.apiUrl}/by-supplier/${supplierId}`);
  }

  getNextPoNumber(): Observable<{ poNumber: string }> {
    return this.http.get<{ poNumber: string }>(`${this.apiUrl}/next-number`);
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  createPurchaseOrder(request: CreatePurchaseOrderRequest, issue: boolean = false): Observable<PurchaseOrder> {
    const params = new HttpParams().set('issue', issue.toString());
    return this.http.post<PurchaseOrder>(this.apiUrl, request, { params });
  }

  updateDraftPurchaseOrder(id: number, request: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}`, request);
  }

  issuePurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/issue`, {});
  }

  cancelPurchaseOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

