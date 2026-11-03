export interface SheetCalculation {
  calculationId: number;
  length: number;
  width: number;
  gsm: number;
  ratePerKg: number;
  sheetsPerRim: number;
  requiredSheets: number;
  conversionFactor: number;
  referenceRimWeightKg: number;
  equivalentRims: number;
  rimPrice: number;
  perSheetPrice: number;
  totalPaperCost: number;
  notes?: string | null;
  createdAt: string;
}

export interface SaveSheetCalculationRequest {
  length: number;
  width: number;
  gsm: number;
  ratePerKg: number;
  sheetsPerRim: number;
  requiredSheets: number;
  conversionFactor: number;
  notes?: string | null;
}

export interface CalculationResult {
  rimPrice: number;
  perSheetPrice: number;
  totalPaperCost: number;
  referenceRimWeightKg: number;
  equivalentRims: number;
}
