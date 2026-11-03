import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SheetCalculatorService } from '../../services/sheet-calculator.service';
import {
  SheetCalculation,
  SaveSheetCalculationRequest,
  CalculationResult
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

  selectedMaterial = signal<string>('Art / Matt Paper');

  materialOptions = [
    { name: 'Art / Matt Paper', length: 23, width: 36, gsm: 115, rate: 580, sheets: 500, conv: 3100 },
    { name: 'Offset Paper', length: 23, width: 36, gsm: 75, rate: 420, sheets: 500, conv: 3100 },
    { name: 'Art Card', length: 25, width: 36, gsm: 300, rate: 620, sheets: 100, conv: 3100 },
    { name: 'Sticker Paper', length: 20, width: 30, gsm: 80, rate: 750, sheets: 500, conv: 3100 },
    { name: 'Kraft Paper', length: 24, width: 36, gsm: 120, rate: 390, sheets: 500, conv: 3100 }
  ];

  // --- Calculation Form ---
  calcForm: FormGroup = this.fb.group({
    length: [23, [Validators.required, Validators.min(0.1), Validators.max(1000)]],
    width: [36, [Validators.required, Validators.min(0.1), Validators.max(1000)]],
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

    // Listen to form value changes for immediate real-time calculations
    this.calcForm.valueChanges.subscribe(() => {
      this.recalculate();
    });

    // Initial calculation
    this.recalculate();
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

  // --- Material Change ---
  onMaterialChange(materialName: string): void {
    this.selectedMaterial.set(materialName);
    const found = this.materialOptions.find(m => m.name === materialName);
    if (found) {
      this.calcForm.patchValue({
        length: found.length,
        width: found.width,
        gsm: found.gsm,
        ratePerKg: found.rate,
        sheetsPerRim: found.sheets,
        conversionFactor: found.conv
      });
      this.recalculate();
      this.showToast('info', `Loaded defaults for ${found.name}`);
    }
  }

  // --- Reset Form to Excel Defaults ---
  resetForm(): void {
    this.selectedMaterial.set('Art / Matt Paper');
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
    this.showToast('info', 'Form reset to standard defaults (23" × 36", 115 GSM, PKR 580/KG).');
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
      conversionFactor: Number(val.conversionFactor)
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
