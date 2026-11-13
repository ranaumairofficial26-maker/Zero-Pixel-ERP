import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService } from '../../services/supplier.service';
import { SupplierQuoteService } from '../../services/supplier-quote.service';
import { ProductionService } from '../../../production/services/production.service';
import { Supplier, SupplierListItem } from '../../models/supplier.model';
import { SupplierQuoteListItem } from '../../models/supplier-quote.model';
import { ProductionJob } from '../../../production/models/production.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.scss']
})
export class PurchaseOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private poService = inject(PurchaseOrderService);
  private supplierService = inject(SupplierService);
  private quoteService = inject(SupplierQuoteService);
  private productionService = inject(ProductionService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  poForm!: FormGroup;
  isEditMode: boolean = false;
  poId: number | null = null;
  previewPoNumber: string = 'Auto-Generated';
  poStatus: string = 'Draft';
  loading: boolean = true;
  saving: boolean = false;
  errorMessage: string | null = null;

  activeSuppliers: SupplierListItem[] = [];
  selectedSupplier: Supplier | null = null;
  supplierSearchTerm: string = '';

  allQuotes: SupplierQuoteListItem[] = [];
  quoteSearchTerm: string = '';
  hasQuoteDerivedItems: boolean = false;
  private lastSupplierId: number | null = null;

  jobs: ProductionJob[] = [];
  jobSearchTerm: string = '';

  readonly itemPlaceholders = [
    'e.g. Art Card',
    'e.g. Offset Paper',
    'e.g. Printing Plates',
    'e.g. Lamination Service'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.poForm = this.fb.group({
      supplierId: [null, [Validators.required]],
      supplierQuoteId: [null],
      projectJobId: [null],
      poDate: [today, [Validators.required]],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.poForm.get('items') as FormArray;
  }

  get filteredSuppliers(): SupplierListItem[] {
    const term = (this.supplierSearchTerm || '').trim().toLowerCase();
    if (!term) return this.activeSuppliers;
    return this.activeSuppliers.filter(s =>
      s.supplierName.toLowerCase().includes(term) ||
      (s.contactPerson || '').toLowerCase().includes(term) ||
      (s.phoneNumber || '').toLowerCase().includes(term)
    );
  }

  get eligibleQuotesForSupplier(): SupplierQuoteListItem[] {
    const supId = Number(this.poForm.get('supplierId')?.value);
    if (!supId) return [];
    const term = (this.quoteSearchTerm || '').trim().toLowerCase();
    return this.allQuotes.filter(q => {
      if (q.supplierId !== supId) return false;
      if (q.status === 'Cancelled') return false;
      if (!term) return true;
      return q.quoteNumber.toLowerCase().includes(term) ||
        (q.description || '').toLowerCase().includes(term);
    });
  }

  get filteredJobs(): ProductionJob[] {
    const term = (this.jobSearchTerm || '').trim().toLowerCase();
    if (!term) return this.jobs;
    return this.jobs.filter(j =>
      (j.jobNumber || '').toLowerCase().includes(term) ||
      (j.customerName || '').toLowerCase().includes(term) ||
      (j.orderNumber || '').toLowerCase().includes(term)
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

  get totalPoAmount(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);
      const qty = Number(row.get('quantity')?.value) || 0;
      const rate = Number(row.get('rate')?.value) || 0;
      sum += Math.round(qty * rate * 100) / 100;
    }
    return Math.round(sum * 100) / 100;
  }

  private loadReferenceData(): void {
    forkJoin({
      suppliers: this.supplierService.getSuppliers('', 1, 50),
      quotes: this.quoteService.getQuotes('', 1, 50),
      jobs: this.productionService.getJobs()
    }).subscribe({
      next: ({ suppliers, quotes, jobs }) => {
        this.activeSuppliers = (suppliers.items || []).filter(s => s.status === 'Active');
        this.allQuotes = quotes.items || [];
        this.jobs = jobs || [];
        this.checkRouteAndLoadData();
      },
      error: (err) => {
        console.error('Failed to load reference data:', err);
        this.checkRouteAndLoadData();
      }
    });
  }

  private checkRouteAndLoadData(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.poId = Number(idParam);
      this.loadPoForEdit(this.poId);
    } else {
      this.isEditMode = false;
      if (this.items.length === 0) {
        this.addItem();
      }
      this.poService.getNextPoNumber().subscribe({
        next: (res) => {
          this.previewPoNumber = res.poNumber;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: () => {
          this.previewPoNumber = 'Auto-Generated';
        }
      });
      this.loading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  private loadPoForEdit(id: number): void {
    this.loading = true;
    this.errorMessage = null;

    this.poService.getPurchaseOrderById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (po) => {
        this.previewPoNumber = po.poNumber;
        this.poStatus = po.status;
        this.lastSupplierId = po.supplierId;
        const dateStr = po.poDate ? po.poDate.split('T')[0] : '';

        if (po.status !== 'Draft') {
          this.errorMessage = `Purchase Order ${po.poNumber} is '${po.status}' and cannot be edited.`;
          return;
        }

        if (!this.activeSuppliers.some(s => s.id === po.supplierId)) {
          this.activeSuppliers = [
            {
              id: po.supplierId,
              supplierName: po.supplierName,
              contactPerson: po.supplierContactPerson,
              phoneNumber: po.supplierPhone,
              email: po.supplierEmail,
              status: 'Active',
              createdAt: po.createdAt
            },
            ...this.activeSuppliers
          ];
        }

        this.selectedSupplier = {
          id: po.supplierId,
          supplierName: po.supplierName,
          contactPerson: po.supplierContactPerson,
          phoneNumber: po.supplierPhone,
          email: po.supplierEmail,
          address: po.supplierAddress,
          status: 'Active',
          services: [],
          createdAt: po.createdAt,
          updatedAt: po.updatedAt
        };

        this.poForm.patchValue({
          supplierId: po.supplierId,
          supplierQuoteId: po.supplierQuoteId || null,
          projectJobId: po.projectJobId || null,
          poDate: dateStr
        });

        this.items.clear();
        if (po.items && po.items.length > 0) {
          po.items.forEach(it => {
            this.items.push(this.createItemRow(it.description, it.quantity, it.rate));
          });
        } else {
          this.addItem();
        }
      },
      error: (err) => {
        console.error('Failed to load purchase order:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load purchase order details.';
      }
    });
  }

  onSupplierSelected(): void {
    const newSupId = Number(this.poForm.get('supplierId')?.value) || null;

    if (this.lastSupplierId && newSupId !== this.lastSupplierId && (this.poForm.get('supplierQuoteId')?.value || this.hasQuoteDerivedItems)) {
      const confirmed = confirm(
        'Changing the supplier will clear the previous supplier quotation reference and any quotation-derived items. Continue?'
      );
      if (!confirmed) {
        this.poForm.patchValue({ supplierId: this.lastSupplierId }, { emitEvent: false });
        return;
      }

      this.poForm.patchValue({ supplierQuoteId: null }, { emitEvent: false });
      if (this.hasQuoteDerivedItems) {
        this.items.clear();
        this.addItem();
        this.hasQuoteDerivedItems = false;
      }
    }

    this.lastSupplierId = newSupId;
    this.quoteSearchTerm = '';

    if (!newSupId) {
      this.selectedSupplier = null;
      this.cdr.markForCheck();
      return;
    }

    this.supplierService.getSupplierById(newSupId).subscribe({
      next: (sup) => {
        this.selectedSupplier = sup;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onQuoteSelected(): void {
    const quoteId = Number(this.poForm.get('supplierQuoteId')?.value) || null;
    if (!quoteId) {
      return;
    }

    this.quoteService.getQuoteById(quoteId).subscribe({
      next: (quote) => {
        if (quote && quote.items && quote.items.length > 0) {
          this.items.clear();
          quote.items.forEach(it => {
            this.items.push(this.createItemRow(it.description, it.quantity, it.rate));
          });
          this.hasQuoteDerivedItems = true;
          this.toastService.info(`Copied ${quote.items.length} item(s) from ${quote.quoteNumber}. You can review and adjust quantities/rates before saving.`, 'Quote Loaded');
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.toastService.error('Failed to load items from the selected Supplier Quote.', 'Load Failed');
      }
    });
  }

  submitPo(issueImmediately: boolean): void {
    if (this.saving) return;

    if (this.poForm.invalid || this.items.length === 0) {
      this.poForm.markAllAsTouched();
      this.toastService.warning('Please select a supplier, date, and complete all item rows.', 'Invalid Form');
      return;
    }

    const v = this.poForm.value;
    const basePayload = {
      supplierId: Number(v.supplierId),
      supplierQuoteId: v.supplierQuoteId ? Number(v.supplierQuoteId) : null,
      projectJobId: v.projectJobId ? Number(v.projectJobId) : null,
      poDate: v.poDate ? new Date(v.poDate).toISOString() : new Date().toISOString(),
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

    if (this.isEditMode && this.poId) {
      this.poService.updateDraftPurchaseOrder(this.poId, basePayload).pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (updated) => {
          if (issueImmediately) {
            this.poService.issuePurchaseOrder(updated.id).subscribe({
              next: (issued) => {
                this.toastService.success(`Purchase Order ${issued.poNumber} updated and issued.`, 'PO Issued');
                this.router.navigate(['/admin/procurement/purchase-orders']);
              },
              error: (err) => {
                this.toastService.error(err?.error?.detail || 'Draft saved, but failed to issue PO.', 'Issue Failed');
              }
            });
          } else {
            this.toastService.success(`Draft Purchase Order ${updated.poNumber} updated.`, 'Draft Updated');
            this.router.navigate(['/admin/procurement/purchase-orders']);
          }
        },
        error: (err) => {
          const msg = err?.error?.detail || err?.error?.title || 'Failed to update Purchase Order.';
          this.errorMessage = msg;
          this.toastService.error(msg, 'Update Failed');
        }
      });
    } else {
      this.poService.createPurchaseOrder(
        { ...basePayload, poNumber: this.previewPoNumber !== 'Auto-Generated' ? this.previewPoNumber : null },
        issueImmediately
      ).pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (saved) => {
          this.toastService.success(
            issueImmediately
              ? `Purchase Order ${saved.poNumber} created and issued.`
              : `Purchase Order ${saved.poNumber} saved as Draft.`,
            issueImmediately ? 'PO Issued' : 'Draft Saved'
          );
          this.router.navigate(['/admin/procurement/purchase-orders']);
        },
        error: (err) => {
          const msg = err?.error?.detail || err?.error?.title || 'Failed to save Purchase Order.';
          this.errorMessage = msg;
          this.toastService.error(msg, 'Save Failed');
        }
      });
    }
  }
}

