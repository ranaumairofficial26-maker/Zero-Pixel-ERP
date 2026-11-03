import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SheetCalculation,
  SaveSheetCalculationRequest,
  CalculationResult,
  PaperSize,
  PrintingMaterial
} from '../models/sheet-calculator.model';

@Injectable({
  providedIn: 'root'
})
export class SheetCalculatorService {
  private http = inject(HttpClient);

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  // --- Materials API ---
  getMaterials(): Observable<PrintingMaterial[]> {
    return this.http.get<PrintingMaterial[]>(`${this.baseUrl}/sheet-calculator/materials`).pipe(
      timeout(10000),
      catchError(() => of([
        { materialName: 'ART/MATT PAPER', isActive: true },
        { 
          materialName: 'OFFSET PAPER', 
          isActive: true,
          defaultLength: 23,
          defaultWidth: 36,
          defaultGsm: 100,
          defaultRatePerKg: 680,
          defaultSheetsPerRim: 500,
          defaultConversionFactor: 3100
        },
        { materialName: 'ART CARD', isActive: true },
        { materialName: 'Carbonless Paper', isActive: true },
        { materialName: 'FLYING PAPER', isActive: true },
        { materialName: 'Bleach Card', isActive: true },
        { materialName: 'Box Board', isActive: true },
        { materialName: 'Sticker', isActive: true }
      ]))
    );
  }

  addMaterial(materialName: string): Observable<PrintingMaterial> {
    return this.http.post<PrintingMaterial>(`${this.baseUrl}/sheet-calculator/materials`, { materialName }).pipe(
      timeout(10000)
    );
  }

  // --- Paper Sizes API ---
  getPaperSizes(): Observable<PaperSize[]> {
    return this.http.get<PaperSize[]>(`${this.baseUrl}/sheet-calculator/paper-sizes`).pipe(
      timeout(10000),
      catchError(() => of([
        { sizeName: 'A4', lengthInches: 8.27, widthInches: 11.679, isActive: true },
        { sizeName: 'A5', lengthInches: 5.7, widthInches: 8.27, isActive: true },
        { sizeName: 'Letter', lengthInches: 8.5, widthInches: 11, isActive: true },
        { sizeName: 'Legal', lengthInches: 8.5, widthInches: 14, isActive: true },
        { sizeName: '7 × 9', lengthInches: 7, widthInches: 9, isActive: true }
      ]))
    );
  }

  // --- Calculations APIs ---
  getSavedCalculations(search?: string, limit: number = 50): Observable<SheetCalculation[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<SheetCalculation[]>(`${this.baseUrl}/sheet-calculator/calculations`, { params }).pipe(
      timeout(15000)
    );
  }

  saveCalculation(req: SaveSheetCalculationRequest): Observable<SheetCalculation> {
    return this.http.post<SheetCalculation>(`${this.baseUrl}/sheet-calculator/calculations`, req).pipe(
      timeout(15000)
    );
  }

  deleteCalculation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sheet-calculator/calculations/${id}`).pipe(
      timeout(15000)
    );
  }

  /**
   * Client-side precision calculation (Excel reference verified)
   * Rim Price = (Length × Width × GSM ÷ 3100) × Rate per KG × (Sheets per Rim ÷ 500)
   * Per Sheet Price = Rim Price ÷ Sheets per Rim
   * Required Sheets Total Cost = Per Sheet Price × Required Sheets
   */
  calculateLocally(
    length: number,
    width: number,
    gsm: number,
    ratePerKg: number,
    sheetsPerRim: number,
    requiredSheets: number,
    conversionFactor: number
  ): CalculationResult {
    if (!length || !width || !gsm || !conversionFactor || sheetsPerRim <= 0) {
      return {
        rimPrice: 0,
        perSheetPrice: 0,
        totalPaperCost: 0,
        referenceRimWeightKg: 0,
        equivalentRims: 0
      };
    }

    const referenceRimWeightKg = (length * width * gsm) / conversionFactor;
    const rimMultiplier = sheetsPerRim / 500;
    const rimPrice = referenceRimWeightKg * ratePerKg * rimMultiplier;
    const perSheetPrice = sheetsPerRim > 0 ? rimPrice / sheetsPerRim : 0;
    const totalPaperCost = perSheetPrice * (requiredSheets || 0);
    const equivalentRims = sheetsPerRim > 0 ? (requiredSheets || 0) / sheetsPerRim : 0;

    return {
      rimPrice: Number(rimPrice.toFixed(2)),
      perSheetPrice: Number(perSheetPrice.toFixed(4)),
      totalPaperCost: Number(totalPaperCost.toFixed(2)),
      referenceRimWeightKg: Number(referenceRimWeightKg.toFixed(4)),
      equivalentRims: Number(equivalentRims.toFixed(2))
    };
  }
}
