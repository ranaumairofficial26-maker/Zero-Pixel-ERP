export interface PrintingCategory {
  categoryId: number;
  categoryName: string;
  sourceCategoryName?: string;
  itemCount: number;
  itemNumberRange?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PrintingItem {
  itemId: number;
  categoryId: number;
  categoryName: string;
  sourceItemNumber?: number;
  itemName: string;
  defaultWidthMm?: number;
  defaultHeightMm?: number;
  inchesStr?: string;
  cmStr?: string;
  mmStr?: string;
  sizingBasis?: string;
  sourceNotes?: string;
  isCustom: boolean;
}

export interface CreateCustomItemRequest {
  categoryId: number;
  itemName: string;
  defaultWidthMm?: number;
  defaultHeightMm?: number;
  inchesStr?: string;
  cmStr?: string;
  mmStr?: string;
  sizingBasis?: string;
  sourceNotes?: string;
}

export interface PrintingSize {
  sizeId: number;
  sizeName: string;
  widthMm?: number;
  heightMm?: number;
  widthCm?: number;
  heightCm?: number;
  widthInches?: number;
  heightInches?: number;
  isApplicableToCurrentItem: boolean;
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface PaperSize {
  paperSizeId: number;
  sizeName: string;
  lengthInches?: number;
  widthInches?: number;
  widthMm?: number;
  heightMm?: number;
  sizeType: string;
  isActive: boolean;
}

export interface CreatePaperSizeRequest {
  sizeName: string;
  lengthInches?: number;
  widthInches?: number;
  widthMm?: number;
  heightMm?: number;
  sizeType?: string;
}

export interface PrintingMaterial {
  materialId: number;
  materialName: string;
  defaultLength?: number;
  defaultWidth?: number;
  defaultGsm?: number;
  defaultRatePerKg?: number;
  defaultSheetsPerRim: number;
  defaultConversionFactor: number;
  pricingMethod: string;
  packetPrice?: number;
  sheetsPerPacket?: number;
  isActive: boolean;
}

export interface CreateCustomMaterialRequest {
  materialName: string;
  defaultLength?: number;
  defaultWidth?: number;
  defaultGsm?: number;
  defaultRatePerKg?: number;
  defaultSheetsPerRim: number;
  defaultConversionFactor: number;
  pricingMethod: string;
  packetPrice?: number;
  sheetsPerPacket?: number;
}

export interface CostCategory {
  costCategoryId: number;
  categoryName: string;
  displayOrder: number;
  defaultCalculationMethod: string;
  defaultRate?: number;
  isActive: boolean;
}

export interface EstimateQuantityInput {
  quantityId?: number;
  quantity: number;
  sheetsRequired: number;
  wastagePercent: number;
  wastageSheets: number;
  totalSheets: number;
  notes?: string;
}

export interface EstimateCostItemInput {
  costItemId?: number;
  costCategoryId?: number;
  itemName: string;
  calculationMethod: string; // FixedAmount, ManualAmount, RatePerUnit, PerPiece, PerSheet
  unitRate: number;
  notes?: string;
  quantityAmounts: { [key: number]: number };
}

export interface CalculateEstimateRequest {
  pricingMethod: string;
  lengthInches?: number;
  widthInches?: number;
  gsm?: number;
  ratePerKg?: number;
  conversionFactor: number;
  packetPrice?: number;
  sheetsPerPacket?: number;
  rimPrice?: number;
  sheetsPerRim: number;
  directSheetPrice?: number;
  manualMaterialCost?: number;
  profitPercentage: number;
  taxPercentage: number;
  quantities: EstimateQuantityInput[];
  costItems: EstimateCostItemInput[];
}

export interface QuantityCalculationResult {
  quantity: number;
  sheetsRequired: number;
  wastageSheets: number;
  totalSheets: number;
  materialCost: number;
  costItemBreakdown: { [itemName: string]: number };
  additionalExpenses: number;
  productionCost: number;
  profitAmount: number;
  subtotalBeforeTax: number;
  taxAmount: number;
  grandTotal: number;
  perPiecePrice: number;
}

export interface PrintingMachineRate {
  id: number;
  machineName: string;
  printPerPlate: number;
  printPerSet: number;
  printingPlate: number;
  platePerSet: number;
  displayOrder: number;
  isActive: boolean;
}

export interface PlateSizePreset {
  id: string;
  label: string;
  sizeMm: string;
  machineName?: string;
  singleRate: number;
  setRate: number;
}

export interface CalculateEstimateResponse {
  computedPerSheetPrice: number;
  results: QuantityCalculationResult[];
}

export interface SaveEstimateRequest {
  estimateId?: number;
  estimateNumber?: string;
  estimateTitle: string;
  categoryId?: number;
  itemId?: number;
  customItemName?: string;
  productType?: string;
  jobTitle?: string;
  jobDescription?: string;
  printingSide?: string;
  colorMode?: string;
  printingColorCount?: number;
  ratePerColor?: number;
  finishingRequirements?: string;
  adminNotes?: string;

  finishedWidth?: number;
  finishedHeight?: number;
  finishedUnit: string;
  printingSizeId?: number;
  printingSizeName?: string;
  widthMm?: number;
  heightMm?: number;
  measurementUnit?: string;
  stockPaperSizeId?: number;
  stockPaperLength?: number;
  stockPaperWidth?: number;
  stockPaperUnit: string;

  materialId?: number;
  customMaterialName?: string;
  materialVariantName?: string;
  gsm?: number;
  pricingMethod: string;
  ratePerKg?: number;
  conversionFactor: number;
  packetPrice?: number;
  sheetsPerPacket?: number;
  rimPrice?: number;
  sheetsPerRim: number;
  directSheetPrice?: number;
  manualMaterialCost?: number;
  computedPerSheetPrice?: number;

  profitPercentage: number;
  taxPercentage: number;

  // Step 4: Plate / CTP & Prepress
  plateMakingMethod?: string;
  selectedPlateSizeId?: string;
  selectedPlateSizeName?: string;
  plateCode?: string;
  filmType?: string;
  plateQuantity?: number;
  isPlateQuantityManual?: boolean;
  platePricingMethod?: string;
  platesPerSet?: number;
  singlePlateRate?: number;
  setPlateRate?: number;
  manualPlateCost?: number;
  filmQuantity?: number;
  ratePerFilm?: number | null;
  otherPrepressCharges?: number;
  computedPlateCost?: number;
  computedFilmCost?: number;
  computedPrepressCost?: number;

  // Step 5: Printing Cost (Color & Machine Wise)
  printingMachine?: string;
  customPrintingMachine?: string;
  printingQuantity?: number;
  printingCostMethod?: string;
  perColorRateScope?: string;
  printingRate?: number | null;
  manualPrintingAmount?: number;
  machineSetupCharge?: number;
  additionalRunCharge?: number;
  otherPrintingCharges?: number;
  applyPerColorFormula?: boolean;
  computedMachinePrintingCost?: number;

  // Step 6: Lamination (Glossy / Matte)
  laminationType?: string;
  laminationSides?: string;
  laminationCostMethod?: string;
  laminationQuantity?: number;
  glossyLaminationRate?: number | null;
  matteLaminationRate?: number | null;
  laminationSheetWidthInches?: number;
  laminationSheetHeightInches?: number;
  applyLaminationSideMultiplier?: boolean;
  manualLaminationAmount?: number;
  computedLaminationCost?: number;

  quantities: EstimateQuantityInput[];
  costItems: EstimateCostItemInput[];
}

export interface EstimateSummary {
  estimateId: number;
  estimateNumber: string;
  estimateTitle: string;
  categoryName?: string;
  itemName?: string;
  materialName?: string;
  status: string;
  quantitiesSummary: string;
  minGrandTotal: number;
  maxGrandTotal: number;
  bestPerPiecePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateDetail extends SaveEstimateRequest {
  estimateId: number;
  categoryName?: string;
  itemName?: string;
  materialName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  results: QuantityCalculationResult[];
}

export interface LinkEstimateToQuotationRequest {
  estimateId: number;
  selectedQuantity: number;
  existingQuotationId?: number;
  clientId?: number;
  itemTitleOverride?: string;
  descriptionOverride?: string;
  unitPriceOverride?: number;
}

