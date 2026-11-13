import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PrintingCalculatorService } from '../../services/printing-calculator.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ThemeService } from '../../../../core/services/theme.service';
import {
  PrintingCategory,
  PrintingItem,
  PrintingSize,
  PaperSize,
  PrintingMaterial,
  CostCategory,
  EstimateQuantityInput,
  EstimateCostItemInput,
  CalculateEstimateRequest,
  CalculateEstimateResponse,
  QuantityCalculationResult,
  SaveEstimateRequest,
  EstimateSummary,
  EstimateDetail,
  LinkEstimateToQuotationRequest,
  PlateSizePreset,
  PrintingMachineRate
} from '../../models/printing-calculator.model';

@Component({
  selector: 'app-printing-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './printing-calculator.component.html',
  styleUrl: './printing-calculator.component.scss'
})
export class PrintingCalculatorComponent implements OnInit {
  private calcService = inject(PrintingCalculatorService);
  private toast = inject(ToastService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  // Tabs
  activeTab = signal<'calculator' | 'saved-estimates'>('calculator');
  loading = signal<boolean>(false);
  calculating = signal<boolean>(false);

  // Masters
  categories: PrintingCategory[] = [];
  allItems: PrintingItem[] = [];
  filteredItems: PrintingItem[] = [];
  paperSizes: PaperSize[] = [];
  materials: PrintingMaterial[] = [];
  costCategories: CostCategory[] = [];
  clients: any[] = [];
  existingQuotations: any[] = [];

  // Saved Estimates
  estimates: EstimateSummary[] = [];
  estimateSearch = signal<string>('');

  // Active Estimate Identity
  currentEstimateId: number | null = null;
  currentEstimateNumber: string | null | undefined = null;
  estimateTitle: string = '';

  // Section 1: Category & Item Selection
  selectedCategoryId: number = 0;
  selectedItemId: number = 0;
  selectedItem: PrintingItem | null = null;
  itemSearchTerm: string = '';
  categorySearchTerm: string = '';

  // Section 2: Size Selection & Measurement Unit (Step 2)
  printingSizes: PrintingSize[] = [];
  selectedSizeId: number | null = null;
  selectedUnit: 'MM' | 'CM' | 'Inches' | '' = 'MM';
  canonicalWidthMm: number | null = null;
  canonicalHeightMm: number | null = null;
  displayedWidth: number | null = null;
  displayedHeight: number | null = null;
  isCustomSize: boolean = false;

  // Step 3 — Printing Color (None / 0 to 10)
  printingColorOptions: { count: number; label: string }[] = [
    { count: 0, label: 'None (No Printing Color)' },
    { count: 1, label: '1 Color' },
    { count: 2, label: '2 Colors' },
    { count: 3, label: '3 Colors' },
    { count: 4, label: '4 Colors' },
    { count: 5, label: '5 Colors' },
    { count: 6, label: '6 Colors' },
    { count: 7, label: '7 Colors' },
    { count: 8, label: '8 Colors' },
    { count: 9, label: '9 Colors' },
    { count: 10, label: '10 Colors' }
  ];
  printingColorCount = new FormControl<number | null>(null, [
    Validators.min(0),
    Validators.max(10)
  ]);
  ratePerColor: number | null = null; // Optional: e.g. PKR 250/color
  applyPerColorFormula: boolean = false; // When true, computes 4 * 250 = 1000

  // =========================================================================
  // STEP 4 — PLATE / CTP & PREPRESS (POSITIVE / NEGATIVE)
  // =========================================================================
  plateSizePresets: PlateSizePreset[] = [
    { id: '450x370-rota', label: '450 × 370 — Rota', sizeMm: '450 × 370', machineName: 'Rota', singleRate: 280, setRate: 1100 },
    { id: '510x400-52', label: '510 × 400 — 52', sizeMm: '510 × 400', machineName: '52 (Offset)', singleRate: 350, setRate: 1400 },
    { id: '525x459', label: '525 × 459', sizeMm: '525 × 459', singleRate: 450, setRate: 1800 },
    { id: '645x510-solna', label: '645 × 510 — Solna', sizeMm: '645 × 510', machineName: 'Solna', singleRate: 550, setRate: 2200 },
    { id: '650x550-favo', label: '650 × 550 — Favo', sizeMm: '650 × 550', machineName: 'Favo', singleRate: 630, setRate: 2500 },
    { id: '605x625', label: '605 × 625', sizeMm: '605 × 625', singleRate: 930, setRate: 3700 },
    { id: '605x660', label: '605 × 660', sizeMm: '605 × 660', singleRate: 930, setRate: 3700 },
    { id: '724x615', label: '724 × 615', sizeMm: '724 × 615', singleRate: 930, setRate: 3700 },
    { id: '745x605', label: '745 × 605', sizeMm: '745 × 605', singleRate: 950, setRate: 3800 },
    { id: '785x690', label: '785 × 690', sizeMm: '785 × 690', singleRate: 1200, setRate: 4800 },
    { id: '840x690', label: '840 × 690', sizeMm: '840 × 690', singleRate: 1380, setRate: 5500 },
    { id: '915x715', label: '915 × 715', sizeMm: '915 × 715', singleRate: 1380, setRate: 5500 },
    { id: '925x740', label: '925 × 740', sizeMm: '925 × 740', singleRate: 1450, setRate: 5800 },
    { id: '975x755', label: '975 × 755', sizeMm: '975 × 755', singleRate: 1500, setRate: 6000 },
    { id: '1030x770', label: '1030 × 770', sizeMm: '1030 × 770', singleRate: 2000, setRate: 8000 },
    { id: '1030x790', label: '1030 × 790', sizeMm: '1030 × 790', singleRate: 2000, setRate: 8000 },
    { id: '1030x800', label: '1030 × 800', sizeMm: '1030 × 800', singleRate: 2000, setRate: 8000 },
    { id: '1030x820', label: '1030 × 820', sizeMm: '1030 × 820', singleRate: 2000, setRate: 8000 }
  ];

  // =========================================================================
  // CONFIRMED PRINTING MACHINES & MASTER RATES (STRICT USER SPECIFICATION)
  // Exactly 4 machines: GTO 46, GTO 52, Solna 125, Heidelberg + Solna
  // =========================================================================
  confirmedMachineRates: PrintingMachineRate[] = [
    { id: 1, machineName: 'Solna', printPerPlate: 550, printPerSet: 2200, printingPlate: 800, platePerSet: 2200, displayOrder: 1, isActive: true },
    { id: 2, machineName: 'GTO 46', printPerPlate: 350, printPerSet: 1400, printingPlate: 500, platePerSet: 2000, displayOrder: 2, isActive: true },
    { id: 3, machineName: 'GTO 52', printPerPlate: 375, printPerSet: 1600, printingPlate: 550, platePerSet: 2200, displayOrder: 3, isActive: true },
    { id: 4, machineName: 'Solna 125', printPerPlate: 550, printPerSet: 2200, printingPlate: 800, platePerSet: 3200, displayOrder: 4, isActive: true },
    { id: 5, machineName: 'Heidelberg', printPerPlate: 1000, printPerSet: 4000, printingPlate: 1500, platePerSet: 6000, displayOrder: 5, isActive: true }
  ];
  printingMachinesList: string[] = ['Solna', 'GTO 46', 'GTO 52', 'Solna 125', 'Heidelberg'];

  // STEP 4 — PLATE / CTP (PREPRESS)
  plateType: string = 'CTP'; // CTP, Film-Based, PS Plate, No Plate Required
  plateMakingMethod: string = 'CTP';
  plateSizeCode: string = '5A'; // 5A, 450 × 370, 510 × 400, 645 × 510, etc.
  plateCode: string = '5A';
  filmType: 'Positive' | 'Negative' | '' = 'Positive'; // Positive, Negative
  plateChargeType: 'Printing Plate' | 'Plate Per Set' = 'Plate Per Set';
  plateChargeRate: number | null = 2200;
  plateQuantity: number | null = null;
  plateSetQuantity: number | null = 1;

  // STEP 5 — PRINTING COST (COLOR & MACHINE WISE)
  printingMachine: string = 'Solna';
  step5PrintingColor: string = '5 Colors';
  printingCostMethod: string = 'Per Sheet';
  printingCostRate: number | null = 1.50;
  printingCostQuantity: number | null = 5000;
  printingChargeType: 'Print Per Plate' | 'Print Per Set' = 'Print Per Set';
  printingChargeRate: number | null = 1.50;
  printingChargeQty: number | null = 5000;

  // STEP 6 — LAMINATION
  laminationType: 'None' | 'Glossy' | 'Matte' | '' = 'Glossy';
  laminationCostMethod: string = 'Per Sheet';
  laminationCostRate: number | null = 0.75;
  laminationCostQuantity: number | null = 5000;
  laminationSides: 'Single Side' | 'Double Side' = 'Single Side';
  laminationRatePerSqFt: number | null = 2.80;
  laminationQuantity: number | null = 5000;
  laminationSheetWidthInches: number | null = null;
  laminationSheetHeightInches: number | null = null;

  // Prepress & Machine compatibility fields
  selectedPlateSizeId: string = '';
  plateSizeSearchTerm: string = '';
  selectedPlatePreset: any = null;
  isPlateQuantityManual: boolean = false;
  platePricingMethod: string = '';
  platesPerSet: number | null = null;
  singlePlateRate: number | null = null;
  setPlateRate: number | null = null;
  manualPlateCost: number | null = null;
  filmQuantity: number | null = null;
  isFilmQuantityManual: boolean = false;
  ratePerFilm: number | null = null;
  otherPrepressCharges: number | null = null;
  filmCost: number = 0;

  printingMachineSearchTerm: string = '';
  customPrintingMachine: string = '';
  printingQuantity: number | null = null;
  perColorRateScope: string = 'FlatPerColor';
  printingRate: number | null = null;
  manualPrintingAmount: number | null = null;
  machineSetupCharge: number | null = null;
  additionalRunCharge: number | null = null;
  otherPrintingCharges: number | null = null;

  glossyLaminationRate: number | null = 2.80;
  matteLaminationRate: number | null = 3.25;
  applyLaminationSideMultiplier: boolean = true;
  manualLaminationAmount: number | null = null;

  // SHARED CALCULATION MODEL OUTPUTS (LIVE RIGHT-SIDE SUMMARY)
  plateCost: number = 2200;
  prepressCost: number = 2200;
  baseMachinePrintingCost: number = 7500;
  machinePrintingCost: number = 7500;
  laminationCost: number = 3750;
  activeSummaryQuantityIndex: number = 0;

  // Section 4: Material & Paper Details (Step 7 & 8)
  selectedMaterialId: number = 0;
  selectedMaterial: PrintingMaterial | null = null;
  materialVariant: string = '';
  gsm: number | null = null;
  pricingMethod: string = ''; // RatePerKg, PacketPrice, DirectRimPrice, DirectSheetPrice, ManualMaterialCost
  ratePerKg: number | null = null;
  conversionFactor: number | null = null;
  packetPrice: number | null = null;
  sheetsPerPacket: number | null = null;
  rimPrice: number | null = null;
  sheetsPerRim: number | null = null;
  directSheetPrice: number | null = null;
  manualMaterialCost: number | null = null;
  computedPerSheetPrice: number = 0;

  // Paper Size & Dimensions
  // Finished Product Size
  finishedWidth: number | null = null;
  finishedHeight: number | null = null;
  finishedUnit: string = 'in'; // in, mm, cm, ft

  // Stock Paper Size
  stockPaperSizeId: number | null = null;
  stockPaperLength: number | null = null;
  stockPaperWidth: number | null = null;
  stockPaperUnit: string = 'in';

  // Section 4: Job Specifications
  jobTitle: string = '';
  productType: string = '';
  printingSide: string = ''; // Front Side, Backside, Front and Backside, None
  colorMode: string = '';
  finishingRequirements: string = '';
  adminNotes: string = '';

  // Section 5: Dynamic Multi-Quantity Options (Empty by default until added)
  quantities: EstimateQuantityInput[] = [];

  // Section 6: Dynamic Manual Printing Expenses Matrix
  costItems: EstimateCostItemInput[] = [];

  // Section 7: Profit & Tax
  profitPercentage: number | null = null;
  taxPercentage: number | null = null;

  // Calculation Results
  calculationResults: QuantityCalculationResult[] = [];

  // Modals state
  showCustomMaterialModal: boolean = false;
  showCustomPaperSizeModal: boolean = false;
  showCustomExpenseModal: boolean = false;
  showBreakdownModal: boolean = false;
  showLinkQuotationModal: boolean = false;

  // Selected result for breakdown
  activeBreakdownResult: QuantityCalculationResult | null = null;

  // Custom Material Form
  newMaterialName: string = '';
  newMaterialMethod: string = '';
  newMaterialRateKg: number | null = null;
  newMaterialGsm: number | null = null;
  newMaterialPacketPrice: number | null = null;
  newMaterialSheetsPacket: number | null = null;

  // Custom Paper Size Form
  newSizeName: string = '';
  newSizeLength: number | null = null;
  newSizeWidth: number | null = null;

  // Custom Expense Form
  newExpenseName: string = '';
  newExpenseMethod: string = 'ManualAmount';
  newExpenseDefaultRate: number = 0;

  // Link to Quotation Form
  linkSelectedQuantity: number = 500;
  linkMode: 'new' | 'existing' = 'new';
  linkClientId: number | null = null;
  linkExistingQuotationId: number | null = null;
  linkProductTitleOverride: string = '';
  linkDescriptionOverride: string = '';
  linkUnitPriceOverride: number | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      categories: this.calcService.getCategories(),
      items: this.calcService.getItems(),
      printingSizes: this.calcService.getPrintingSizes(),
      paperSizes: this.calcService.getPaperSizes(),
      materials: this.calcService.getMaterials(),
      costCategories: this.calcService.getCostCategories(),
      clients: this.calcService.getClients(),
      machineRates: this.calcService.getMachineRates()
    }).subscribe({
      next: ({ categories, items, printingSizes, paperSizes, materials, costCategories, clients, machineRates }) => {
        this.categories = categories;
        this.allItems = items;
        this.filteredItems = [];
        this.printingSizes = printingSizes;
        this.paperSizes = paperSizes;
        this.materials = materials;
        this.costCategories = costCategories;
        this.clients = clients;
        if (machineRates && machineRates.length > 0) {
          this.confirmedMachineRates = machineRates;
          this.printingMachinesList = machineRates.map(m => m.machineName);
        }

        // Keep all dropdowns and inputs empty by default until user selects/adds them
        this.newEstimate(false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load initial master data', err);
        this.loading.set(false);
      }
    });
  }

  initializeDefaultCostItems(_cats: CostCategory[]): void {
    // Keep expenses matrix empty by default; user adds items or Steps 4-6 sync when configured
    this.costItems = [];
  }

  // Section 1: Category & Item Selection
  onCategoryChange(newCatId?: any): void {
    if (newCatId !== undefined && newCatId !== null) {
      this.selectedCategoryId = Number(newCatId);
    }
    this.filterItemsByCategory();
    // Reset item selection to empty placeholder when category changes
    this.selectedItemId = 0;
    this.selectedItem = null;
    this.selectedSizeId = null;
    this.canonicalWidthMm = null;
    this.canonicalHeightMm = null;
    this.displayedWidth = null;
    this.displayedHeight = null;
    this.recalculateAll();
  }

  filterItemsByCategory(): void {
    const catId = Number(this.selectedCategoryId);
    if (catId && catId > 0) {
      this.filteredItems = this.allItems.filter(i => Number(i.categoryId) === catId);
    } else {
      this.filteredItems = [];
    }
  }

  onItemSelect(itemId: any): void {
    const id = Number(itemId);
    this.selectedItemId = id;
    if (!id || id <= 0) {
      this.selectedItem = null;
      this.selectedSizeId = null;
      this.canonicalWidthMm = null;
      this.canonicalHeightMm = null;
      this.displayedWidth = null;
      this.displayedHeight = null;
      this.recalculateAll();
      return;
    }
    const item = this.allItems.find(i => Number(i.itemId) === id);
    if (item) {
      this.selectItem(item);
    }
  }

  selectItem(item: PrintingItem): void {
    this.selectedItemId = Number(item.itemId);
    this.selectedItem = item;
    this.selectedCategoryId = Number(item.categoryId);
    if (!this.jobTitle) {
      this.jobTitle = item.itemName;
    }
    this.productType = item.categoryName || item.itemName;

    // Load applicable & global printing sizes for this item without auto-selecting a size
    this.selectedSizeId = null;
    this.canonicalWidthMm = null;
    this.canonicalHeightMm = null;
    this.displayedWidth = null;
    this.displayedHeight = null;
    this.loadPrintingSizesForItem(this.selectedItemId, false);
    this.recalculateAll();
  }

  // Step 2 — Size Selection & Unit Conversion
  loadPrintingSizesForItem(itemId?: number, autoSelect: boolean = false): void {
    this.calcService.getPrintingSizes(itemId).subscribe({
      next: (sizes) => {
        this.printingSizes = sizes;
        if (autoSelect) {
          const applicable = sizes.find(s => s.isApplicableToCurrentItem && s.isDefault) ||
                             sizes.find(s => s.isApplicableToCurrentItem);
          const fallback = sizes.find(s => s.sizeName !== 'Custom Size') || sizes[0];
          const chosen = applicable || fallback;
          if (chosen) {
            this.applySelectedPrintingSize(chosen);
          }
        }
      },
      error: (err) => console.error('Failed to load printing sizes', err)
    });
  }

  onSizeSelect(sizeId: any): void {
    if (sizeId === null || sizeId === undefined || sizeId === '' || Number(sizeId) === 0) {
      this.selectedSizeId = null;
      this.isCustomSize = false;
      this.canonicalWidthMm = null;
      this.canonicalHeightMm = null;
      this.displayedWidth = null;
      this.displayedHeight = null;
      this.finishedWidth = null;
      this.finishedHeight = null;
      this.recalculateAll();
      return;
    }
    const id = Number(sizeId);
    this.selectedSizeId = id;
    const size = this.printingSizes.find(s => Number(s.sizeId) === id);
    if (!size) return;
    this.applySelectedPrintingSize(size);
  }

  // Getters for grouped size display according to selected item
  get applicableSizes(): PrintingSize[] {
    return this.printingSizes.filter(s => s.isApplicableToCurrentItem && !this.isCustomSizeItem(s));
  }

  get otherSizes(): PrintingSize[] {
    return this.printingSizes.filter(s => !s.isApplicableToCurrentItem && !this.isCustomSizeItem(s));
  }

  get customSizes(): PrintingSize[] {
    return this.printingSizes.filter(s => this.isCustomSizeItem(s));
  }

  isCustomSizeItem(s: PrintingSize): boolean {
    if (!s) return false;
    return Number(s.sizeId) === 14 || 
           s.displayOrder === 999 || 
           Boolean(s.sizeName && s.sizeName.toLowerCase().includes('custom'));
  }

  hasApplicableSizes(): boolean {
    return this.applicableSizes.length > 0;
  }

  applySelectedPrintingSize(size: PrintingSize): void {
    this.selectedSizeId = Number(size.sizeId);
    if (this.isCustomSizeItem(size)) {
      this.isCustomSize = true;
      // If we don't have canonical dimensions or switching to custom, retain current or initialize
      if (this.canonicalWidthMm === null || this.canonicalWidthMm === undefined) this.canonicalWidthMm = 100;
      if (this.canonicalHeightMm === null || this.canonicalHeightMm === undefined) this.canonicalHeightMm = 100;
      this.syncDisplayFromCanonical();
    } else {
      this.isCustomSize = false;
      this.canonicalWidthMm = size.widthMm ?? null;
      this.canonicalHeightMm = size.heightMm ?? null;
      this.syncDisplayFromCanonical();
    }
    this.syncFinishedDimensions();
    this.recalculateAll();
  }

  enableCustomDimensionsManual(): void {
    const custom = this.printingSizes.find(s => this.isCustomSizeItem(s));
    if (custom) {
      this.onSizeSelect(custom.sizeId);
    } else {
      this.isCustomSize = true;
      this.recalculateAll();
    }
  }

  onUnitChange(unit: 'MM' | 'CM' | 'Inches'): void {
    this.selectedUnit = unit;
    this.syncDisplayFromCanonical();
    this.syncFinishedDimensions();
    this.recalculateAll();
  }

  syncDisplayFromCanonical(): void {
    if (this.canonicalWidthMm === null || this.canonicalHeightMm === null) {
      this.displayedWidth = null;
      this.displayedHeight = null;
      return;
    }
    if (this.selectedUnit === 'MM') {
      this.displayedWidth = parseFloat(this.canonicalWidthMm.toFixed(2));
      this.displayedHeight = parseFloat(this.canonicalHeightMm.toFixed(2));
    } else if (this.selectedUnit === 'CM') {
      // 1 cm = 10 mm
      this.displayedWidth = parseFloat((this.canonicalWidthMm / 10).toFixed(2));
      this.displayedHeight = parseFloat((this.canonicalHeightMm / 10).toFixed(2));
    } else if (this.selectedUnit === 'Inches') {
      // 1 inch = 25.4 mm
      this.displayedWidth = parseFloat((this.canonicalWidthMm / 25.4).toFixed(2));
      this.displayedHeight = parseFloat((this.canonicalHeightMm / 25.4).toFixed(2));
    }
  }

  onCustomDimensionChange(): void {
    const w = Number(this.displayedWidth) || 0;
    const h = Number(this.displayedHeight) || 0;

    if (w < 0 || h < 0) return;

    if (this.selectedUnit === 'MM') {
      this.canonicalWidthMm = parseFloat(w.toFixed(2));
      this.canonicalHeightMm = parseFloat(h.toFixed(2));
    } else if (this.selectedUnit === 'CM') {
      // 1 cm = 10 mm
      this.canonicalWidthMm = parseFloat((w * 10).toFixed(2));
      this.canonicalHeightMm = parseFloat((h * 10).toFixed(2));
    } else if (this.selectedUnit === 'Inches') {
      // 1 inch = 25.4 mm
      this.canonicalWidthMm = parseFloat((w * 25.4).toFixed(2));
      this.canonicalHeightMm = parseFloat((h * 25.4).toFixed(2));
    }

    this.syncFinishedDimensions();
    this.recalculateAll();
  }

  syncFinishedDimensions(): void {
    if (this.canonicalWidthMm && this.canonicalHeightMm) {
      this.finishedWidth = parseFloat((this.canonicalWidthMm / 25.4).toFixed(2));
      this.finishedHeight = parseFloat((this.canonicalHeightMm / 25.4).toFixed(2));
      this.finishedUnit = 'in';
    }
  }

  // Step 3 — Printing Side & Color Methods
  onPrintingSideChange(side: string): void {
    this.printingSide = side;
    this.syncSuggestedPlateQuantity();
    this.recalculateAll();
  }

  onPrintingColorChange(val: any): void {
    const num = val !== null && val !== undefined && val !== '' ? Number(val) : null;
    this.printingColorCount.setValue(num);
    if (num !== null) {
      this.colorMode = num === 0 ? 'None' : `${num} Color${num > 1 ? 's' : ''}`;
    }
    this.syncSuggestedPlateQuantity();
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  onRatePerColorChange(): void {
    if (this.applyPerColorFormula) {
      this.printingCostMethod = 'PerColor';
      this.printingRate = this.ratePerColor;
    }
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  togglePerColorFormula(enabled: boolean): void {
    this.applyPerColorFormula = enabled;
    if (enabled) {
      this.printingCostMethod = 'PerColor';
      if (this.ratePerColor !== null && this.ratePerColor !== undefined) {
        this.printingRate = this.ratePerColor;
      }
    }
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  updatePerColorExpenseIfConfigured(): void {
    // Synchronized directly via recalculateAll() & Step 5 authoritative printing cost
  }

  // =========================================================================
  // STEP 4 — PLATE / CTP & PREPRESS METHODS & GETTERS
  // =========================================================================
  get printedSidesCount(): number {
    if (!this.printingSide || this.printingSide === 'None') return 0;
    if (this.printingSide === 'Front and Backside' || this.printingSide === 'Both Sides') return 2;
    // Front Side or Backside each count as 1 printed side
    return 1;
  }

  get suggestedPlateQuantity(): number {
    const colors = Math.max(0, Number(this.printingColorCount.value) || 0);
    return colors * this.printedSidesCount;
  }

  syncSuggestedPlateQuantity(): void {
    if (!this.isPlateQuantityManual) {
      this.plateQuantity = this.suggestedPlateQuantity;
    }
  }

  // =========================================================================
  // STEP 4 — PLATE / CTP (DOCUMENTED REQUIREMENTS: Plate / CTP, 5A, Positive / Negative)
  // =========================================================================
  onPlateMethodChange(method: string): void {
    this.plateMakingMethod = method;
    this.syncPlateRateFromMachine();
    this.recalculateAll();
  }

  onPlatePolarityChange(polarity: 'Positive' | 'Negative' | ''): void {
    this.filmType = polarity;
    this.recalculateAll();
  }

  onPlateCodeChange(code: string): void {
    this.plateCode = code;
    this.recalculateAll();
  }

  onPlateChargeTypeChange(type: 'Printing Plate' | 'Plate Per Set'): void {
    this.plateChargeType = type;
    this.syncPlateRateFromMachine();
    this.recalculateAll();
  }

  syncPlateRateFromMachine(): void {
    const m = this.selectedMachineRateObj;
    if (m) {
      if (this.plateChargeType === 'Plate Per Set') {
        this.plateChargeRate = m.platePerSet;
      } else {
        this.plateChargeRate = m.printingPlate;
      }
    } else {
      this.plateChargeRate = null;
    }
  }

  get plateConfigStatus(): 'Not Selected' | 'Incomplete' | 'Configured' {
    if (!this.plateMakingMethod && !this.selectedMachineRateObj) return 'Not Selected';
    if (!this.selectedMachineRateObj) return 'Incomplete';
    if (this.plateChargeType === 'Plate Per Set') {
      return (this.plateSetQuantity && this.plateSetQuantity > 0) ? 'Configured' : 'Incomplete';
    } else {
      return (this.plateQuantity && this.plateQuantity > 0) ? 'Configured' : 'Incomplete';
    }
  }

  get prepressConfigStatus(): 'Not Selected' | 'Incomplete' | 'Configured' {
    return this.plateConfigStatus;
  }

  // =========================================================================
  // STEP 5 — PRINTING COST (CONFIRMED 4 MACHINES ONLY)
  // =========================================================================
  get selectedMachineRateObj(): PrintingMachineRate | undefined {
    return this.confirmedMachineRates.find(m => m.machineName === this.printingMachine);
  }

  onMachineSelect(machineName: string): void {
    this.printingMachine = machineName;
    const machine = this.selectedMachineRateObj;
    if (machine) {
      if (this.printingChargeType === 'Print Per Set') {
        this.printingChargeRate = machine.printPerSet;
      } else {
        this.printingChargeType = 'Print Per Plate';
        this.printingChargeRate = machine.printPerPlate;
      }
      this.syncPlateRateFromMachine();
    } else {
      this.printingChargeRate = null;
      this.plateChargeRate = null;
    }
    this.recalculateAll();
  }

  onPrintingChargeTypeChange(type: 'Print Per Plate' | 'Print Per Set'): void {
    this.printingChargeType = type;
    const m = this.selectedMachineRateObj;
    if (m) {
      if (type === 'Print Per Plate') {
        this.printingChargeRate = m.printPerPlate;
      } else if (type === 'Print Per Set') {
        this.printingChargeRate = m.printPerSet;
      }
    }
    this.recalculateAll();
  }

  get printingCostSourceLabel(): string {
    if (!this.printingMachine) {
      return 'No Machine Selected';
    }
    if (this.printingChargeType === 'Print Per Set') {
      return `${this.printingMachine} — Print Per Set`;
    }
    return `${this.printingMachine} — Print Per Plate`;
  }

  get printingConfigStatus(): 'Not Selected' | 'Incomplete' | 'Configured' {
    if (!this.printingMachine) return 'Not Selected';
    if (!this.printingChargeQty || this.printingChargeQty <= 0) return 'Incomplete';
    return 'Configured';
  }

  // =========================================================================
  // STEP 6 — LAMINATION (CONFIRMED GLOSSY & MATTE ONLY — SQUARE FOOT FORMULA)
  // =========================================================================
  get defaultLaminationWidthInches(): number {
    if (this.finishedWidth && this.finishedUnit === 'in') return this.finishedWidth;
    if (this.canonicalWidthMm) return parseFloat((this.canonicalWidthMm / 25.4).toFixed(2));
    if (this.stockPaperLength) return this.stockPaperLength;
    return 0;
  }

  get defaultLaminationHeightInches(): number {
    if (this.finishedHeight && this.finishedUnit === 'in') return this.finishedHeight;
    if (this.canonicalHeightMm) return parseFloat((this.canonicalHeightMm / 25.4).toFixed(2));
    if (this.stockPaperWidth) return this.stockPaperWidth;
    return 0;
  }

  get effectiveLaminationWidth(): number {
    if (this.laminationSheetWidthInches !== null && this.laminationSheetWidthInches !== undefined && this.laminationSheetWidthInches > 0) {
      return this.laminationSheetWidthInches;
    }
    return this.defaultLaminationWidthInches;
  }

  get effectiveLaminationHeight(): number {
    if (this.laminationSheetHeightInches !== null && this.laminationSheetHeightInches !== undefined && this.laminationSheetHeightInches > 0) {
      return this.laminationSheetHeightInches;
    }
    return this.defaultLaminationHeightInches;
  }

  get confirmedLaminationRate(): number {
    if (this.laminationType === 'Glossy') return 2.80;
    if (this.laminationType === 'Matte') return 3.25;
    return 0;
  }

  get activeLaminationRate(): number {
    return this.confirmedLaminationRate;
  }

  get laminationSheetAreaSqFt(): number {
    const w = Math.max(0, Number(this.effectiveLaminationWidth) || 0);
    const h = Math.max(0, Number(this.effectiveLaminationHeight) || 0);
    if (w <= 0 || h <= 0) return 0;
    return parseFloat(((w * h) / 144).toFixed(4));
  }

  get laminationSideMultiplier(): number {
    return this.laminationSides === 'Double Side' ? 2 : 1;
  }

  onLaminationTypeChange(type: '' | 'None' | 'Glossy' | 'Matte'): void {
    this.laminationType = type;
    if (!type || type === 'None') {
      this.laminationCost = 0;
      this.laminationRatePerSqFt = 0;
    } else if (type === 'Glossy') {
      this.laminationRatePerSqFt = 2.80;
    } else if (type === 'Matte') {
      this.laminationRatePerSqFt = 3.25;
    }
    if (type && type !== 'None') {
      if (!this.laminationSides) this.laminationSides = 'Single Side';
      if (!this.laminationSheetWidthInches && this.defaultLaminationWidthInches > 0) {
        this.laminationSheetWidthInches = this.defaultLaminationWidthInches;
      }
      if (!this.laminationSheetHeightInches && this.defaultLaminationHeightInches > 0) {
        this.laminationSheetHeightInches = this.defaultLaminationHeightInches;
      }
      if (!this.laminationQuantity) {
        const firstTier = this.quantities[this.activeSummaryQuantityIndex] || this.quantities[0];
        if (firstTier) {
          this.laminationQuantity = firstTier.totalSheets > 0 ? firstTier.totalSheets : firstTier.quantity;
        }
      }
    }
    this.recalculateAll();
  }

  syncLaminationDimensionsFromStock(): void {
    if (this.stockPaperLength && this.stockPaperWidth) {
      this.laminationSheetWidthInches = this.stockPaperLength;
      this.laminationSheetHeightInches = this.stockPaperWidth;
      this.recalculateAll();
    } else if (this.defaultLaminationWidthInches > 0 && this.defaultLaminationHeightInches > 0) {
      this.laminationSheetWidthInches = this.defaultLaminationWidthInches;
      this.laminationSheetHeightInches = this.defaultLaminationHeightInches;
      this.recalculateAll();
    }
  }

  get laminationConfigStatus(): 'Not Required' | 'Not Selected' | 'Incomplete' | 'Configured' {
    if (!this.laminationType) return 'Not Selected';
    if (this.laminationType === 'None') return 'Not Required';
    if (this.effectiveLaminationWidth <= 0 || this.effectiveLaminationHeight <= 0 || !this.laminationQuantity || this.laminationQuantity <= 0) {
      return 'Incomplete';
    }
    return 'Configured';
  }

  // =========================================================================
  // RIGHT-SIDE LIVE JOB SUMMARY GETTERS
  // =========================================================================
  get selectedCategoryName(): string {
    return this.categories.find(c => Number(c.categoryId) === Number(this.selectedCategoryId))?.categoryName || 'Not Selected';
  }

  get selectedPrintingSizeLabel(): string {
    if (this.isCustomSize) return 'Custom Size';
    return this.printingSizes.find(s => Number(s.sizeId) === Number(this.selectedSizeId))?.sizeName || 'Not Selected';
  }

  get activeSummaryResult(): QuantityCalculationResult | null {
    if (!this.calculationResults || this.calculationResults.length === 0) return null;
    const idx = Math.min(Math.max(0, this.activeSummaryQuantityIndex), this.calculationResults.length - 1);
    return this.calculationResults[idx];
  }

  get activeMaterialCost(): number {
    return this.activeSummaryResult?.materialCost ?? 0;
  }

  get activeOtherExpenses(): number {
    const res = this.activeSummaryResult;
    if (!res) return 0;
    let sum = 0;
    for (const [key, val] of Object.entries(res.costItemBreakdown)) {
      const k = key.toLowerCase();
      if (k === 'plates' || k === 'positive / tracing' || k === 'printing' || k === 'lamination') {
        continue;
      }
      sum += Number(val) || 0;
    }
    return parseFloat(sum.toFixed(2));
  }

  get activeTotalProductionCost(): number {
    const total =
      this.printingColorCost +
      this.plateCost +
      this.machinePrintingCost +
      this.laminationCost +
      this.activeMaterialCost +
      this.activeOtherExpenses;
    return parseFloat(total.toFixed(2));
  }

  // Section 4 (Step 7): Material Selection
  onMaterialSelect(matId: number): void {
    const id = Number(matId) || 0;
    if (!id) {
      this.selectedMaterialId = 0;
      this.selectedMaterial = null;
      this.materialVariant = '';
      this.pricingMethod = '';
      this.gsm = null;
      this.ratePerKg = null;
      this.packetPrice = null;
      this.sheetsPerPacket = null;
      this.rimPrice = null;
      this.sheetsPerRim = null;
      this.directSheetPrice = null;
      this.manualMaterialCost = null;
      this.computedPerSheetPrice = 0;
      this.recalculateAll();
      return;
    }
    const mat = this.materials.find(m => m.materialId === id);
    if (mat) {
      this.selectMaterial(mat);
    }
  }

  selectMaterial(mat: PrintingMaterial): void {
    this.selectedMaterialId = mat.materialId;
    this.selectedMaterial = mat;
    this.pricingMethod = mat.pricingMethod || 'RatePerKg';
    this.ratePerKg = mat.defaultRatePerKg ?? null;
    this.conversionFactor = mat.defaultConversionFactor ?? 3100;
    this.sheetsPerRim = mat.defaultSheetsPerRim ?? 500;
    this.gsm = mat.defaultGsm ?? null;
    this.packetPrice = mat.packetPrice ?? null;
    this.sheetsPerPacket = mat.sheetsPerPacket ?? 100;

    if (mat.defaultLength && mat.defaultWidth) {
      this.stockPaperLength = mat.defaultLength;
      this.stockPaperWidth = mat.defaultWidth;
    }

    this.materialVariant = `${mat.materialName}${this.gsm ? ' ' + this.gsm + ' GSM' : ''}${this.stockPaperLength && this.stockPaperWidth ? ' (' + this.stockPaperLength + '×' + this.stockPaperWidth + ')' : ''}`;
    this.computePerSheetPrice();
    this.recalculateAll();
  }

  onPricingMethodChange(): void {
    this.computePerSheetPrice();
    this.recalculateAll();
  }

  // Paper Size Presets
  onPaperSizePresetSelect(sizeId: number | null): void {
    if (!sizeId) {
      this.stockPaperSizeId = null;
      this.stockPaperLength = null;
      this.stockPaperWidth = null;
      this.computePerSheetPrice();
      this.recalculateAll();
      return;
    }
    const size = this.paperSizes.find(s => s.paperSizeId === +sizeId);
    if (size) {
      this.stockPaperSizeId = size.paperSizeId;
      if (size.lengthInches && size.widthInches) {
        this.stockPaperLength = size.lengthInches;
        this.stockPaperWidth = size.widthInches;
        this.stockPaperUnit = 'in';
      }
      this.computePerSheetPrice();
      this.recalculateAll();
    }
  }

  // Calculation Engine Client-Side (Instant Feedback)
  computePerSheetPrice(): void {
    if (!this.pricingMethod) {
      this.computedPerSheetPrice = 0;
      return;
    }
    if (this.pricingMethod === 'PacketPrice') {
      const pPrice = Number(this.packetPrice) || 0;
      const sPerPkt = Number(this.sheetsPerPacket) || 0;
      if (pPrice > 0 && sPerPkt > 0) {
        this.computedPerSheetPrice = parseFloat((pPrice / sPerPkt).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    } else if (this.pricingMethod === 'DirectRimPrice') {
      const rPrice = Number(this.rimPrice) || 0;
      const sPerRim = Number(this.sheetsPerRim) || 0;
      if (rPrice > 0 && sPerRim > 0) {
        this.computedPerSheetPrice = parseFloat((rPrice / sPerRim).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    } else if (this.pricingMethod === 'DirectSheetPrice') {
      this.computedPerSheetPrice = parseFloat((Number(this.directSheetPrice) || 0).toFixed(4));
    } else if (this.pricingMethod === 'ManualMaterialCost') {
      this.computedPerSheetPrice = 0;
    } else {
      // Rate per KG Formula: (Length * Width * GSM) / factor -> Rim Weight. Rim Weight * Rate / sheetsPerRim -> Sheet Price
      const l = Number(this.stockPaperLength) || 0;
      const w = Number(this.stockPaperWidth) || 0;
      const g = Number(this.gsm) || 0;
      const rate = Number(this.ratePerKg) || 0;
      const factor = (this.conversionFactor && this.conversionFactor > 0) ? this.conversionFactor : 3100;
      const rimSheets = (this.sheetsPerRim && this.sheetsPerRim > 0) ? this.sheetsPerRim : 500;

      if (l > 0 && w > 0 && g > 0 && rate > 0) {
        const rimWeight = (l * w * g) / factor;
        const rimCost = rimWeight * rate;
        this.computedPerSheetPrice = parseFloat((rimCost / rimSheets).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    }
  }

  get printingColorCost(): number {
    const count = Number(this.printingColorCount.value) || 0;
    const rate = Number(this.ratePerColor) || 0;
    return (this.applyPerColorFormula && count > 0 && rate > 0) ? (count * rate) : 0;
  }

  onPlateTypeChange(type: string): void {
    this.plateType = type;
    this.plateMakingMethod = type;
    this.recalculateAll();
  }

  onPlateSizeCodeChange(code: string): void {
    this.plateSizeCode = code;
    this.plateCode = code;
    this.recalculateAll();
  }

  onStep5PrintingColorChange(color: string): void {
    this.step5PrintingColor = color;
    this.recalculateAll();
  }

  onLaminationTypeSelect(type: string): void {
    this.laminationType = type as any;
    if (type === 'None') {
      this.laminationCostRate = 0;
    } else if (type === 'Glossy') {
      if (!this.laminationCostRate || this.laminationCostRate === 0) {
        this.laminationCostRate = 0.75;
      }
    } else if (type === 'Matte') {
      if (!this.laminationCostRate || this.laminationCostRate === 0) {
        this.laminationCostRate = 1.00;
      }
    }
    this.recalculateAll();
  }

  computeSteps4To6Costs(): void {
    // 1. Step 4 — Plate / CTP Cost
    let pCost = 0;
    if (this.plateType === 'No Plate Required' || this.plateMakingMethod === 'No Plate Required') {
      pCost = 0;
    } else {
      if (this.printingMachine === 'Solna' || this.printingMachine === 'Solna 125' || this.plateSizeCode === '645 × 510' || this.plateSizeCode === '5A') {
        pCost = 2200;
      } else if (this.printingMachine === 'GTO 46') {
        pCost = 2000;
      } else if (this.printingMachine === 'GTO 52') {
        pCost = 2200;
      } else if (this.printingMachine === 'Heidelberg') {
        pCost = 6000;
      } else {
        pCost = 2200;
      }
    }
    this.plateCost = parseFloat(pCost.toFixed(2));
    this.prepressCost = this.plateCost;

    // 2. Step 5 — Printing (Machine) Cost
    let printCost = 0;
    const pRate = Number(this.printingCostRate) || 0;
    const pQty = Number(this.printingCostQuantity) || 0;
    if (this.printingCostMethod === 'Per Sheet') {
      printCost = pRate * pQty;
    } else if (this.printingCostMethod === 'Per 1,000') {
      printCost = (pQty / 1000) * pRate;
    } else {
      printCost = pRate;
    }
    this.baseMachinePrintingCost = parseFloat(printCost.toFixed(2));
    this.machinePrintingCost = this.baseMachinePrintingCost;

    // 3. Step 6 — Lamination Cost
    let lamCost = 0;
    if (this.laminationType === 'None' || !this.laminationType) {
      lamCost = 0;
    } else {
      const lRate = Number(this.laminationCostRate) || 0;
      const lQty = Number(this.laminationCostQuantity) || 0;
      if (this.laminationCostMethod === 'Per Sheet') {
        lamCost = lRate * lQty;
      } else if (this.laminationCostMethod === 'Per 1,000') {
        lamCost = (lQty / 1000) * lRate;
      } else {
        lamCost = lRate;
      }
    }
    this.laminationCost = parseFloat(lamCost.toFixed(2));

    // Sync into costItems matrix if needed
    const syncOrUpsertExpense = (itemName: string, amount: number) => {
      const existing = this.costItems.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
      if (existing) {
        existing.unitRate = amount;
        for (const q of this.quantities) {
          if (q.quantity > 0) {
            existing.quantityAmounts[q.quantity] = amount;
          }
        }
      } else if (amount > 0) {
        const qMap: { [q: number]: number } = {};
        for (const q of this.quantities) {
          if (q.quantity > 0) {
            qMap[q.quantity] = amount;
          }
        }
        this.costItems.push({
          itemName,
          calculationMethod: 'FixedAmount',
          unitRate: amount,
          notes: '',
          quantityAmounts: qMap
        });
      }
    };

    syncOrUpsertExpense('Plates', this.plateCost);
    syncOrUpsertExpense('Printing', this.machinePrintingCost);
    syncOrUpsertExpense('Lamination', this.laminationCost);
  }

  recalculateAll(): void {
    this.computePerSheetPrice();
    this.computeSteps4To6Costs();

    const results: QuantityCalculationResult[] = [];
    const profitPct = Number(this.profitPercentage) || 0;
    const taxPct = Number(this.taxPercentage) || 0;

    for (const q of this.quantities) {
      const qtyVal = Number(q.quantity) || 0;
      const sheetsReq = Number(q.sheetsRequired) || 0;
      const wastePct = Number(q.wastagePercent) || 0;
      let wasteSheets = Number(q.wastageSheets) || 0;

      if (wastePct > 0 && wasteSheets === 0) {
        wasteSheets = parseFloat(((sheetsReq * wastePct) / 100).toFixed(2));
        q.wastageSheets = wasteSheets;
      }
      q.totalSheets = parseFloat((sheetsReq + wasteSheets).toFixed(2));

      if (qtyVal <= 0) continue;

      // Material Cost
      let matCost = 0;
      if (this.pricingMethod === 'ManualMaterialCost') {
        matCost = Number(this.manualMaterialCost) || 0;
      } else {
        matCost = parseFloat((q.totalSheets * this.computedPerSheetPrice).toFixed(2));
      }

      // Additional Expenses
      const breakdown: { [itemName: string]: number } = {};
      let totalExpenses = 0;

      for (const item of this.costItems) {
        let amount = 0;
        if (item.quantityAmounts && item.quantityAmounts[qtyVal] !== undefined) {
          amount = +item.quantityAmounts[qtyVal];
        } else {
          // Calculation method fallback
          if (item.calculationMethod === 'FixedAmount') {
            amount = +item.unitRate;
          } else if (item.calculationMethod === 'PerPiece' || item.calculationMethod === 'RatePerUnit') {
            amount = parseFloat((+item.unitRate * qtyVal).toFixed(2));
          } else if (item.calculationMethod === 'PerSheet') {
            amount = parseFloat((+item.unitRate * q.totalSheets).toFixed(2));
          }
          if (!item.quantityAmounts) item.quantityAmounts = {};
          item.quantityAmounts[qtyVal] = amount;
        }

        breakdown[item.itemName] = amount;
        totalExpenses += amount;
      }

      const prodCost = parseFloat((matCost + totalExpenses).toFixed(2));
      const profitAmt = parseFloat((prodCost * (profitPct / 100)).toFixed(2));
      const subtotal = parseFloat((prodCost + profitAmt).toFixed(2));
      const taxAmt = parseFloat((subtotal * (taxPct / 100)).toFixed(2));
      const grandTotal = parseFloat((subtotal + taxAmt).toFixed(2));
      const perPiece = qtyVal > 0 ? parseFloat((grandTotal / qtyVal).toFixed(2)) : 0;

      results.push({
        quantity: qtyVal,
        sheetsRequired: sheetsReq,
        wastageSheets: wasteSheets,
        totalSheets: q.totalSheets,
        materialCost: matCost,
        costItemBreakdown: breakdown,
        additionalExpenses: totalExpenses,
        productionCost: prodCost,
        profitAmount: profitAmt,
        subtotalBeforeTax: subtotal,
        taxAmount: taxAmt,
        grandTotal: grandTotal,
        perPiecePrice: perPiece
      });
    }

    this.calculationResults = results;
  }

  // Quantity Management
  addQuantity(): void {
    this.quantities.push({
      quantity: null as any,
      sheetsRequired: null as any,
      wastagePercent: null as any,
      wastageSheets: null as any,
      totalSheets: 0
    });
    this.recalculateAll();
  }

  duplicateQuantity(idx: number): void {
    const src = this.quantities[idx];
    const srcQty = Number(src.quantity) || 0;
    const srcSheets = Number(src.sheetsRequired) || 0;
    const newQty = srcQty > 0 ? srcQty + 250 : (null as any);
    const newSheets = srcSheets > 0 ? srcSheets + 3 : (null as any);

    this.quantities.splice(idx + 1, 0, {
      quantity: newQty,
      sheetsRequired: newSheets,
      wastagePercent: src.wastagePercent,
      wastageSheets: src.wastageSheets,
      totalSheets: (Number(newSheets) || 0) + (Number(src.wastageSheets) || 0)
    });

    if (newQty) {
      for (const item of this.costItems) {
        item.quantityAmounts[newQty] = item.quantityAmounts[srcQty] || 0;
      }
    }

    this.recalculateAll();
  }

  removeQuantity(idx: number): void {
    const removed = this.quantities[idx];
    this.quantities.splice(idx, 1);

    if (removed && removed.quantity) {
      for (const item of this.costItems) {
        delete item.quantityAmounts[removed.quantity];
      }
    }

    this.recalculateAll();
  }

  onCostItemAmountChange(item: EstimateCostItemInput, qty: number, newVal: any): void {
    const val = parseFloat(newVal) || 0;
    item.quantityAmounts[qty] = val;

    // If it's a fixed amount and user typed in the first column, optionally ask or sync
    if (item.calculationMethod === 'FixedAmount') {
      // Auto sync across all quantities
      for (const q of this.quantities) {
        item.quantityAmounts[q.quantity] = val;
      }
      item.unitRate = val;
    }

    this.recalculateAll();
  }

  onCostItemMethodChange(item: EstimateCostItemInput): void {
    if (item.calculationMethod === 'FixedAmount') {
      const fixedRate = item.unitRate;
      for (const q of this.quantities) {
        item.quantityAmounts[q.quantity] = fixedRate;
      }
    } else if (item.calculationMethod === 'PerPiece' || item.calculationMethod === 'RatePerUnit') {
      for (const q of this.quantities) {
        item.quantityAmounts[q.quantity] = parseFloat((item.unitRate * q.quantity).toFixed(2));
      }
    } else if (item.calculationMethod === 'PerSheet') {
      for (const q of this.quantities) {
        item.quantityAmounts[q.quantity] = parseFloat((item.unitRate * q.totalSheets).toFixed(2));
      }
    }
    this.recalculateAll();
  }

  addCustomExpense(name: string, method: string, defaultRate: number): void {
    if (!name.trim()) {
      this.toast.error('Expense name is required.');
      return;
    }

    const amounts: { [q: number]: number } = {};
    for (const q of this.quantities) {
      if (method === 'FixedAmount') amounts[q.quantity] = defaultRate;
      else if (method === 'PerPiece') amounts[q.quantity] = defaultRate * q.quantity;
      else if (method === 'PerSheet') amounts[q.quantity] = defaultRate * q.totalSheets;
      else amounts[q.quantity] = 0;
    }

    this.costItems.push({
      itemName: name.trim(),
      calculationMethod: method,
      unitRate: defaultRate,
      notes: '',
      quantityAmounts: amounts
    });

    this.showCustomExpenseModal = false;
    this.newExpenseName = '';
    this.newExpenseDefaultRate = 0;
    this.recalculateAll();
    this.toast.success(`Expense "${name}" added.`);
  }

  removeExpense(idx: number): void {
    this.costItems.splice(idx, 1);
    this.recalculateAll();
  }

  // Save Estimate to Backend
  saveEstimate(): void {
    const payload: SaveEstimateRequest = {
      estimateId: this.currentEstimateId ?? undefined,
      estimateNumber: this.currentEstimateNumber ?? undefined,
      estimateTitle: this.estimateTitle || this.jobTitle || 'Printing Estimate',
      categoryId: this.selectedCategoryId > 0 ? this.selectedCategoryId : undefined,
      itemId: this.selectedItemId > 0 ? this.selectedItemId : undefined,
      customItemName: this.selectedItem?.isCustom ? this.selectedItem.itemName : undefined,
      productType: this.productType,
      jobTitle: this.jobTitle,
      jobDescription: this.jobTitle,
      printingSide: this.printingSide || 'Front Side',
      colorMode: this.colorMode,
      printingColorCount: this.printingColorCount.value ?? undefined,
      ratePerColor: this.ratePerColor ?? undefined,
      finishingRequirements: this.finishingRequirements,
      adminNotes: this.adminNotes,

      finishedWidth: this.finishedWidth ?? undefined,
      finishedHeight: this.finishedHeight ?? undefined,
      finishedUnit: this.finishedUnit,
      printingSizeId: this.selectedSizeId ?? undefined,
      printingSizeName: this.printingSizes.find(s => s.sizeId === this.selectedSizeId)?.sizeName,
      widthMm: this.canonicalWidthMm ?? undefined,
      heightMm: this.canonicalHeightMm ?? undefined,
      measurementUnit: this.selectedUnit,
      stockPaperSizeId: this.stockPaperSizeId ?? undefined,
      stockPaperLength: this.stockPaperLength ?? undefined,
      stockPaperWidth: this.stockPaperWidth ?? undefined,
      stockPaperUnit: this.stockPaperUnit,

      materialId: this.selectedMaterialId > 0 ? this.selectedMaterialId : undefined,
      materialVariantName: this.materialVariant,
      gsm: this.gsm ?? 0,
      pricingMethod: this.pricingMethod || 'RatePerKg',
      ratePerKg: this.ratePerKg ?? 0,
      conversionFactor: this.conversionFactor ?? 3100,
      packetPrice: this.packetPrice ?? 0,
      sheetsPerPacket: this.sheetsPerPacket ?? 100,
      rimPrice: this.rimPrice ?? 0,
      sheetsPerRim: this.sheetsPerRim ?? 500,
      directSheetPrice: this.directSheetPrice ?? 0,
      manualMaterialCost: this.manualMaterialCost ?? 0,
      computedPerSheetPrice: this.computedPerSheetPrice,

      profitPercentage: this.profitPercentage ?? 0,
      taxPercentage: this.taxPercentage ?? 0,

      // Step 4: Plate / CTP & Prepress
      plateMakingMethod: this.plateMakingMethod,
      selectedPlateSizeId: this.selectedPlateSizeId,
      selectedPlateSizeName: this.selectedPlatePreset?.label || '',
      plateCode: this.plateCode,
      filmType: this.filmType,
      plateQuantity: this.plateQuantity ?? 0,
      isPlateQuantityManual: this.isPlateQuantityManual,
      platePricingMethod: this.platePricingMethod,
      platesPerSet: this.platesPerSet ?? 4,
      singlePlateRate: this.singlePlateRate ?? 0,
      setPlateRate: this.setPlateRate ?? 0,
      manualPlateCost: this.manualPlateCost ?? 0,
      filmQuantity: this.filmQuantity ?? 0,
      ratePerFilm: this.ratePerFilm ?? undefined,
      otherPrepressCharges: this.otherPrepressCharges ?? 0,
      computedPlateCost: this.plateCost,
      computedFilmCost: this.filmCost,
      computedPrepressCost: this.prepressCost,

      // Step 5: Printing Cost (Color & Machine Wise)
      printingMachine: this.printingMachine,
      customPrintingMachine: this.customPrintingMachine,
      printingQuantity: this.printingQuantity ?? 0,
      printingCostMethod: this.printingCostMethod,
      perColorRateScope: this.perColorRateScope,
      printingRate: this.printingRate ?? undefined,
      manualPrintingAmount: this.manualPrintingAmount ?? 0,
      machineSetupCharge: this.machineSetupCharge ?? 0,
      additionalRunCharge: this.additionalRunCharge ?? 0,
      otherPrintingCharges: this.otherPrintingCharges ?? 0,
      applyPerColorFormula: this.applyPerColorFormula,
      computedMachinePrintingCost: this.machinePrintingCost,

      // Step 6: Lamination (Glossy / Matte)
      laminationType: this.laminationType,
      laminationSides: this.laminationSides,
      laminationCostMethod: this.laminationCostMethod,
      laminationQuantity: this.laminationQuantity ?? 0,
      glossyLaminationRate: this.glossyLaminationRate ?? undefined,
      matteLaminationRate: this.matteLaminationRate ?? undefined,
      laminationSheetWidthInches: this.laminationSheetWidthInches ?? 0,
      laminationSheetHeightInches: this.laminationSheetHeightInches ?? 0,
      applyLaminationSideMultiplier: this.applyLaminationSideMultiplier,
      manualLaminationAmount: this.manualLaminationAmount ?? 0,
      computedLaminationCost: this.laminationCost,

      quantities: this.quantities.filter(q => Number(q.quantity) > 0),
      costItems: this.costItems
    };

    this.calculating.set(true);
    this.calcService.saveEstimate(payload).subscribe({
      next: (saved) => {
        this.calculating.set(false);
        this.currentEstimateId = saved.estimateId;
        this.currentEstimateNumber = saved.estimateNumber;
        this.toast.success(`Estimate ${saved.estimateNumber} saved successfully!`);
        this.loadSavedEstimatesList();
      },
      error: (err) => {
        this.calculating.set(false);
        console.error('Failed to save estimate', err);
        this.toast.error('Failed to save estimate: ' + (err.error?.message || err.message));
      }
    });
  }

  // Load Saved Estimates
  loadSavedEstimatesList(): void {
    this.calcService.getEstimates(this.estimateSearch()).subscribe({
      next: (list) => this.estimates = list,
      error: (err) => console.error('Failed to fetch estimates', err)
    });
  }

  switchTab(tab: 'calculator' | 'saved-estimates'): void {
    this.activeTab.set(tab);
    if (tab === 'saved-estimates') {
      this.loadSavedEstimatesList();
    }
  }

  openSavedEstimate(id: number): void {
    this.loading.set(true);
    this.calcService.getEstimate(id).subscribe({
      next: (est) => {
        this.currentEstimateId = est.estimateId;
        this.currentEstimateNumber = est.estimateNumber;
        this.estimateTitle = est.estimateTitle || est.jobTitle || 'Printing Estimate';
        this.jobTitle = est.jobTitle || '';
        this.productType = est.productType || '';
        this.selectedCategoryId = est.categoryId || 0;
        this.filterItemsByCategory();
        this.selectedItemId = est.itemId || 0;
        this.selectedItem = this.allItems.find(i => i.itemId === this.selectedItemId) || null;

        this.finishedWidth = est.finishedWidth ?? null;
        this.finishedHeight = est.finishedHeight ?? null;
        this.finishedUnit = est.finishedUnit || 'in';

        // Restore Step 2 printing size and dimensions
        this.selectedSizeId = est.printingSizeId ?? null;
        this.selectedUnit = (est.measurementUnit as any) || 'MM';
        this.canonicalWidthMm = est.widthMm ?? (est.finishedWidth ? est.finishedWidth * 25.4 : null);
        this.canonicalHeightMm = est.heightMm ?? (est.finishedHeight ? est.finishedHeight * 25.4 : null);
        this.isCustomSize = est.printingSizeName === 'Custom Size';
        this.syncDisplayFromCanonical();
        if (this.selectedItemId) {
          this.loadPrintingSizesForItem(this.selectedItemId);
        }

        this.stockPaperSizeId = est.stockPaperSizeId ?? null;
        this.stockPaperLength = est.stockPaperLength ?? null;
        this.stockPaperWidth = est.stockPaperWidth ?? null;
        this.stockPaperUnit = est.stockPaperUnit || 'in';

        this.selectedMaterialId = est.materialId || 0;
        this.selectedMaterial = this.materials.find(m => m.materialId === this.selectedMaterialId) || null;
        this.materialVariant = est.materialVariantName || '';
        this.gsm = est.gsm || 300;
        this.pricingMethod = est.pricingMethod || 'RatePerKg';
        this.ratePerKg = est.ratePerKg || 680;
        this.conversionFactor = est.conversionFactor || 3100;
        this.packetPrice = est.packetPrice || 0;
        this.sheetsPerPacket = est.sheetsPerPacket || 100;
        this.rimPrice = est.rimPrice || 0;
        this.sheetsPerRim = est.sheetsPerRim || 500;
        this.directSheetPrice = est.directSheetPrice || 0;
        this.manualMaterialCost = est.manualMaterialCost || 0;
        this.computedPerSheetPrice = est.computedPerSheetPrice || 0;

        this.printingSide = est.printingSide || 'Front Side';
        this.colorMode = est.colorMode || '4 Color';
        this.printingColorCount.setValue(est.printingColorCount ?? null);
        this.ratePerColor = est.ratePerColor ?? null;
        this.applyPerColorFormula = est.applyPerColorFormula ?? !!(est.ratePerColor && est.ratePerColor > 0);
        this.finishingRequirements = est.finishingRequirements || '';
        this.adminNotes = est.adminNotes || '';

        // Restore Step 4: Plate / CTP & Prepress
        this.plateMakingMethod = est.plateMakingMethod || '';
        this.selectedPlateSizeId = est.selectedPlateSizeId || '';
        this.plateCode = est.plateCode || '';
        this.filmType = (est.filmType as any) || (this.plateMakingMethod === 'Film-Based Plate Making' ? 'Positive' : 'Not Applicable');
        this.plateQuantity = est.plateQuantity ?? this.suggestedPlateQuantity;
        this.isPlateQuantityManual = est.isPlateQuantityManual ?? false;
        this.platePricingMethod = (est.platePricingMethod as any) || 'Single Plate Rate';
        this.platesPerSet = est.platesPerSet || 4;
        this.singlePlateRate = est.singlePlateRate ?? 0;
        this.setPlateRate = est.setPlateRate ?? 0;
        this.manualPlateCost = est.manualPlateCost ?? 0;
        this.filmQuantity = est.filmQuantity ?? this.plateQuantity;
        this.isFilmQuantityManual = est.filmQuantity !== undefined && est.filmQuantity !== this.plateQuantity;
        this.ratePerFilm = est.ratePerFilm ?? null;
        this.otherPrepressCharges = est.otherPrepressCharges ?? 0;

        // Restore Step 5: Printing Cost (Color & Machine Wise)
        this.printingMachine = est.printingMachine || '';
        this.customPrintingMachine = est.customPrintingMachine || '';
        this.printingQuantity = est.printingQuantity ?? 1000;
        this.printingCostMethod = (est.printingCostMethod as any) || (this.applyPerColorFormula ? 'PerColor' : 'Per1000');
        this.perColorRateScope = (est.perColorRateScope as any) || 'FlatPerColor';
        this.printingRate = est.printingRate ?? (this.applyPerColorFormula ? this.ratePerColor : null);
        this.manualPrintingAmount = est.manualPrintingAmount ?? 0;
        this.machineSetupCharge = est.machineSetupCharge ?? 0;
        this.additionalRunCharge = est.additionalRunCharge ?? 0;
        this.otherPrintingCharges = est.otherPrintingCharges ?? 0;

        // Restore Step 6: Lamination (Glossy / Matte)
        this.laminationType = (est.laminationType as any) || 'None';
        this.laminationSides = (est.laminationSides as any) || 'Single Side';
        this.laminationCostMethod = (est.laminationCostMethod as any) || 'PerSheet';
        this.laminationQuantity = est.laminationQuantity ?? 100;
        this.glossyLaminationRate = est.glossyLaminationRate ?? null;
        this.matteLaminationRate = est.matteLaminationRate ?? null;
        this.laminationSheetWidthInches = est.laminationSheetWidthInches || (this.stockPaperLength || 25);
        this.laminationSheetHeightInches = est.laminationSheetHeightInches || (this.stockPaperWidth || 36);
        this.applyLaminationSideMultiplier = est.applyLaminationSideMultiplier ?? true;
        this.manualLaminationAmount = est.manualLaminationAmount ?? 0;

        this.profitPercentage = est.profitPercentage || 20;
        this.taxPercentage = est.taxPercentage || 0;

        if (est.quantities && est.quantities.length > 0) {
          this.quantities = est.quantities;
        }

        if (est.costItems && est.costItems.length > 0) {
          this.costItems = est.costItems;
        }

        this.recalculateAll();
        this.activeTab.set('calculator');
        this.loading.set(false);
        this.toast.info(`Loaded estimate ${est.estimateNumber}.`);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to load estimate', err);
        this.toast.error('Failed to load estimate.');
      }
    });
  }

  duplicateSavedEstimate(id: number): void {
    this.calcService.duplicateEstimate(id).subscribe({
      next: (dup) => {
        this.toast.success(`Duplicated as ${dup.estimateNumber}!`);
        this.openSavedEstimate(dup.estimateId);
      },
      error: (err) => {
        console.error('Failed to duplicate estimate', err);
        this.toast.error('Failed to duplicate estimate.');
      }
    });
  }

  deleteSavedEstimate(id: number): void {
    if (!confirm('Are you sure you want to delete this estimate?')) return;

    this.calcService.deleteEstimate(id).subscribe({
      next: () => {
        this.toast.success('Estimate deleted.');
        this.loadSavedEstimatesList();
      },
      error: (err) => {
        console.error('Failed to delete estimate', err);
        this.toast.error('Failed to delete estimate.');
      }
    });
  }

  newEstimate(showToast: boolean = true): void {
    this.currentEstimateId = null;
    this.currentEstimateNumber = null;
    this.estimateTitle = '';
    this.jobTitle = '';
    this.productType = '';
    this.finishingRequirements = '';
    this.adminNotes = '';

    // Reset Step 1 & 2
    this.selectedCategoryId = 0;
    this.filteredItems = [];
    this.selectedItemId = 0;
    this.selectedItem = null;
    this.printingSizes = [];
    this.selectedSizeId = null;
    this.selectedUnit = 'MM';
    this.isCustomSize = false;
    this.canonicalWidthMm = null;
    this.canonicalHeightMm = null;
    this.displayedWidth = null;
    this.displayedHeight = null;
    this.finishedWidth = null;
    this.finishedHeight = null;

    // Reset Step 3
    this.printingSide = '';
    this.colorMode = '';
    this.printingColorCount.setValue(null);
    this.ratePerColor = null;
    this.applyPerColorFormula = false;

    // Reset Step 4
    this.plateMakingMethod = '';
    this.plateSizeSearchTerm = '';
    this.selectedPlateSizeId = '';
    this.plateCode = '';
    this.filmType = '';
    this.plateQuantity = null;
    this.isPlateQuantityManual = false;
    this.plateChargeType = 'Printing Plate';
    this.plateChargeRate = null;
    this.plateSetQuantity = null;
    this.platePricingMethod = '';
    this.platesPerSet = null;
    this.singlePlateRate = null;
    this.setPlateRate = null;
    this.manualPlateCost = null;
    this.filmQuantity = null;
    this.isFilmQuantityManual = false;
    this.ratePerFilm = null;
    this.otherPrepressCharges = null;

    // Reset Step 5
    this.printingMachineSearchTerm = '';
    this.printingMachine = '';
    this.printingChargeType = 'Print Per Plate';
    this.printingChargeRate = null;
    this.printingChargeQty = null;
    this.customPrintingMachine = '';
    this.printingQuantity = null;
    this.printingCostMethod = '';
    this.perColorRateScope = 'FlatPerColor';
    this.printingRate = null;
    this.manualPrintingAmount = null;
    this.machineSetupCharge = null;
    this.additionalRunCharge = null;
    this.otherPrintingCharges = null;

    // Reset Step 6
    this.laminationType = '';
    this.laminationSides = 'Single Side';
    this.laminationCostMethod = 'PerSquareFoot';
    this.laminationRatePerSqFt = null;
    this.laminationQuantity = null;
    this.glossyLaminationRate = 2.80;
    this.matteLaminationRate = 3.25;
    this.laminationSheetWidthInches = null;
    this.laminationSheetHeightInches = null;
    this.applyLaminationSideMultiplier = true;
    this.manualLaminationAmount = null;

    // Reset Step 7 & 8
    this.selectedMaterialId = 0;
    this.selectedMaterial = null;
    this.materialVariant = '';
    this.gsm = null;
    this.pricingMethod = '';
    this.ratePerKg = null;
    this.conversionFactor = null;
    this.packetPrice = null;
    this.sheetsPerPacket = null;
    this.rimPrice = null;
    this.sheetsPerRim = null;
    this.directSheetPrice = null;
    this.manualMaterialCost = null;
    this.computedPerSheetPrice = 0;

    this.stockPaperSizeId = null;
    this.stockPaperLength = null;
    this.stockPaperWidth = null;

    // Reset Step 9, 10, 11
    this.quantities = [];
    this.costItems = [];
    this.profitPercentage = null;
    this.taxPercentage = null;
    this.calculationResults = [];

    this.recalculateAll();
    this.activeTab.set('calculator');
    if (showToast) {
      this.toast.info('Starting fresh calculation.');
    }
  }

  // Breakdown Modal
  viewBreakdown(result: QuantityCalculationResult): void {
    this.activeBreakdownResult = result;
    this.showBreakdownModal = true;
  }

  closeBreakdown(): void {
    this.showBreakdownModal = false;
    this.activeBreakdownResult = null;
  }

  // Link to Smart Quotation Modal
  openLinkQuotationModal(qty?: number): void {
    if (!this.currentEstimateId) {
      // Prompt user to save first
      this.toast.warning('Please save this estimate before linking to Smart Quotations.');
      this.saveEstimate();
      return;
    }

    this.linkSelectedQuantity = qty || (this.quantities.length > 0 ? this.quantities[0].quantity : 500);
    this.linkProductTitleOverride = this.jobTitle;
    this.linkDescriptionOverride = `${this.printingSide} side, ${this.colorMode}. Finished size: ${this.finishedWidth}×${this.finishedHeight} ${this.finishedUnit}. Material: ${this.materialVariant}.`;

    const matchResult = this.calculationResults.find(r => r.quantity === this.linkSelectedQuantity);
    this.linkUnitPriceOverride = matchResult ? matchResult.perPiecePrice : null;

    // Load quotations for existing selection
    this.calcService.getQuotations().subscribe({
      next: (qList) => this.existingQuotations = qList,
      error: () => {}
    });

    this.showLinkQuotationModal = true;
  }

  submitLinkToQuotation(): void {
    if (!this.currentEstimateId) return;

    const payload: LinkEstimateToQuotationRequest = {
      estimateId: this.currentEstimateId,
      selectedQuantity: this.linkSelectedQuantity,
      existingQuotationId: this.linkMode === 'existing' ? (this.linkExistingQuotationId ?? undefined) : undefined,
      clientId: this.linkMode === 'new' ? (this.linkClientId ?? undefined) : undefined,
      itemTitleOverride: this.linkProductTitleOverride,
      descriptionOverride: this.linkDescriptionOverride,
      unitPriceOverride: this.linkUnitPriceOverride ?? undefined
    };

    this.calculating.set(true);
    this.calcService.linkToQuotation(payload).subscribe({
      next: (res) => {
        this.calculating.set(false);
        this.showLinkQuotationModal = false;
        this.toast.success(res.message || `Successfully linked to Quotation ${res.quotationNumber}!`);
        // Navigate to quotation detail or show button
        this.router.navigate(['/admin/quotations', res.quotationId]);
      },
      error: (err) => {
        this.calculating.set(false);
        console.error('Failed to link to quotation', err);
        this.toast.error('Failed to link: ' + (err.error?.message || err.message));
      }
    });
  }

  // Custom Material Creation
  submitCustomMaterial(): void {
    if (!this.newMaterialName.trim()) {
      this.toast.error('Material name is required.');
      return;
    }

    this.calcService.createCustomMaterial({
      materialName: this.newMaterialName.trim(),
      pricingMethod: this.newMaterialMethod,
      defaultRatePerKg: this.newMaterialRateKg ?? undefined,
      defaultGsm: this.newMaterialGsm ?? undefined,
      packetPrice: this.newMaterialPacketPrice ?? undefined,
      sheetsPerPacket: this.newMaterialSheetsPacket ?? undefined,
      defaultSheetsPerRim: 500,
      defaultConversionFactor: 3100
    }).subscribe({
      next: (created) => {
        this.materials.unshift(created);
        this.selectMaterial(created);
        this.showCustomMaterialModal = false;
        this.newMaterialName = '';
        this.toast.success(`Custom material "${created.materialName}" added!`);
      },
      error: (err) => {
        console.error('Failed to create custom material', err);
        this.toast.error('Failed to create custom material.');
      }
    });
  }

  // Custom Paper Size Creation
  submitCustomPaperSize(): void {
    if (!this.newSizeName.trim()) {
      this.toast.error('Paper size name is required.');
      return;
    }

    this.calcService.createPaperSize({
      sizeName: this.newSizeName.trim(),
      lengthInches: this.newSizeLength ?? undefined,
      widthInches: this.newSizeWidth ?? undefined,
      sizeType: 'StockPaper'
    }).subscribe({
      next: (created) => {
        this.paperSizes.push(created);
        this.stockPaperSizeId = created.paperSizeId;
        this.stockPaperLength = created.lengthInches ?? null;
        this.stockPaperWidth = created.widthInches ?? null;
        this.showCustomPaperSizeModal = false;
        this.newSizeName = '';
        this.newSizeLength = null;
        this.newSizeWidth = null;
        this.computePerSheetPrice();
        this.recalculateAll();
        this.toast.success(`Custom size "${created.sizeName}" added!`);
      },
      error: (err) => {
        console.error('Failed to create custom paper size', err);
        this.toast.error('Failed to create custom paper size.');
      }
    });
  }
}
