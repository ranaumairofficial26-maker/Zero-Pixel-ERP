export interface PaperSize {
  paperSizeId?: number;
  sizeName: string;
  lengthInches?: number;
  widthInches?: number;
  isActive?: boolean;
}

export interface PrintingMaterial {
  materialId?: number;
  materialName: string;
  isActive?: boolean;
  defaultLength?: number;
  defaultWidth?: number;
  defaultGsm?: number;
  defaultRatePerKg?: number;
  defaultSheetsPerRim?: number;
  defaultConversionFactor?: number;
}

export interface SheetCalculation {
  calculationId: number;
  length: number;
  width: number;
  gsm: number;
  ratePerKg: number;
  sheetsPerRim: number;
  requiredSheets: number;
  conversionFactor: number;
  materialName?: string | null;
  paperSizeName?: string | null;
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
  materialName?: string | null;
  paperSizeName?: string | null;
  notes?: string | null;
}

export interface CalculationResult {
  rimPrice: number;
  perSheetPrice: number;
  totalPaperCost: number;
  referenceRimWeightKg: number;
  equivalentRims: number;
}
