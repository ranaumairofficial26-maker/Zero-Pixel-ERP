import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SupplierQuote,
  CreateSupplierQuoteRequest,
  UpdateSupplierQuoteRequest,
  PaginatedSupplierQuotesResponse
} from '../models/supplier-quote.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierQuoteService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/supplier-quotes`;
  }

  getQuotes(search?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedSupplierQuotesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedSupplierQuotesResponse>(this.apiUrl, { params });
  }

  getNextQuoteNumber(): Observable<{ quoteNumber: string }> {
    return this.http.get<{ quoteNumber: string }>(`${this.apiUrl}/next-number`);
  }

  getQuoteById(id: number): Observable<SupplierQuote> {
    return this.http.get<SupplierQuote>(`${this.apiUrl}/${id}`);
  }

  createQuote(request: CreateSupplierQuoteRequest): Observable<SupplierQuote> {
    return this.http.post<SupplierQuote>(this.apiUrl, request);
  }

  updateQuote(id: number, request: UpdateSupplierQuoteRequest): Observable<SupplierQuote> {
    return this.http.put<SupplierQuote>(`${this.apiUrl}/${id}`, request);
  }

  cancelQuote(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

