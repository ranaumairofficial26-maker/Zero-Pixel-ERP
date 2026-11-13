import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  PaginatedCustomerResponse
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly ntnStorageKey = 'zp_customer_ntn_map';
  private readonly ntnTagRegex = /\s*\[\[NTN:(.*?)\]\]\s*$/;

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/clients`;
  }

  private getNtnMap(): Record<string, string> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return {};
      const raw = window.localStorage.getItem(this.ntnStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveCustomerNtn(clientId: number, companyName?: string | null, ntnNumber?: string | null): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage || !clientId) return;
      const mapObj = this.getNtnMap();
      const trimmed = (ntnNumber || '').trim();
      const nameKey = (companyName || '').trim().toLowerCase();
      if (trimmed) {
        mapObj[String(clientId)] = trimmed;
        if (nameKey) {
          mapObj[`name:${nameKey}`] = trimmed;
        }
      } else {
        delete mapObj[String(clientId)];
        if (nameKey) {
          delete mapObj[`name:${nameKey}`];
        }
      }
      window.localStorage.setItem(this.ntnStorageKey, JSON.stringify(mapObj));
    } catch { }
  }

  private enrichCustomer(c: Customer): Customer {
    if (!c) return c;
    const mapObj = this.getNtnMap();
    const rawAddress = c.address || '';
    const match = rawAddress.match(this.ntnTagRegex);
    let cleanAddress = c.address;
    let tagNtn: string | null = null;
    if (match) {
      cleanAddress = rawAddress.replace(this.ntnTagRegex, '').trim() || null;
      tagNtn = match[1].trim() || null;
      if (tagNtn && c.clientId) {
        this.saveCustomerNtn(c.clientId, c.companyName, tagNtn);
      }
    }
    const nameKey = (c.companyName || '').trim().toLowerCase();
    const savedNtn = mapObj[String(c.clientId)] || (nameKey ? mapObj[`name:${nameKey}`] : null) || tagNtn || null;
    return {
      ...c,
      address: cleanAddress,
      ntnNumber: c.ntnNumber || savedNtn
    };
  }

  getCustomers(
    search?: string,
    status: string = 'active',
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedCustomerResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedCustomerResponse>(this.apiUrl, { params }).pipe(
      map(res => ({
        ...res,
        items: (res.items || []).map(item => this.enrichCustomer(item))
      }))
    );
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.enrichCustomer(c))
    );
  }

  createCustomer(customer: CreateCustomerRequest, force: boolean = false): Observable<Customer> {
    let params = new HttpParams();
    if (force) {
      params = params.set('force', 'true');
    }
    return this.http.post<Customer>(this.apiUrl, customer, { params }).pipe(
      map(c => {
        this.saveCustomerNtn(c.clientId, customer.companyName || c.companyName, customer.ntnNumber);
        return this.enrichCustomer(c);
      })
    );
  }

  updateCustomer(id: number, customer: UpdateCustomerRequest): Observable<Customer> {
    this.saveCustomerNtn(id, customer.companyName, customer.ntnNumber);
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer).pipe(
      map(c => this.enrichCustomer(c))
    );
  }

  updateCustomerStatus(id: number, isActive: boolean): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  archiveCustomer(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  restoreCustomer(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/restore`, {});
  }

  deleteCustomerPermanently(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/permanent`);
  }
}

