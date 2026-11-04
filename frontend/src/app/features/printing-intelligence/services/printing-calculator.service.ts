import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PrintingCategory,
  PrintingItem,
  PrintingSize,
  CreateCustomItemRequest,
  PaperSize,
  CreatePaperSizeRequest,
  PrintingMaterial,
  CreateCustomMaterialRequest,
  CostCategory,
  CalculateEstimateRequest,
  CalculateEstimateResponse,
  SaveEstimateRequest,
  EstimateSummary,
  EstimateDetail,
  LinkEstimateToQuotationRequest
} from '../models/printing-calculator.model';

@Injectable({
  providedIn: 'root'
})
export class PrintingCalculatorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/printing-calculator`;

  getImportStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/import-status`);
  }

  getCategories(): Observable<PrintingCategory[]> {
    return this.http.get<PrintingCategory[]>(`${this.baseUrl}/categories`);
  }

  getItems(categoryId?: number): Observable<PrintingItem[]> {
    let params = new HttpParams();
    if (categoryId && categoryId > 0) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<PrintingItem[]>(`${this.baseUrl}/items`, { params });
  }

  createCustomItem(req: CreateCustomItemRequest): Observable<PrintingItem> {
    return this.http.post<PrintingItem>(`${this.baseUrl}/items/custom`, req);
  }

  getPrintingSizes(itemId?: number): Observable<PrintingSize[]> {
    let params = new HttpParams();
    if (itemId && itemId > 0) {
      params = params.set('itemId', itemId.toString());
    }
    return this.http.get<PrintingSize[]>(`${this.baseUrl}/printing-sizes`, { params });
  }

  getPaperSizes(type?: string): Observable<PaperSize[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<PaperSize[]>(`${this.baseUrl}/paper-sizes`, { params });
  }

  createPaperSize(req: CreatePaperSizeRequest): Observable<PaperSize> {
    return this.http.post<PaperSize>(`${this.baseUrl}/paper-sizes`, req);
  }

  getMaterials(): Observable<PrintingMaterial[]> {
    return this.http.get<PrintingMaterial[]>(`${this.baseUrl}/materials`);
  }

  createCustomMaterial(req: CreateCustomMaterialRequest): Observable<PrintingMaterial> {
    return this.http.post<PrintingMaterial>(`${this.baseUrl}/materials/custom`, req);
  }

  getCostCategories(): Observable<CostCategory[]> {
    return this.http.get<CostCategory[]>(`${this.baseUrl}/cost-categories`);
  }

  calculate(req: CalculateEstimateRequest): Observable<CalculateEstimateResponse> {
    return this.http.post<CalculateEstimateResponse>(`${this.baseUrl}/calculate`, req);
  }

  getEstimates(search?: string, page: number = 1, pageSize: number = 50): Observable<EstimateSummary[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<EstimateSummary[]>(`${this.baseUrl}/estimates`, { params });
  }

  getEstimate(id: number): Observable<EstimateDetail> {
    return this.http.get<EstimateDetail>(`${this.baseUrl}/estimates/${id}`);
  }

  saveEstimate(req: SaveEstimateRequest): Observable<EstimateDetail> {
    return this.http.post<EstimateDetail>(`${this.baseUrl}/estimates`, req);
  }

  deleteEstimate(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/estimates/${id}`);
  }

  duplicateEstimate(id: number): Observable<EstimateDetail> {
    return this.http.post<EstimateDetail>(`${this.baseUrl}/estimates/${id}/duplicate`, {});
  }

  linkToQuotation(req: LinkEstimateToQuotationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/estimates/link-to-quotation`, req);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/clients`);
  }

  getQuotations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/quotations`);
  }
}

