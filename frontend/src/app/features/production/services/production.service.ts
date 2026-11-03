import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductionJob, UpdateProductionJobRequest } from '../models/production.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/production-jobs`;
  }

  getJobs(productionType?: string, status?: string, search?: string): Observable<ProductionJob[]> {
    let params = new HttpParams();
    if (productionType && productionType !== 'all') {
      params = params.set('productionType', productionType);
    }
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      timeout(15000),
      map(jobs => (Array.isArray(jobs) ? jobs : []).map(j => this.normalizeJob(j)))
    );
  }

  getJobById(id: number): Observable<ProductionJob> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      timeout(15000),
      map(j => this.normalizeJob(j))
    );
  }

  updateJob(id: number, req: UpdateProductionJobRequest): Observable<ProductionJob> {
    const payload = {
      status: req.status,
      priority: req.priority,
      dueDate: req.dueDate,
      targetStartDate: req.targetStartDate,
      assignedOperator: req.assignedOperator || req.operatorAssigned,
      machineName: req.machineName || req.machineAssigned,
      vendorName: req.vendorName,
      vendorPhone: req.vendorPhone || req.vendorContact,
      outsourcedCost: req.outsourcedCost ?? req.vendorCost,
      expectedDeliveryDate: req.expectedDeliveryDate,
      notes: req.notes || req.internalNotes
    };

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      timeout(15000),
      map(j => this.normalizeJob(j))
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      timeout(15000)
    );
  }

  clearInHouseJobs(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clear-in-house`).pipe(
      timeout(15000)
    );
  }

  updateStatus(id: number, status: string, notes?: string): Observable<ProductionJob> {
    let params = new HttpParams().set('status', status);
    if (notes) params = params.set('notes', notes);
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, null, { params }).pipe(
      timeout(15000),
      map(j => this.normalizeJob(j))
    );
  }

  private normalizeJob(j: any): ProductionJob {
    if (!j) return {} as ProductionJob;

    return {
      jobId: j.jobId,
      jobNumber: j.jobNumber || '',
      orderId: j.orderId || 0,
      orderNumber: j.orderNumber || '',
      customerName: j.customerName || '',
      customerPhone: j.customerPhone || '',
      productionType: j.productionType,
      status: j.status || 'Queued',
      priority: j.priority || 'Normal',
      dueDate: j.dueDate || '',
      targetStartDate: j.targetStartDate || '',
      operatorAssigned: j.assignedOperator || j.operatorAssigned || '',
      assignedOperator: j.assignedOperator || j.operatorAssigned || '',
      machineAssigned: j.machineName || j.machineAssigned || '',
      machineName: j.machineName || j.machineAssigned || '',
      vendorName: j.vendorName || '',
      vendorContact: j.vendorPhone || j.vendorContact || '',
      vendorPhone: j.vendorPhone || j.vendorContact || '',
      vendorCost: j.outsourcedCost ?? j.vendorCost ?? 0,
      outsourcedCost: j.outsourcedCost ?? j.vendorCost ?? 0,
      expectedDeliveryDate: j.expectedDeliveryDate,
      internalNotes: j.notes || j.internalNotes || '',
      notes: j.notes || j.internalNotes || '',
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
      completedAt: j.completedAt,
      items: (j.items || []).map((item: any) => ({
        jobItemId: item.orderItemId || item.jobItemId || 0,
        jobId: j.jobId,
        orderItemId: item.orderItemId || 0,
        productName: item.productName || '',
        sizeDimensions: item.sizeDimensions || '',
        material: item.material || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'pcs'
      }))
    };
  }
}
