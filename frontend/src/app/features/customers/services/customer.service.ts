import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/clients`;

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

    return this.http.get<PaginatedCustomerResponse>(this.apiUrl, { params });
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: CreateCustomerRequest, force: boolean = false): Observable<Customer> {
    let params = new HttpParams();
    if (force) {
      params = params.set('force', 'true');
    }
    return this.http.post<Customer>(this.apiUrl, customer, { params });
  }

  updateCustomer(id: number, customer: UpdateCustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
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

