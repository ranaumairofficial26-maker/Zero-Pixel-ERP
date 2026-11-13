import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierQuoteService } from '../../services/supplier-quote.service';
import { SupplierService } from '../../services/supplier.service';
import { SupplierListItem } from '../../models/supplier.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-supplier-quote-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './supplier-quote-form.component.html',
  styleUrls: ['./supplier-quote-form.component.scss']
})
export class SupplierQuoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private quoteService = inject(SupplierQuoteService);
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  quoteForm!: FormGroup;
  isEditMode: boolean = false;
  quoteId: number | null = null;
  previewQuoteNumber: string = 'Auto-Generated';
  loading: boolean = true;
  saving: boolean = false;
  errorMessage: string | null = null;

  activeSuppliers: SupplierListItem[] = [];
  supplierSearchTerm: string = '';
  selectedSupplier: SupplierListItem | null = null;

  readonly itemPlaceholders = [
    'e.g. Art Card',
    'e.g. Offset Paper',
    'e.g. Printing Plates',
    'e.g. Lamination Service'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadActiveSuppliers();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.quoteForm = this.fb.group({
      supplierId: [null, [Validators.required]],
      supplierReferenceNumber: ['', [Validators.maxLength(100)]],
      quoteDate: [today, [Validators.required]],
      description: [''],
      items: this.fb.array([])
    });

    this.quoteForm.get('supplierId')?.valueChanges.subscribe((val) => {
      const id = Number(val);
      this.selectedSupplier = id
        ? (this.activeSuppliers.find(s => s.id === id) || this.selectedSupplier)
        : null;
      this.cdr.markForCheck();
    });
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  get filteredSuppliers(): SupplierListItem[] {
    const term = (this.supplierSearchTerm || '').trim().toLowerCase();
    if (!term) return this.activeSuppliers;
    return this.activeSuppliers.filter(s =>
      s.supplierName.toLowerCase().includes(term) ||
      (s.contactPerson || '').toLowerCase().includes(term) ||
      (s.phoneNumber || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  }

  createItemRow(description: string = '', quantity: number = 1, rate: number | null = null): FormGroup {
    const initialAmt = rate !== null ? Math.round(quantity * rate * 100) / 100 : 0;
    const row = this.fb.group({
      description: [description, [Validators.required, Validators.maxLength(500)]],
      quantity: [quantity, [Validators.required, Validators.min(0.0001)]],
      rate: [rate, [Validators.required, Validators.min(0)]],
      amount: [{ value: initialAmt, disabled: true }]
    });

    row.get('quantity')?.valueChanges.subscribe(() => this.updateRowAmount(row));
    row.get('rate')?.valueChanges.subscribe(() => this.updateRowAmount(row));

    return row;
  }

  private updateRowAmount(row: FormGroup): void {
    const qty = Number(row.get('quantity')?.value) || 0;
    const rate = Number(row.get('rate')?.value) || 0;
    const amount = Math.round(qty * rate * 100) / 100;
    row.get('amount')?.setValue(amount, { emitEvent: false });
  }

  addItem(): void {
    this.items.push(this.createItemRow());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getItemPlaceholder(index: number): string {
    return this.itemPlaceholders[index % this.itemPlaceholders.length];
  }

  get totalQuotedAmount(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);
      const qty = Number(row.get('quantity')?.value) || 0;
      const rate = Number(row.get('rate')?.value) || 0;
      sum += Math.round(qty * rate * 100) / 100;
    }
    return Math.round(sum * 100) / 100;
  }

  private loadActiveSuppliers(): void {
    this.supplierService.getSuppliers('', 1, 50).subscribe({
      next: (res) => {
        this.activeSuppliers = (res.items || []).filter(s => s.status === 'Active');
        this.checkRouteAndLoadData();
      },
      error: (err) => {
        console.error('Failed to load suppliers:', err);
        this.checkRouteAndLoadData();
      }
    });
  }

  private checkRouteAndLoadData(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.quoteId = Number(idParam);
      this.loadQuoteForEdit(this.quoteId);
    } else {
      this.isEditMode = false;
      if (this.items.length === 0) {
        this.addItem();
      }
      this.quoteService.getNextQuoteNumber().subscribe({
        next: (res) => {
          this.previewQuoteNumber = res.quoteNumber;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: () => {
          this.previewQuoteNumber = 'Auto-Generated';
        }
      });
      this.loading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  private loadQuoteForEdit(id: number): void {
    this.loading = true;
    this.errorMessage = null;

    this.quoteService.getQuoteById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (q) => {
        this.previewQuoteNumber = q.quoteNumber;
        const dateStr = q.quoteDate ? q.quoteDate.split('T')[0] : '';

        this.selectedSupplier = this.activeSuppliers.find(s => s.id === q.supplierId) || {
          id: q.supplierId,
          supplierName: q.supplierName,
          contactPerson: q.supplierContactPerson,
          phoneNumber: q.supplierPhone,
          email: q.supplierEmail,
          status: 'Active',
          createdAt: q.createdAt
        };

        if (!this.activeSuppliers.some(s => s.id === q.supplierId)) {
          this.activeSuppliers = [this.selectedSupplier, ...this.activeSuppliers];
        }

        this.quoteForm.patchValue({
          supplierId: q.supplierId,
          supplierReferenceNumber: q.supplierReferenceNumber || '',
          quoteDate: dateStr,
          description: q.description || ''
        });

        this.items.clear();
        if (q.items && q.items.length > 0) {
          q.items.forEach(it => {
            this.items.push(this.createItemRow(it.description, it.quantity, it.rate));
          });
        } else {
          this.addItem();
        }
      },
      error: (err) => {
        console.error('Failed to load supplier quote:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load supplier quote details.';
      }
    });
  }

  onSubmit(): void {
    if (this.saving) return;

    if (this.quoteForm.invalid || this.items.length === 0) {
      this.quoteForm.markAllAsTouched();
      this.toastService.warning('Please fill in all required quotation fields and items.', 'Invalid Form');
      return;
    }

    const v = this.quoteForm.value;
    const payload = {
      supplierId: Number(v.supplierId),
      supplierReferenceNumber: v.supplierReferenceNumber ? v.supplierReferenceNumber.trim() : null,
      quoteDate: v.quoteDate ? new Date(v.quoteDate).toISOString() : new Date().toISOString(),
      description: v.description ? v.description.trim() : null,
      items: (v.items || []).map((it: any) => ({
        description: (it.description || '').trim(),
        quantity: Number(it.quantity),
        rate: Number(it.rate)
      }))
    };

    this.saving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    const req$ = (this.isEditMode && this.quoteId)
      ? this.quoteService.updateQuote(this.quoteId, payload)
      : this.quoteService.createQuote({ ...payload, quoteNumber: this.previewQuoteNumber !== 'Auto-Generated' ? this.previewQuoteNumber : null });

    req$.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (saved) => {
        this.toastService.success(
          this.isEditMode
            ? `Supplier quote ${saved.quoteNumber} updated successfully.`
            : `Supplier quote ${saved.quoteNumber} recorded successfully.`,
          this.isEditMode ? 'Quote Updated' : 'Quote Saved'
        );
        this.router.navigate(['/admin/procurement/supplier-quotes']);
      },
      error: (err) => {
        console.error('Failed to save supplier quote:', err);
        const msg = err?.error?.detail || err?.error?.title || 'Failed to save supplier quote.';
        this.errorMessage = msg;
        this.toastService.error(msg, 'Save Failed');
      }
    });
  }
}

