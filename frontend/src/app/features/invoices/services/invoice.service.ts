import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Invoice,
  PaginatedInvoicesResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest
} from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/invoices`;
  }

  getInvoices(search?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedInvoicesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedInvoicesResponse>(this.apiUrl, { params });
  }

  getInvoice(idOrNumber: string | number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${idOrNumber}`);
  }

  getInvoiceById(id: number | string): Observable<Invoice> {
    return this.getInvoice(id);
  }

  getNextInvoiceNumber(): Observable<{ invoiceNumber: string }> {
    return this.http.get<{ invoiceNumber: string }>(`${this.apiUrl}/next-number`);
  }

  createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, request);
  }

  updateInvoice(id: number, request: UpdateInvoiceRequest): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, request);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getInvoicePdfBlob(idOrNumber: string | number, download: boolean = true): Observable<Blob> {
    const params = new HttpParams().set('download', download.toString());
    return this.http.get(`${this.apiUrl}/${idOrNumber}/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  downloadInvoicePdf(idOrNumber: string | number, invoiceNumber?: string): Observable<Blob> {
    return this.getInvoicePdfBlob(idOrNumber, true).pipe(
      tap((blob: Blob) => {
        const defaultName = invoiceNumber ? `${invoiceNumber.trim()}.pdf` : `Invoice_${idOrNumber}.pdf`;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      })
    );
  }
}
