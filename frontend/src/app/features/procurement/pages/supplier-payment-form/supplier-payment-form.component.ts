import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { SupplierListItem } from '../../models/supplier.model';
import { SupplierBillService } from '../../services/supplier-bill.service';
import { SupplierBillListItem } from '../../models/supplier-bill.model';
import { SupplierPaymentService } from '../../services/supplier-payment.service';

@Component({
  selector: 'app-supplier-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './supplier-payment-form.component.html',
  styleUrl: './supplier-payment-form.component.scss'
})
export class SupplierPaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;

  suppliers: SupplierListItem[] = [];
  filteredSuppliers: SupplierListItem[] = [];
  supplierSearch = '';
  showSupplierDropdown = false;
  selectedSupplier: SupplierListItem | null = null;

  eligibleBills: SupplierBillListItem[] = [];
  filteredBills: SupplierBillListItem[] = [];
  billSearch = '';
  showBillDropdown = false;
  selectedBill: SupplierBillListItem | null = null;
  isLoadingBills = false;

  isSubmitting = false;
  errorMessage: string | null = null;
  private idempotencyKey: string = '';

  readonly paymentMethods = ['Bank Transfer', 'Cash', 'Cheque'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supplierService: SupplierService,
    private billService: SupplierBillService,
    private paymentService: SupplierPaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idempotencyKey = this.generateIdempotencyKey();
    this.initForm();
    this.loadNextPaymentNumber();
    this.loadSuppliers();
  }

  private generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `pay-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private initForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.paymentForm = this.fb.group({
      paymentNumber: [{ value: '', disabled: true }],
      supplierId: [null, [Validators.required]],
      supplierBillId: [null, [Validators.required]],
      paymentDate: [today, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['Bank Transfer', [Validators.required]],
      paymentAccountReference: ['', [Validators.maxLength(150)]],
      transactionReference: ['', [Validators.maxLength(150)]],
      notes: ['', [Validators.maxLength(1000)]]
    });
  }

  loadNextPaymentNumber(): void {
    this.paymentService.getNextPaymentNumber().subscribe({
      next: (res) => {
        this.paymentForm.patchValue({ paymentNumber: res.paymentNumber });
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to get next payment number:', err)
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers(undefined, 1, 200).subscribe({
      next: (res) => {
        this.suppliers = (res.items || []).filter((s) => s.status === 'Active');
        this.filteredSuppliers = [...this.suppliers];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load active suppliers:', err)
    });
  }

  filterSuppliers(term: string): void {
    this.supplierSearch = term;
    if (!term || !term.trim()) {
      this.filteredSuppliers = [...this.suppliers];
    } else {
      const q = term.toLowerCase().trim();
      this.filteredSuppliers = this.suppliers.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
          (s.phoneNumber && s.phoneNumber.toLowerCase().includes(q))
      );
    }
  }

  selectSupplier(sup: SupplierListItem): void {
    this.selectedSupplier = sup;
    this.supplierSearch = sup.supplierName;
    this.showSupplierDropdown = false;

    // Clear previously selected bill & stale balances
    this.selectedBill = null;
    this.billSearch = '';
    this.eligibleBills = [];
    this.filteredBills = [];
    this.paymentForm.patchValue({
      supplierId: sup.id,
      supplierBillId: null,
      amount: null
    });

    this.loadEligibleBills(sup.id);
    this.cdr.markForCheck();
  }

  clearSupplier(): void {
    this.selectedSupplier = null;
    this.supplierSearch = '';
    this.filteredSuppliers = [...this.suppliers];
    this.selectedBill = null;
    this.billSearch = '';
    this.eligibleBills = [];
    this.filteredBills = [];
    this.paymentForm.patchValue({
      supplierId: null,
      supplierBillId: null,
      amount: null
    });
    this.cdr.markForCheck();
  }

  loadEligibleBills(supplierId: number): void {
    this.isLoadingBills = true;
    this.billService
      .getBillsBySupplier(supplierId)
      .pipe(
        finalize(() => {
          this.isLoadingBills = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (bills) => {
          // Exclude Cancelled and fully Paid bills (balance <= 0)
          this.eligibleBills = (bills || []).filter(
            (b) => b.status !== 'Cancelled' && b.status !== 'Paid' && b.balance > 0
          );
          this.filteredBills = [...this.eligibleBills];
        },
        error: (err) => {
          console.error('Failed to load supplier bills:', err);
          this.eligibleBills = [];
          this.filteredBills = [];
        }
      });
  }

  filterBills(term: string): void {
    this.billSearch = term;
    if (!term || !term.trim()) {
      this.filteredBills = [...this.eligibleBills];
    } else {
      const q = term.toLowerCase().trim();
      this.filteredBills = this.eligibleBills.filter(
        (b) =>
          b.internalBillNumber.toLowerCase().includes(q) ||
          b.supplierInvoiceNumber.toLowerCase().includes(q)
      );
    }
  }

  selectBill(bill: SupplierBillListItem): void {
    this.selectedBill = bill;
    this.billSearch = `${bill.internalBillNumber} (Inv: ${bill.supplierInvoiceNumber})`;
    this.showBillDropdown = false;

    const currentAmt = Number(this.paymentForm.get('amount')?.value) || 0;
    const patchedAmt = currentAmt > bill.balance ? null : this.paymentForm.get('amount')?.value;

    this.paymentForm.patchValue({
      supplierBillId: bill.id,
      amount: patchedAmt
    });
    this.cdr.markForCheck();
  }

  clearBill(): void {
    this.selectedBill = null;
    this.billSearch = '';
    this.filteredBills = [...this.eligibleBills];
    this.paymentForm.patchValue({
      supplierBillId: null,
      amount: null
    });
    this.cdr.markForCheck();
  }

  get newPaymentAmount(): number {
    const val = Number(this.paymentForm.get('amount')?.value) || 0;
    return val > 0 ? Math.round(val * 100) / 100 : 0;
  }

  get remainingBalanceAfterPayment(): number {
    if (!this.selectedBill) return 0;
    const remaining = this.selectedBill.balance - this.newPaymentAmount;
    return Math.round(remaining * 100) / 100;
  }

  get isOverpayment(): boolean {
    if (!this.selectedBill) return false;
    return this.newPaymentAmount > this.selectedBill.balance;
  }

  recordPayment(): void {
    if (this.isSubmitting) return;

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields with valid values.';
      return;
    }

    if (!this.selectedBill) {
      this.errorMessage = 'Please select an outstanding supplier bill.';
      return;
    }

    if (this.isOverpayment) {
      this.errorMessage = `Payment amount cannot exceed the outstanding balance of PKR ${this.formatCurrency(this.selectedBill.balance)}.`;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const raw = this.paymentForm.getRawValue();
    const payload = {
      supplierId: Number(raw.supplierId),
      supplierBillId: Number(raw.supplierBillId),
      paymentDate: raw.paymentDate,
      amount: Math.round(Number(raw.amount) * 100) / 100,
      paymentMethod: raw.paymentMethod,
      paymentAccountReference: raw.paymentAccountReference ? raw.paymentAccountReference.trim() : null,
      transactionReference: raw.transactionReference ? raw.transactionReference.trim() : null,
      notes: raw.notes ? raw.notes.trim() : null,
      idempotencyKey: this.idempotencyKey
    };

    this.paymentService
      .createSupplierPayment(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (created) => {
          this.router.navigate(['/admin/procurement/supplier-payments', created.id]);
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to record supplier payment.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/procurement/supplier-payments']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
}
