import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { SupplierListItem } from '../../models/supplier.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderListItem, PurchaseOrder } from '../../models/purchase-order.model';
import { SupplierBillService } from '../../services/supplier-bill.service';

@Component({
  selector: 'app-supplier-bill-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './supplier-bill-form.component.html',
  styleUrl: './supplier-bill-form.component.scss'
})
export class SupplierBillFormComponent implements OnInit {
  billForm!: FormGroup;
  isEditMode = false;
  billId: number | null = null;

  suppliers: SupplierListItem[] = [];
  filteredSuppliers: SupplierListItem[] = [];
  supplierSearch = '';
  showSupplierDropdown = false;
  selectedSupplier: SupplierListItem | null = null;

  supplierPurchaseOrders: PurchaseOrderListItem[] = [];
  isLoadingPos = false;

  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  serverConflictMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billService: SupplierBillService,
    private supplierService: SupplierService,
    private poService: PurchaseOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSuppliers();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !Number.isNaN(Number(idParam))) {
      this.isEditMode = true;
      this.billId = Number(idParam);
      this.loadBillForEdit(this.billId);
    } else {
      this.loadNextInternalBillNumber();
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    // Default due date: 30 days ahead
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const dueDateStr = due.toISOString().substring(0, 10);

    this.billForm = this.fb.group({
      internalBillNumber: [{ value: '', disabled: true }],
      supplierId: [null, [Validators.required]],
      purchaseOrderId: [null],
      supplierInvoiceNumber: ['', [Validators.required, Validators.maxLength(100)]],
      billDate: [today, [Validators.required]],
      dueDate: [dueDateStr, [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
      items: this.fb.array([])
    });

    if (!this.isEditMode) {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.billForm.get('items') as FormArray;
  }

  createItem(desc = '', qty = 1, rate = 0): FormGroup {
    return this.fb.group({
      description: [desc, [Validators.required, Validators.maxLength(500)]],
      quantity: [qty, [Validators.required, Validators.min(0.01)]],
      rate: [rate, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(desc = '', qty = 1, rate = 0): void {
    this.items.push(this.createItem(desc, qty, rate));
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) {
      alert('A supplier bill must have at least one item.');
      return;
    }
    this.items.removeAt(index);
    this.cdr.markForCheck();
  }

  getItemAmount(index: number): number {
    const item = this.items.at(index);
    if (!item) return 0;
    const qty = Number(item.get('quantity')?.value) || 0;
    const rate = Number(item.get('rate')?.value) || 0;
    return Math.round(qty * rate * 100) / 100;
  }

  get totalBillAmount(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemAmount(i);
    }
    return Math.round(total * 100) / 100;
  }

  loadNextInternalBillNumber(): void {
    this.billService.getNextInternalBillNumber().subscribe({
      next: (res) => {
        if (!this.isEditMode) {
          this.billForm.patchValue({ internalBillNumber: res.internalBillNumber });
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Failed to get next internal bill number:', err)
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers(undefined, 1, 200).subscribe({
      next: (res) => {
        this.suppliers = (res.items || []).filter((s) => s.status === 'Active');
        this.filteredSuppliers = [...this.suppliers];
        if (this.selectedSupplier) {
          const match = this.suppliers.find((s) => s.id === this.selectedSupplier?.id);
          if (match) this.selectedSupplier = match;
        }
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
    this.billForm.patchValue({ supplierId: sup.id, purchaseOrderId: null });
    this.showSupplierDropdown = false;
    this.loadSupplierPurchaseOrders(sup.id);
    this.cdr.markForCheck();
  }

  clearSupplier(): void {
    this.selectedSupplier = null;
    this.supplierSearch = '';
    this.filteredSuppliers = [...this.suppliers];
    this.supplierPurchaseOrders = [];
    this.billForm.patchValue({ supplierId: null, purchaseOrderId: null });
    this.cdr.markForCheck();
  }

  loadSupplierPurchaseOrders(supplierId: number, preservePoId?: number): void {
    this.isLoadingPos = true;
    this.poService
      .getPurchaseOrdersBySupplier(supplierId)
      .pipe(
        finalize(() => {
          this.isLoadingPos = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (pos) => {
          // Exclude cancelled POs
          this.supplierPurchaseOrders = (pos || []).filter((p) => p.status !== 'Cancelled');
          if (preservePoId) {
            this.billForm.patchValue({ purchaseOrderId: preservePoId });
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load POs for supplier:', err);
          this.supplierPurchaseOrders = [];
        }
      });
  }

  onPurchaseOrderSelected(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if (!val) return;
    const poId = Number(val);
    if (!poId || Number.isNaN(poId)) return;

    // Fetch full PO items to populate bill items for review
    this.poService.getPurchaseOrderById(poId).subscribe({
      next: (po: PurchaseOrder) => {
        if (!po || !po.items || po.items.length === 0) return;

        // Clear existing items and copy from PO
        this.items.clear();
        for (const itm of po.items) {
          this.addItem(itm.description, itm.quantity, itm.rate);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to fetch selected PO items:', err)
    });
  }

  loadBillForEdit(id: number): void {
    this.isLoading = true;
    this.billService
      .getSupplierBillById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (bill) => {
          if (bill.status === 'Cancelled') {
            alert('Cancelled supplier bills cannot be edited.');
            this.router.navigate(['/admin/procurement/supplier-bills', id]);
            return;
          }
          if (bill.paidAmount > 0) {
            alert('Bills with recorded payments cannot be edited directly.');
            this.router.navigate(['/admin/procurement/supplier-bills', id]);
            return;
          }

          this.billForm.patchValue({
            internalBillNumber: bill.internalBillNumber,
            supplierId: bill.supplierId,
            purchaseOrderId: bill.purchaseOrderId,
            supplierInvoiceNumber: bill.supplierInvoiceNumber,
            billDate: bill.billDate ? bill.billDate.substring(0, 10) : '',
            dueDate: bill.dueDate ? bill.dueDate.substring(0, 10) : '',
            description: bill.description || ''
          });

          this.supplierSearch = bill.supplierName;
          this.selectedSupplier = {
            id: bill.supplierId,
            supplierName: bill.supplierName,
            contactPerson: bill.supplierContactPerson,
            phoneNumber: bill.supplierPhone,
            email: bill.supplierEmail,
            status: 'Active',
            createdAt: ''
          } as SupplierListItem;

          this.loadSupplierPurchaseOrders(bill.supplierId, bill.purchaseOrderId || undefined);

          this.items.clear();
          if (bill.items && bill.items.length > 0) {
            for (const itm of bill.items) {
              this.addItem(itm.description, itm.quantity, itm.rate);
            }
          } else {
            this.addItem();
          }

          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load supplier bill.';
        }
      });
  }

  saveBill(): void {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      this.errorMessage = 'Please fix all highlighted errors before saving.';
      return;
    }

    if (this.items.length === 0) {
      this.errorMessage = 'At least one bill item is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.serverConflictMessage = null;

    const raw = this.billForm.getRawValue();
    const itemsPayload = (raw.items || []).map((itm: any) => ({
      description: (itm.description || '').trim(),
      quantity: Number(itm.quantity) || 0,
      rate: Number(itm.rate) || 0
    }));

    if (this.isEditMode && this.billId) {
      const updatePayload = {
        supplierInvoiceNumber: (raw.supplierInvoiceNumber || '').trim(),
        supplierId: Number(raw.supplierId),
        purchaseOrderId: raw.purchaseOrderId ? Number(raw.purchaseOrderId) : null,
        billDate: raw.billDate,
        dueDate: raw.dueDate,
        description: raw.description ? raw.description.trim() : null,
        items: itemsPayload
      };

      this.billService
        .updateSupplierBill(this.billId, updatePayload)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (updated) => {
            this.router.navigate(['/admin/procurement/supplier-bills', updated.id]);
          },
          error: (err) => {
            if (err?.status === 409) {
              this.serverConflictMessage = err?.error?.detail || 'A duplicate supplier invoice was detected.';
            } else {
              this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to update supplier bill.';
            }
          }
        });
    } else {
      const createPayload = {
        internalBillNumber: raw.internalBillNumber || null,
        supplierInvoiceNumber: (raw.supplierInvoiceNumber || '').trim(),
        supplierId: Number(raw.supplierId),
        purchaseOrderId: raw.purchaseOrderId ? Number(raw.purchaseOrderId) : null,
        billDate: raw.billDate,
        dueDate: raw.dueDate,
        description: raw.description ? raw.description.trim() : null,
        items: itemsPayload
      };

      this.billService
        .createSupplierBill(createPayload)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (created) => {
            this.router.navigate(['/admin/procurement/supplier-bills', created.id]);
          },
          error: (err) => {
            if (err?.status === 409) {
              this.serverConflictMessage = err?.error?.detail || 'A duplicate supplier invoice was detected.';
            } else {
              this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to record supplier bill.';
            }
          }
        });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.billId) {
      this.router.navigate(['/admin/procurement/supplier-bills', this.billId]);
    } else {
      this.router.navigate(['/admin/procurement/supplier-bills']);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
}
