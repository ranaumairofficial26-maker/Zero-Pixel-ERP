import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProductionJobSheet {
  id?: number;
  jobCardNumber: string;
  jobDate: string;
  customerName: string;
  jobName: string;
  quantity: number;
  paperSize?: string;
  paperType?: string;
  gsm?: number | null;

  printingSheetSize?: string;
  printingColors?: string;
  printingSide?: string;
  printingMethod?: string;
  printingMethodOther?: string;
  printingMachine?: string;
  printingOperator?: string;
  printingStartDate?: string | null;
  printingCompletionDate?: string | null;

  lamination?: string;
  laminationOther?: string;
  dieCutting?: string;
  binding?: string;
  bindingOther?: string;
  uvCoating?: string;
  packing?: string;
  packingInstructions?: string;

  specialInstructions?: string;
  productionSupervisor?: string;
  authorizedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionJobSheetService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/production-job-sheets`;
  }

  getAll(search?: string): Observable<ProductionJobSheet[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ProductionJobSheet[]>(this.apiUrl, { params }).pipe(timeout(15000));
  }

  getById(id: number): Observable<ProductionJobSheet> {
    return this.http.get<ProductionJobSheet>(`${this.apiUrl}/${id}`).pipe(timeout(15000));
  }

  save(data: ProductionJobSheet, id?: number): Observable<ProductionJobSheet> {
    if (id && id > 0) {
      return this.http.put<ProductionJobSheet>(`${this.apiUrl}/${id}`, data).pipe(timeout(15000));
    }
    return this.http.post<ProductionJobSheet>(this.apiUrl, data).pipe(timeout(15000));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(15000));
  }
}

