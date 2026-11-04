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
  LinkEstimateToQuotationRequest
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
  estimateTitle: string = 'Standard Business Card Estimate';

  // Section 1: Category & Item Selection
  selectedCategoryId: number = 0;
  selectedItemId: number = 0;
  selectedItem: PrintingItem | null = null;
  itemSearchTerm: string = '';
  categorySearchTerm: string = '';

  // Section 2: Size Selection & Measurement Unit (Step 2)
  printingSizes: PrintingSize[] = [];
  selectedSizeId: number | null = null;
  selectedUnit: 'MM' | 'CM' | 'Inches' = 'MM';
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

  // Section 4: Material & Paper Details (Step 4 & 5)
  selectedMaterialId: number = 0;
  selectedMaterial: PrintingMaterial | null = null;
  materialVariant: string = 'Art Card 300 GSM (25×36)';
  gsm: number = 300;
  pricingMethod: string = 'PacketPrice'; // RatePerKg, PacketPrice, DirectRimPrice, DirectSheetPrice, ManualMaterialCost
  ratePerKg: number = 680;
  conversionFactor: number = 3100;
  packetPrice: number = 8100;
  sheetsPerPacket: number = 100;
  rimPrice: number = 0;
  sheetsPerRim: number = 500;
  directSheetPrice: number = 0;
  manualMaterialCost: number = 0;
  computedPerSheetPrice: number = 81.00;

  // Paper Size & Dimensions
  // Finished Product Size
  finishedWidth: number | null = 3.5;
  finishedHeight: number | null = 2.0;
  finishedUnit: string = 'in'; // in, mm, cm, ft

  // Stock Paper Size
  stockPaperSizeId: number | null = null;
  stockPaperLength: number | null = 25;
  stockPaperWidth: number | null = 36;
  stockPaperUnit: string = 'in';

  // Section 4: Job Specifications
  jobTitle: string = 'Standard Business Card';
  productType: string = 'Business Card';
  printingSide: string = 'Front Side'; // Front Side, Backside, Front and Backside, None
  colorMode: string = '4 Color'; // 1 Color, 2 Color, 4 Color, Custom, NotApplicable
  finishingRequirements: string = 'Matt Lamination';
  adminNotes: string = 'Single side 4-color print on 300 GSM Art Card.';

  // Section 5: Dynamic Multi-Quantity Options
  quantities: EstimateQuantityInput[] = [
    { quantity: 100, sheetsRequired: 2, wastagePercent: 0, wastageSheets: 0, totalSheets: 2 },
    { quantity: 250, sheetsRequired: 5, wastagePercent: 0, wastageSheets: 0, totalSheets: 5 },
    { quantity: 500, sheetsRequired: 7, wastagePercent: 0, wastageSheets: 0, totalSheets: 7 },
    { quantity: 1000, sheetsRequired: 15, wastagePercent: 0, wastageSheets: 0, totalSheets: 15 }
  ];

  // Section 6: Dynamic Manual Printing Expenses Matrix
  costItems: EstimateCostItemInput[] = [];

  // Section 7: Profit & Tax
  profitPercentage: number = 20;
  taxPercentage: number = 0;

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
  newMaterialMethod: string = 'RatePerKg';
  newMaterialRateKg: number | null = 680;
  newMaterialGsm: number | null = 100;
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
      paperSizes: this.calcService.getPaperSizes(),
      materials: this.calcService.getMaterials(),
      costCategories: this.calcService.getCostCategories(),
      clients: this.calcService.getClients()
    }).subscribe({
      next: ({ categories, items, paperSizes, materials, costCategories, clients }) => {
        this.categories = categories;
        this.allItems = items;
        this.paperSizes = paperSizes;
        this.materials = materials;
        this.costCategories = costCategories;
        this.clients = clients;

        // Set default category
        if (categories.length > 0) {
          const defaultCat = categories.find(c => 
            c.categoryName.toLowerCase().includes('corporate stationery') ||
            c.categoryName.toLowerCase().includes('flyer')
          ) || categories[0];
          this.selectedCategoryId = Number(defaultCat.categoryId);
        }

        // Filter items for selected category
        this.filterItemsByCategory();

        // Select default item (Business Card if present, or first item)
        const bCard = this.filteredItems.find(i => 
          i.itemName.toLowerCase().includes('business card') || 
          i.itemName.toLowerCase().includes('visiting card')
        ) || (this.filteredItems.length > 0 ? this.filteredItems[0] : null);

        if (bCard) {
          this.selectItem(bCard);
        }

        // Default stock paper size
        const defaultStock = paperSizes.find(s => s.sizeName === '25 × 36') || paperSizes.find(s => s.sizeName === 'A4');
        if (defaultStock) {
          this.stockPaperSizeId = defaultStock.paperSizeId;
          this.stockPaperLength = defaultStock.lengthInches ?? null;
          this.stockPaperWidth = defaultStock.widthInches ?? null;
        }

        // Default material (Art Card)
        const artCard = materials.find(m => m.materialName.toUpperCase() === 'ART CARD') || materials[0];
        if (artCard) {
          this.selectMaterial(artCard);
        }

        this.initializeDefaultCostItems(costCategories);
        this.recalculateAll();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load initial master data', err);
        this.loading.set(false);
      }
    });
  }

  initializeDefaultCostItems(cats: CostCategory[]): void {
    // 10 Standard expenses matching the Excel model
    const defaults = [
      { name: 'Positive / Tracing', method: 'FixedAmount', rate: 0, amounts: { 100: 0, 250: 0, 500: 0, 1000: 0 } },
      { name: 'Plates', method: 'FixedAmount', rate: 900, amounts: { 100: 900, 250: 900, 500: 900, 1000: 900 } },
      { name: 'Printing', method: 'FixedAmount', rate: 1000, amounts: { 100: 1000, 250: 1000, 500: 1000, 1000: 1000 } },
      { name: 'Lamination', method: 'ManualAmount', rate: 0, amounts: { 100: 300, 250: 300, 500: 400, 1000: 700 } },
      { name: 'Die Making', method: 'FixedAmount', rate: 0, amounts: { 100: 0, 250: 0, 500: 0, 1000: 0 } },
      { name: 'Die Cutting', method: 'ManualAmount', rate: 0, amounts: { 100: 0, 250: 0, 500: 0, 1000: 0 } },
      { name: 'Binding', method: 'ManualAmount', rate: 0, amounts: { 100: 0, 250: 0, 500: 0, 1000: 0 } },
      { name: 'Packing', method: 'ManualAmount', rate: 0, amounts: { 100: 0, 250: 0, 500: 0, 1000: 0 } },
      { name: 'Petrol + Misc.', method: 'ManualAmount', rate: 300, amounts: { 100: 300, 250: 300, 500: 300, 1000: 300 } }
    ];

    this.costItems = defaults.map(d => {
      const matchCat = cats.find(c => c.categoryName.toLowerCase() === d.name.toLowerCase());
      return {
        costCategoryId: matchCat?.costCategoryId,
        itemName: d.name,
        calculationMethod: d.method,
        unitRate: d.rate,
        notes: '',
        quantityAmounts: { ...d.amounts }
      };
    });
  }

  // Section 1: Category & Item Selection
  onCategoryChange(newCatId?: any): void {
    if (newCatId !== undefined && newCatId !== null) {
      this.selectedCategoryId = Number(newCatId);
    }
    this.filterItemsByCategory();
    if (this.filteredItems.length > 0) {
      this.selectItem(this.filteredItems[0]);
    } else {
      this.selectedItemId = 0;
      this.selectedItem = null;
    }
    this.recalculateAll();
  }

  filterItemsByCategory(): void {
    const catId = Number(this.selectedCategoryId);
    if (catId && catId > 0) {
      this.filteredItems = this.allItems.filter(i => Number(i.categoryId) === catId);
    } else {
      this.filteredItems = [...this.allItems];
    }
  }

  onItemSelect(itemId: any): void {
    const id = Number(itemId);
    this.selectedItemId = id;
    const item = this.allItems.find(i => Number(i.itemId) === id);
    if (item) {
      this.selectItem(item);
    }
  }

  selectItem(item: PrintingItem): void {
    this.selectedItemId = Number(item.itemId);
    this.selectedItem = item;
    this.selectedCategoryId = Number(item.categoryId);
    this.jobTitle = item.itemName;
    this.productType = item.categoryName || item.itemName;

    // Load reference dimensions
    if (item.defaultWidthMm && item.defaultHeightMm) {
      // Auto fill finished product size in inches: 1 mm = 0.0393701 inches
      this.finishedWidth = parseFloat((item.defaultWidthMm / 25.4).toFixed(2));
      this.finishedHeight = parseFloat((item.defaultHeightMm / 25.4).toFixed(2));
      this.finishedUnit = 'in';
    }

    // Step 2: Load applicable & global printing sizes for this item
    this.loadPrintingSizesForItem(this.selectedItemId);

    if (item.sourceNotes) {
      this.adminNotes = `Excel Reference Notes: ${item.sourceNotes}`;
    }
    this.recalculateAll();
  }

  // Step 2 — Size Selection & Unit Conversion
  loadPrintingSizesForItem(itemId?: number): void {
    this.calcService.getPrintingSizes(itemId).subscribe({
      next: (sizes) => {
        this.printingSizes = sizes;
        // Priority 1: default or applicable size for this item
        const applicable = sizes.find(s => s.isApplicableToCurrentItem && s.isDefault) ||
                           sizes.find(s => s.isApplicableToCurrentItem);
        // Priority 2: first preset (not Custom Size)
        const fallback = sizes.find(s => s.sizeName !== 'Custom Size') || sizes[0];
        const chosen = applicable || fallback;

        if (chosen) {
          this.applySelectedPrintingSize(chosen);
        }
      },
      error: (err) => console.error('Failed to load printing sizes', err)
    });
  }

  onSizeSelect(sizeId: any): void {
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

  // Step 3 — Printing Color Methods
  onPrintingColorChange(val: any): void {
    const num = val !== null && val !== undefined && val !== '' ? Number(val) : null;
    this.printingColorCount.setValue(num);
    if (num !== null) {
      this.colorMode = num === 0 ? 'None' : `${num} Color${num > 1 ? 's' : ''}`;
    }
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  onRatePerColorChange(): void {
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  togglePerColorFormula(enabled: boolean): void {
    this.applyPerColorFormula = enabled;
    this.updatePerColorExpenseIfConfigured();
    this.recalculateAll();
  }

  updatePerColorExpenseIfConfigured(): void {
    const colors = this.printingColorCount.value;
    const rate = this.ratePerColor;

    // Look for existing 'Printing' expense in costItems
    const printItem = this.costItems.find(c => 
      c.itemName.toLowerCase() === 'printing' || 
      c.itemName.toLowerCase().includes('printing charge')
    );

    if (this.applyPerColorFormula && colors && colors > 0 && rate && rate > 0) {
      const totalColorCost = colors * rate;
      if (printItem) {
        printItem.unitRate = totalColorCost;
        for (const q of this.quantities) {
          printItem.quantityAmounts[q.quantity] = totalColorCost;
        }
      }
    }
  }

  // Section 4: Material Selection
  onMaterialSelect(matId: number): void {
    const mat = this.materials.find(m => m.materialId === +matId);
    if (mat) {
      this.selectMaterial(mat);
    }
  }

  selectMaterial(mat: PrintingMaterial): void {
    this.selectedMaterialId = mat.materialId;
    this.selectedMaterial = mat;
    this.pricingMethod = mat.pricingMethod || 'RatePerKg';
    this.ratePerKg = mat.defaultRatePerKg || 680;
    this.conversionFactor = mat.defaultConversionFactor || 3100;
    this.sheetsPerRim = mat.defaultSheetsPerRim || 500;
    this.gsm = mat.defaultGsm || 300;
    this.packetPrice = mat.packetPrice || 8100;
    this.sheetsPerPacket = mat.sheetsPerPacket || 100;

    if (mat.defaultLength && mat.defaultWidth) {
      this.stockPaperLength = mat.defaultLength;
      this.stockPaperWidth = mat.defaultWidth;
    }

    this.materialVariant = `${mat.materialName} ${this.gsm} GSM (${this.stockPaperLength}×${this.stockPaperWidth})`;
    this.computePerSheetPrice();
    this.recalculateAll();
  }

  onPricingMethodChange(): void {
    this.computePerSheetPrice();
    this.recalculateAll();
  }

  // Section 3: Paper Size Presets
  onPaperSizePresetSelect(sizeId: number): void {
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
    if (this.pricingMethod === 'PacketPrice') {
      if (this.packetPrice > 0 && this.sheetsPerPacket > 0) {
        this.computedPerSheetPrice = parseFloat((this.packetPrice / this.sheetsPerPacket).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    } else if (this.pricingMethod === 'DirectRimPrice') {
      if (this.rimPrice > 0 && this.sheetsPerRim > 0) {
        this.computedPerSheetPrice = parseFloat((this.rimPrice / this.sheetsPerRim).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    } else if (this.pricingMethod === 'DirectSheetPrice') {
      this.computedPerSheetPrice = parseFloat((this.directSheetPrice || 0).toFixed(4));
    } else if (this.pricingMethod === 'ManualMaterialCost') {
      this.computedPerSheetPrice = 0;
    } else {
      // Rate per KG Formula: (Length * Width * GSM) / factor -> Rim Weight. Rim Weight * Rate / sheetsPerRim -> Sheet Price
      const l = this.stockPaperLength || 0;
      const w = this.stockPaperWidth || 0;
      const g = this.gsm || 0;
      const rate = this.ratePerKg || 0;
      const factor = this.conversionFactor > 0 ? this.conversionFactor : 3100;
      const rimSheets = this.sheetsPerRim > 0 ? this.sheetsPerRim : 500;

      if (l > 0 && w > 0 && g > 0 && rate > 0) {
        const rimWeight = (l * w * g) / factor;
        const rimCost = rimWeight * rate;
        this.computedPerSheetPrice = parseFloat((rimCost / rimSheets).toFixed(4));
      } else {
        this.computedPerSheetPrice = 0;
      }
    }
  }

  recalculateAll(): void {
    this.computePerSheetPrice();

    const results: QuantityCalculationResult[] = [];

    for (const q of this.quantities) {
      if (q.quantity <= 0) continue;

      // Calculate wastage
      if (q.wastagePercent > 0 && (!q.wastageSheets || q.wastageSheets === 0)) {
        q.wastageSheets = parseFloat(((q.sheetsRequired * q.wastagePercent) / 100).toFixed(2));
      }
      q.totalSheets = parseFloat((+q.sheetsRequired + +q.wastageSheets).toFixed(2));

      // Material Cost
      let matCost = 0;
      if (this.pricingMethod === 'ManualMaterialCost') {
        matCost = this.manualMaterialCost || 0;
      } else {
        matCost = parseFloat((q.totalSheets * this.computedPerSheetPrice).toFixed(2));
      }

      // Additional Expenses
      const breakdown: { [itemName: string]: number } = {};
      let totalExpenses = 0;

      for (const item of this.costItems) {
        let amount = 0;
        if (item.quantityAmounts && item.quantityAmounts[q.quantity] !== undefined) {
          amount = +item.quantityAmounts[q.quantity];
        } else {
          // Calculation method fallback
          if (item.calculationMethod === 'FixedAmount') {
            amount = +item.unitRate;
          } else if (item.calculationMethod === 'PerPiece' || item.calculationMethod === 'RatePerUnit') {
            amount = parseFloat((+item.unitRate * q.quantity).toFixed(2));
          } else if (item.calculationMethod === 'PerSheet') {
            amount = parseFloat((+item.unitRate * q.totalSheets).toFixed(2));
          }
          if (!item.quantityAmounts) item.quantityAmounts = {};
          item.quantityAmounts[q.quantity] = amount;
        }

        breakdown[item.itemName] = amount;
        totalExpenses += amount;
      }

      const prodCost = parseFloat((matCost + totalExpenses).toFixed(2));
      const profitAmt = parseFloat((prodCost * (this.profitPercentage / 100)).toFixed(2));
      const subtotal = parseFloat((prodCost + profitAmt).toFixed(2));
      const taxAmt = parseFloat((subtotal * (this.taxPercentage / 100)).toFixed(2));
      const grandTotal = parseFloat((subtotal + taxAmt).toFixed(2));
      const perPiece = q.quantity > 0 ? parseFloat((grandTotal / q.quantity).toFixed(2)) : 0;

      results.push({
        quantity: q.quantity,
        sheetsRequired: q.sheetsRequired,
        wastageSheets: q.wastageSheets,
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
    const nextQty = this.quantities.length > 0
      ? this.quantities[this.quantities.length - 1].quantity * 2
      : 500;
    const nextSheets = Math.round(nextQty * 0.015) || 5;

    this.quantities.push({
      quantity: nextQty,
      sheetsRequired: nextSheets,
      wastagePercent: 0,
      wastageSheets: 0,
      totalSheets: nextSheets
    });

    // Propagate cost item defaults
    for (const item of this.costItems) {
      if (item.calculationMethod === 'FixedAmount') {
        item.quantityAmounts[nextQty] = item.unitRate;
      } else if (item.calculationMethod === 'PerPiece' || item.calculationMethod === 'RatePerUnit') {
        item.quantityAmounts[nextQty] = parseFloat((item.unitRate * nextQty).toFixed(2));
      } else if (item.calculationMethod === 'PerSheet') {
        item.quantityAmounts[nextQty] = parseFloat((item.unitRate * nextSheets).toFixed(2));
      } else {
        item.quantityAmounts[nextQty] = 0;
      }
    }

    this.recalculateAll();
  }

  duplicateQuantity(idx: number): void {
    const src = this.quantities[idx];
    const newQty = src.quantity + 250;
    const newSheets = src.sheetsRequired + 3;

    this.quantities.splice(idx + 1, 0, {
      quantity: newQty,
      sheetsRequired: newSheets,
      wastagePercent: src.wastagePercent,
      wastageSheets: src.wastageSheets,
      totalSheets: newSheets
    });

    for (const item of this.costItems) {
      item.quantityAmounts[newQty] = item.quantityAmounts[src.quantity] || 0;
    }

    this.recalculateAll();
  }

  removeQuantity(idx: number): void {
    if (this.quantities.length <= 1) {
      this.toast.warning('At least one quantity option must be present.');
      return;
    }
    const removed = this.quantities[idx];
    this.quantities.splice(idx, 1);

    for (const item of this.costItems) {
      delete item.quantityAmounts[removed.quantity];
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
      estimateTitle: this.estimateTitle,
      categoryId: this.selectedCategoryId > 0 ? this.selectedCategoryId : undefined,
      itemId: this.selectedItemId > 0 ? this.selectedItemId : undefined,
      customItemName: this.selectedItem?.isCustom ? this.selectedItem.itemName : undefined,
      productType: this.productType,
      jobTitle: this.jobTitle,
      jobDescription: this.jobTitle,
      printingSide: this.printingSide,
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
      gsm: this.gsm,
      pricingMethod: this.pricingMethod,
      ratePerKg: this.ratePerKg,
      conversionFactor: this.conversionFactor,
      packetPrice: this.packetPrice,
      sheetsPerPacket: this.sheetsPerPacket,
      rimPrice: this.rimPrice,
      sheetsPerRim: this.sheetsPerRim,
      directSheetPrice: this.directSheetPrice,
      manualMaterialCost: this.manualMaterialCost,
      computedPerSheetPrice: this.computedPerSheetPrice,

      profitPercentage: this.profitPercentage,
      taxPercentage: this.taxPercentage,

      quantities: this.quantities,
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
        this.applyPerColorFormula = !!(est.ratePerColor && est.ratePerColor > 0);
        this.finishingRequirements = est.finishingRequirements || '';
        this.adminNotes = est.adminNotes || '';

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

  newEstimate(): void {
    this.currentEstimateId = null;
    this.currentEstimateNumber = null;
    this.estimateTitle = 'New Printing Job Estimate';
    this.jobTitle = 'Standard Printing Job';
    this.productType = 'Flyer';
    this.printingColorCount.setValue(null);
    this.ratePerColor = null;
    this.applyPerColorFormula = false;
    this.quantities = [
      { quantity: 100, sheetsRequired: 2, wastagePercent: 0, wastageSheets: 0, totalSheets: 2 },
      { quantity: 250, sheetsRequired: 5, wastagePercent: 0, wastageSheets: 0, totalSheets: 5 },
      { quantity: 500, sheetsRequired: 7, wastagePercent: 0, wastageSheets: 0, totalSheets: 7 },
      { quantity: 1000, sheetsRequired: 15, wastagePercent: 0, wastageSheets: 0, totalSheets: 15 }
    ];
    this.initializeDefaultCostItems(this.costCategories);
    this.recalculateAll();
    this.activeTab.set('calculator');
    this.toast.info('Starting fresh calculation.');
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
