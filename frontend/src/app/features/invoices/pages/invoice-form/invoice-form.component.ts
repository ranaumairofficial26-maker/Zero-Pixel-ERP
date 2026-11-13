import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice, InvoiceAdjustmentType } from '../../models/invoice.model';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { InvoiceShareModalComponent } from '../../components/invoice-share-modal/invoice-share-modal.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InvoiceShareModalComponent],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);

  invoiceForm!: FormGroup;
  isEditMode: boolean = false;
  invoiceId: number | null = null;
  loading: boolean = true;
  saving: boolean = false;
  savingAndDownloading: boolean = false;
  errorMessage: string | null = null;

  showSuccessModal: boolean = false;
  savedInvoice: Invoice | null = null;
  isDownloadingModalPdf: boolean = false;
  showShareModal: boolean = false;

  customersList: Customer[] = [];
  selectedCustomer: Customer | null = null;
  previewInvoiceNumber: string = 'Auto-Generated';

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.invoiceForm = this.fb.group({
      customerId: [null, [Validators.required]],
      invoiceDate: [today, [Validators.required]],
      ntnNumber: [''],
      clientPoNumber: [''],
      adjustmentType: ['advance'],
      advance: [0, [Validators.required, Validators.min(0)]],
      notes: ['1. Please clear the remaining balance within 15 days of invoice date.\n2. Any discrepancy in quantity or quality must be reported within 48 hours of delivery.'],
      items: this.fb.array([])
    });

    // Listen to advance or adjustmentType changes for live balance update
    this.invoiceForm.get('advance')?.valueChanges.subscribe(() => {
      this.validateAdvance();
    });
    this.invoiceForm.get('adjustmentType')?.valueChanges.subscribe(() => {
      this.validateAdvance();
    });

    // Listen to customerId changes to auto-fill NTN# and Customer Snapshot
    this.invoiceForm.get('customerId')?.valueChanges.subscribe((val) => {
      this.applySelectedCustomer(val);
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemRow(grNumber: string = '', description: string = '', quantity: number = 1000, rate: number = 0): FormGroup {
    const row = this.fb.group({
      grNumber: [grNumber],
      description: [description, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(0.0001)]],
      rate: [rate, [Validators.required, Validators.min(0)]],
      amount: [{ value: quantity * rate, disabled: true }]
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
    this.validateAdvance();
  }

  addItem(): void {
    this.items.push(this.createItemRow());
    this.validateAdvance();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.validateAdvance();
    }
  }

  private loadCustomers(): void {
    this.customerService.getCustomers('', 'active', 1, 50).subscribe({
      next: (res) => {
        this.customersList = res.items || [];
        this.checkRouteAndLoadData();
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.checkRouteAndLoadData();
      }
    });
  }

  private checkRouteAndLoadData(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.invoiceId = Number(idParam);
      this.loadInvoiceForEdit(this.invoiceId);
    } else {
      this.isEditMode = false;
      // Add first initial row
      if (this.items.length === 0) {
        this.addItem();
      }
      this.loadNextInvoiceNumber();
      this.loading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  private loadNextInvoiceNumber(): void {
    this.invoiceService.getNextInvoiceNumber().subscribe({
      next: (res) => {
        this.previewInvoiceNumber = res.invoiceNumber;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.previewInvoiceNumber = 'Auto-Generated';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  private loadInvoiceForEdit(id: number): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (inv) => {
        this.previewInvoiceNumber = inv.invoiceNumber;
        const dateStr = inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '';

        const adjType: InvoiceAdjustmentType = (inv.adjustmentType as InvoiceAdjustmentType) || 'advance';
        const isPct = adjType === 'tax_percent' || adjType === 'percent_off';

        this.invoiceForm.patchValue({
          customerId: inv.customerId,
          invoiceDate: dateStr,
          ntnNumber: inv.ntnNumber || '',
          clientPoNumber: inv.clientPoNumber || '',
          adjustmentType: adjType,
          advance: isPct ? (inv.adjustmentRate ?? 0) : inv.advance,
          notes: inv.notes || ''
        });

        // Set customer display
        this.selectedCustomer = this.customersList.find(c => c.clientId === inv.customerId) || {
          clientId: inv.customerId,
          companyName: inv.customerName,
          contactPerson: null,
          phone: inv.contactNumber,
          email: inv.email,
          address: inv.billingAddress,
          isActive: true,
          createdAt: '',
          updatedAt: '',
          isArchived: false
        };

        // Populate items
        this.items.clear();
        if (inv.items && inv.items.length > 0) {
          inv.items.forEach(item => {
            this.items.push(this.createItemRow(
              item.grNumber || '',
              item.description || '',
              item.quantity,
              item.rate
            ));
          });
        } else {
          this.addItem();
        }

        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load invoice:', err);
        this.errorMessage = 'Failed to load invoice details.';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onCustomerChange(event?: Event): void {
    const formCustId = this.invoiceForm.get('customerId')?.value;
    if (formCustId) {
      this.applySelectedCustomer(formCustId);
      return;
    }
    if (event) {
      const select = event.target as HTMLSelectElement;
      const raw = select?.value || '';
      const parsed = Number(raw.includes(':') ? raw.split(':').pop()?.trim() : raw);
      this.applySelectedCustomer(parsed || null);
    }
  }

  private applySelectedCustomer(rawCustId: any): void {
    const custId = typeof rawCustId === 'number'
      ? rawCustId
      : Number(String(rawCustId || '').split(':').pop()?.trim());

    if (!custId || isNaN(custId)) {
      this.selectedCustomer = null;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    const found = this.customersList.find(c => Number(c.clientId) === custId);
    if (found) {
      this.selectedCustomer = found;
      this.invoiceForm.patchValue(
        { ntnNumber: found.ntnNumber || '' },
        { emitEvent: false }
      );
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }

    // Always fetch latest customer record by ID to ensure fresh NTN# & details
    this.customerService.getCustomerById(custId).subscribe({
      next: (cust) => {
        this.selectedCustomer = cust;
        const idx = this.customersList.findIndex(c => Number(c.clientId) === custId);
        if (idx !== -1) {
          this.customersList[idx] = cust;
        }
        const currentNtn = this.invoiceForm.get('ntnNumber')?.value;
        if (cust.ntnNumber || !this.isEditMode || !currentNtn) {
          this.invoiceForm.patchValue(
            { ntnNumber: cust.ntnNumber || (this.isEditMode ? currentNtn : '') || '' },
            { emitEvent: false }
          );
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  get total(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);
      const qty = Number(row.get('quantity')?.value) || 0;
      const rate = Number(row.get('rate')?.value) || 0;
      sum += qty * rate;
    }
    return Math.round(sum * 100) / 100;
  }

  get adjustmentType(): InvoiceAdjustmentType {
    return (this.invoiceForm.get('adjustmentType')?.value as InvoiceAdjustmentType) || 'advance';
  }

  get isPercentageMode(): boolean {
    return this.adjustmentType === 'tax_percent' || this.adjustmentType === 'percent_off';
  }

  get advance(): number {
    return Math.max(0, Number(this.invoiceForm.get('advance')?.value) || 0);
  }

  get calculatedAdjustmentAmount(): number {
    if (this.isPercentageMode) {
      return Math.round((this.total * this.advance / 100) * 100) / 100;
    }
    return Math.round(this.advance * 100) / 100;
  }

  get balance(): number {
    if (this.adjustmentType === 'tax_amount' || this.adjustmentType === 'tax_percent') {
      return Math.round((this.total + this.calculatedAdjustmentAmount) * 100) / 100;
    }
    return Math.max(0, Math.round((this.total - this.calculatedAdjustmentAmount) * 100) / 100);
  }

  get isAdvanceInvalid(): boolean {
    if (this.adjustmentType === 'percent_off') {
      return this.advance > 100;
    }
    if (this.adjustmentType === 'advance') {
      return this.advance > this.total;
    }
    return false;
  }

  get adjustmentErrorMessage(): string {
    if (this.adjustmentType === 'percent_off') {
      return 'Discount percentage cannot exceed 100%.';
    }
    return `Advance amount cannot exceed Total (Rs. ${this.total.toFixed(2)}).`;
  }

  get savedAdjustmentLabel(): string {
    if (!this.savedInvoice) return 'Advance';
    switch (this.savedInvoice.adjustmentType) {
      case 'tax_amount':
        return 'Tax';
      case 'tax_percent':
        return this.savedInvoice.adjustmentRate != null ? `Tax (${this.savedInvoice.adjustmentRate}%)` : 'Tax';
      case 'percent_off':
        return this.savedInvoice.adjustmentRate != null ? `Discount (${this.savedInvoice.adjustmentRate}% Off)` : 'Discount';
      default:
        return 'Advance';
    }
  }

  private validateAdvance(): void {
    const advControl = this.invoiceForm.get('advance');
    if (this.isAdvanceInvalid) {
      advControl?.setErrors({ advanceExceedsTotal: true });
    } else if (advControl?.hasError('advanceExceedsTotal')) {
      advControl?.setErrors(null);
    }
  }

  onSubmit(downloadPdfImmediately: boolean = false): void {
    this.errorMessage = null;

    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.errorMessage = 'Please fix all highlighted errors before saving.';
      return;
    }

    if (this.isAdvanceInvalid) {
      this.errorMessage = this.adjustmentErrorMessage;
      return;
    }

    if (this.items.length === 0) {
      this.errorMessage = 'Invoice must have at least one printing item.';
      return;
    }

    if (downloadPdfImmediately) {
      this.savingAndDownloading = true;
    } else {
      this.saving = true;
    }

    const formVal = this.invoiceForm.getRawValue();

    const payload = {
      customerId: Number(formVal.customerId),
      invoiceDate: formVal.invoiceDate ? new Date(formVal.invoiceDate).toISOString() : new Date().toISOString(),
      ntnNumber: formVal.ntnNumber ? formVal.ntnNumber.trim() : null,
      clientPoNumber: formVal.clientPoNumber ? formVal.clientPoNumber.trim() : null,
      adjustmentType: this.adjustmentType,
      adjustmentRate: this.isPercentageMode ? this.advance : null,
      advance: this.calculatedAdjustmentAmount,
      notes: formVal.notes || null,
      items: formVal.items.map((it: any) => ({
        grNumber: it.grNumber ? it.grNumber.trim() : null,
        description: it.description.trim(),
        quantity: Number(it.quantity) || 0,
        rate: Number(it.rate) || 0
      }))
    };

    if (this.isEditMode && this.invoiceId) {
      this.invoiceService.updateInvoice(this.invoiceId, payload).subscribe({
        next: (res) => {
          this.saving = false;
          this.savingAndDownloading = false;
          this.handleSaveSuccess(res, downloadPdfImmediately);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          this.savingAndDownloading = false;
          this.errorMessage = err?.error?.detail || 'Failed to update invoice. Please check the entered data.';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.invoiceService.createInvoice(payload).subscribe({
        next: (res) => {
          this.saving = false;
          this.savingAndDownloading = false;
          this.handleSaveSuccess(res, downloadPdfImmediately);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          this.savingAndDownloading = false;
          this.errorMessage = err?.error?.detail || 'Failed to create invoice. Please check the entered data.';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
    }
  }

  private handleSaveSuccess(res: Invoice, downloadPdf: boolean): void {
    this.savedInvoice = res;
    if (downloadPdf) {
      this.invoiceService.downloadInvoicePdf(res.id, res.invoiceNumber).subscribe({
        error: (err) => console.error('Failed to trigger immediate PDF download:', err)
      });
    }
    this.showSuccessModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  downloadSavedPdf(): void {
    if (!this.savedInvoice) return;
    this.isDownloadingModalPdf = true;
    this.cdr.markForCheck();
    this.invoiceService.downloadInvoicePdf(this.savedInvoice.id, this.savedInvoice.invoiceNumber).subscribe({
      next: () => {
        this.isDownloadingModalPdf = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to download invoice PDF:', err);
        this.isDownloadingModalPdf = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  openShareSavedModal(): void {
    this.showShareModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeShareSavedModal(): void {
    this.showShareModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeSuccessModalAndNavigate(target: 'view' | 'list' | 'new'): void {
    const invId = this.savedInvoice?.id;
    this.showSuccessModal = false;

    if (target === 'view' && invId) {
      this.router.navigate(['/admin/invoices/view', invId]);
    } else if (target === 'list') {
      this.router.navigate(['/admin/invoices']);
    } else if (target === 'new') {
      this.savedInvoice = null;
      this.invoiceForm.reset({
        customerId: null,
        invoiceDate: new Date().toISOString().split('T')[0],
        ntnNumber: '',
        clientPoNumber: '',
        advance: 0,
        notes: '1. Please clear the remaining balance within 15 days of invoice date.\n2. Any discrepancy in quantity or quality must be reported within 48 hours of delivery.'
      });
      while (this.items.length !== 0) {
        this.items.removeAt(0);
      }
      this.addItem();
      this.loadNextInvoiceNumber();
    }
  }
}

