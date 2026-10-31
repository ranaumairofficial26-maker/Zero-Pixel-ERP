import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateQuotationPayload,
  PaginatedQuotationsResponse,
  QuotationDetails,
  QuotationSendLog,
  QuotationApprovalLog,
  QuotationSummary,
  RecordSendLogPayload,
  RecordApprovalLogPayload
} from '../models/quotation.models';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quotations`;

  getQuotations(
    params: {
      search?: string;
      quotationType?: string;
      status?: string;
      approvalStatus?: string;
      sendingStatus?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      isAscending?: boolean;
    } = {}
  ): Observable<PaginatedQuotationsResponse> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 10).toString())
      .set('sortBy', params.sortBy || 'date')
      .set('isAscending', (params.isAscending ?? false).toString());

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.quotationType && params.quotationType !== 'all') {
      httpParams = httpParams.set('quotationType', params.quotationType);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.approvalStatus && params.approvalStatus !== 'all') {
      httpParams = httpParams.set('approvalStatus', params.approvalStatus);
    }
    if (params.sendingStatus && params.sendingStatus !== 'all') {
      httpParams = httpParams.set('sendingStatus', params.sendingStatus);
    }
    if (params.fromDate) {
      httpParams = httpParams.set('fromDate', params.fromDate);
    }
    if (params.toDate) {
      httpParams = httpParams.set('toDate', params.toDate);
    }

    return this.http.get<PaginatedQuotationsResponse>(this.apiUrl, { params: httpParams }).pipe(
      timeout(15000)
    );
  }

  getSummary(): Observable<QuotationSummary> {
    return this.http.get<QuotationSummary>(`${this.apiUrl}/summary`).pipe(
      timeout(15000)
    );
  }

  getQuotationById(id: number, revisionId?: number): Observable<QuotationDetails> {
    let params = new HttpParams();
    if (revisionId) {
      params = params.set('revisionId', revisionId.toString());
    }
    return this.http.get<QuotationDetails>(`${this.apiUrl}/${id}`, { params });
  }

  createDraft(payload: CreateQuotationPayload): Observable<QuotationDetails> {
    return this.http.post<QuotationDetails>(this.apiUrl, payload);
  }

  updateDraft(id: number, payload: CreateQuotationPayload): Observable<QuotationDetails> {
    return this.http.put<QuotationDetails>(`${this.apiUrl}/${id}/draft`, payload);
  }

  finalizeQuotation(id: number): Observable<QuotationDetails> {
    return this.http.post<QuotationDetails>(`${this.apiUrl}/${id}/finalize`, {});
  }

  createRevision(id: number): Observable<QuotationDetails> {
    return this.http.post<QuotationDetails>(`${this.apiUrl}/${id}/revisions`, {});
  }

  getPdfBlob(id: number, revisionId?: number, download = false): Observable<Blob> {
    let params = new HttpParams();
    if (revisionId) {
      params = params.set('revisionId', revisionId.toString());
    }
    if (download) {
      params = params.set('download', 'true');
    }
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  recordSendLog(payload: RecordSendLogPayload): Observable<QuotationSendLog> {
    return this.http.post<QuotationSendLog>(`${this.apiUrl}/send-logs`, payload);
  }

  recordApprovalLog(payload: RecordApprovalLogPayload): Observable<QuotationApprovalLog> {
    return this.http.post<QuotationApprovalLog>(`${this.apiUrl}/approval-logs`, payload);
  }

  deleteQuotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

