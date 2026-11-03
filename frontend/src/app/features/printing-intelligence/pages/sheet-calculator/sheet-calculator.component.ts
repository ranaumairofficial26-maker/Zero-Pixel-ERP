import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SheetCalculatorService } from '../../services/sheet-calculator.service';
import {
  SheetCalculation,
  SaveSheetCalculationRequest,
  CalculationResult,
  PaperSize
} from '../../models/sheet-calculator.model';

@Component({
  selector: 'app-sheet-calculator',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sheet-calculator.component.html',
  styleUrls: ['./sheet-calculator.component.scss']
})
export class SheetCalculatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private calculatorService = inject(SheetCalculatorService);

  // --- State Signals ---
  savedCalculations = signal<SheetCalculation[]>([]);
  isLoadingCalculations = signal<boolean>(false);
  isSavingCalculation = signal<boolean>(false);
  feedbackMessage = signal<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  selectedMaterial = signal<string>('ART/MATT PAPER');
  selectedPaperSize = signal<string>('Custom Size');

  defaultMaterials: string[] = [
    'ART/MATT PAPER',
    'OFFSET PAPER',
    'ART CARD',
    'Carbonless Paper',
    'FLYING PAPER',
    'Bleach Card',
    'Box Board',
    'Sticker'
  ];

  materials = signal<string[]>(this.defaultMaterials);

  defaultPaperSizes: PaperSize[] = [
    { sizeName: 'A4', lengthInches: 8.27, widthInches: 11.679, isActive: true },
    { sizeName: 'A5', lengthInches: 5.7, widthInches: 8.27, isActive: true },
    { sizeName: 'Letter', lengthInches: 8.5, widthInches: 11, isActive: true },
    { sizeName: 'Legal', lengthInches: 8.5, widthInches: 14, isActive: true },
    { sizeName: '7 × 9', lengthInches: 7, widthInches: 9, isActive: true },
    { sizeName: 'Custom Size', isActive: true }
  ];

  paperSizes = signal<PaperSize[]>(this.defaultPaperSizes);

  // --- Calculation Form ---
  calcForm: FormGroup = this.fb.group({
    length: [23, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
    width: [36, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
    gsm: [115, [Validators.required, Validators.min(1), Validators.max(2000)]],
    ratePerKg: [580, [Validators.required, Validators.min(0)]],
    sheetsPerRim: [500, [Validators.required, Validators.min(1)]],
    requiredSheets: [500, [Validators.required, Validators.min(1)]],
    conversionFactor: [3100, [Validators.required, Validators.min(1)]]
  });

  // --- Derived Real-time Calculation Result ---
  calcResult = signal<CalculationResult>({
    rimPrice: 17815.35,
    perSheetPrice: 35.6307,
    totalPaperCost: 17815.35,
    referenceRimWeightKg: 30.7161,
    equivalentRims: 1.0
  });

  ngOnInit(): void {
    this.loadSavedCalculations();
    this.loadMaterials();
    this.loadPaperSizes();

    // Listen to form value changes for immediate real-time calculations and dimension override detection
    this.calcForm.valueChanges.subscribe(() => {
      this.checkDimensionOverride();
      this.recalculate();
    });

    // Initial calculation
    this.recalculate();
  }

  // --- Load Materials from PostgreSQL Master Table ---
  loadMaterials(): void {
    this.calculatorService.getMaterials().subscribe({
      next: (mats) => {
        if (mats && mats.length > 0) {
          const list: string[] = [];
          mats.forEach(m => {
            if (!list.includes(m.materialName)) {
              list.push(m.materialName);
            }
          });
          this.defaultMaterials.forEach(dm => {
            if (!list.includes(dm)) {
              list.push(dm);
            }
          });
          this.materials.set(list);
        } else {
          this.materials.set(this.defaultMaterials);
        }
      },
      error: () => {
        this.materials.set(this.defaultMaterials);
      }
    });
  }

  // --- Load Paper Sizes from Master Table ---
  loadPaperSizes(): void {
    this.calculatorService.getPaperSizes().subscribe({
      next: (sizes) => {
        if (sizes && sizes.length > 0) {
          const list = [...sizes];
          if (!list.some(s => s.sizeName === 'Custom Size')) {
            list.push({ sizeName: 'Custom Size', isActive: true });
          }
          this.paperSizes.set(list);
        } else {
          this.paperSizes.set(this.defaultPaperSizes);
        }
      },
      error: () => {
        this.paperSizes.set(this.defaultPaperSizes);
      }
    });
  }

  // --- Real-time Calculations ---
  recalculate(): void {
    const val = this.calcForm.getRawValue();
    const length = Number(val.length) || 0;
    const width = Number(val.width) || 0;
    const gsm = Number(val.gsm) || 0;
    const ratePerKg = Number(val.ratePerKg) || 0;
    const sheetsPerRim = Number(val.sheetsPerRim) || 500;
    const requiredSheets = Number(val.requiredSheets) || 0;
    const conversionFactor = Number(val.conversionFactor) || 3100;

    const result = this.calculatorService.calculateLocally(
      length,
      width,
      gsm,
      ratePerKg,
      sheetsPerRim,
      requiredSheets,
      conversionFactor
    );

    this.calcResult.set(result);
  }

  // --- Paper Size Change ---
  onPaperSizeChange(sizeName: string): void {
    this.selectedPaperSize.set(sizeName);

    if (sizeName === 'Custom Size') {
      // Custom size allows manual length/width entry without overwriting
      return;
    }

    const found = this.paperSizes().find(s => s.sizeName === sizeName);
    if (found && found.lengthInches != null && found.widthInches != null) {
      this.calcForm.patchValue({
        length: found.lengthInches,
        width: found.widthInches
      });
      this.recalculate();
    }
  }

  // --- Detect If User Manually Edits Dimensions of a Preset ---
  private checkDimensionOverride(): void {
    if (this.selectedPaperSize() === 'Custom Size') return;

    const currentPreset = this.paperSizes().find(s => s.sizeName === this.selectedPaperSize());
    if (!currentPreset || currentPreset.lengthInches == null || currentPreset.widthInches == null) return;

    const currentLen = Number(this.calcForm.get('length')?.value);
    const currentWid = Number(this.calcForm.get('width')?.value);

    // If manual edit changes the preset's dimensions, switch to Custom Size without resetting
    if (Math.abs(currentLen - currentPreset.lengthInches) > 0.001 || Math.abs(currentWid - currentPreset.widthInches) > 0.001) {
      this.selectedPaperSize.set('Custom Size');
    }
  }

  // --- Material Change ---
  onMaterialChange(materialName: string): void {
    this.selectedMaterial.set(materialName);
  }

  // --- Reset Form to Excel Defaults ---
  resetForm(): void {
    this.selectedMaterial.set('ART/MATT PAPER');
    this.selectedPaperSize.set('Custom Size');
    this.calcForm.reset({
      length: 23,
      width: 36,
      gsm: 115,
      ratePerKg: 580,
      sheetsPerRim: 500,
      requiredSheets: 500,
      conversionFactor: 3100
    });
    this.recalculate();
    this.showToast('info', 'Form reset to standard defaults.');
  }

  // --- Saved Calculations Operations ---
  loadSavedCalculations(): void {
    this.isLoadingCalculations.set(true);
    this.calculatorService.getSavedCalculations().subscribe({
      next: (data) => {
        this.savedCalculations.set(data);
        this.isLoadingCalculations.set(false);
      },
      error: () => {
        this.isLoadingCalculations.set(false);
      }
    });
  }

  saveCurrentCalculation(): void {
    if (this.calcForm.invalid) {
      this.calcForm.markAllAsTouched();
      this.showToast('error', 'Please fix validation errors before saving.');
      return;
    }

    const val = this.calcForm.getRawValue();

    const payload: SaveSheetCalculationRequest = {
      length: Number(val.length),
      width: Number(val.width),
      gsm: Number(val.gsm),
      ratePerKg: Number(val.ratePerKg),
      sheetsPerRim: Number(val.sheetsPerRim),
      requiredSheets: Number(val.requiredSheets),
      conversionFactor: Number(val.conversionFactor),
      materialName: this.selectedMaterial(),
      paperSizeName: this.selectedPaperSize()
    };

    this.isSavingCalculation.set(true);
    this.calculatorService.saveCalculation(payload).subscribe({
      next: (saved) => {
        this.isSavingCalculation.set(false);
        this.showToast('success', `Calculation #${saved.calculationId} saved successfully.`);
        this.loadSavedCalculations();
      },
      error: (err) => {
        this.isSavingCalculation.set(false);
        this.showToast('error', 'Failed to save calculation: ' + (err.error?.detail || err.message));
      }
    });
  }

  loadCalculationIntoForm(item: SheetCalculation): void {
    if (item.materialName) {
      if (!this.materials().some(m => m.toLowerCase() === item.materialName!.toLowerCase())) {
        this.materials.update(list => [...list, item.materialName!]);
      }
      this.selectedMaterial.set(item.materialName);
    }

    if (item.paperSizeName) {
      this.selectedPaperSize.set(item.paperSizeName);
    } else {
      // Infer size if matches preset
      const match = this.paperSizes().find(s => 
        s.lengthInches != null && s.widthInches != null &&
        Math.abs(s.lengthInches - item.length) <= 0.001 &&
        Math.abs(s.widthInches - item.width) <= 0.001
      );
      this.selectedPaperSize.set(match ? match.sizeName : 'Custom Size');
    }

    this.calcForm.patchValue({
      length: item.length,
      width: item.width,
      gsm: item.gsm,
      ratePerKg: item.ratePerKg,
      sheetsPerRim: item.sheetsPerRim,
      requiredSheets: item.requiredSheets,
      conversionFactor: item.conversionFactor
    });

    this.recalculate();
    this.showToast('info', `Loaded calculation #${item.calculationId} into calculator.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteSavedCalculation(id: number): void {
    if (!confirm('Are you sure you want to delete this saved calculation record?')) {
      return;
    }

    this.calculatorService.deleteCalculation(id).subscribe({
      next: () => {
        this.savedCalculations.update(list => list.filter(x => x.calculationId !== id));
        this.showToast('success', 'Calculation record deleted.');
      },
      error: (err) => {
        this.showToast('error', 'Failed to delete record: ' + (err.error?.detail || err.message));
      }
    });
  }

  // --- Toast Notification Helper ---
  showToast(type: 'success' | 'error' | 'info', text: string): void {
    this.feedbackMessage.set({ type, text });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 4500);
  }
}
