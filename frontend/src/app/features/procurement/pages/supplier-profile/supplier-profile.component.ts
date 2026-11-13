import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderListItem } from '../../models/purchase-order.model';
import { SupplierBillService } from '../../services/supplier-bill.service';
import { SupplierBillListItem } from '../../models/supplier-bill.model';
import { SupplierPaymentService } from '../../services/supplier-payment.service';
import { SupplierPaymentListItem } from '../../models/supplier-payment.model';

@Component({
  selector: 'app-supplier-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-profile.component.html',
  styleUrls: ['./supplier-profile.component.scss']
})
export class SupplierProfileComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private poService = inject(PurchaseOrderService);
  private billService = inject(SupplierBillService);
  private paymentService = inject(SupplierPaymentService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  supplier: Supplier | null = null;
  purchaseOrders: PurchaseOrderListItem[] = [];
  loadingPurchaseOrders: boolean = false;
  supplierBills: SupplierBillListItem[] = [];
  loadingBills: boolean = false;
  supplierPayments: SupplierPaymentListItem[] = [];
  loadingPayments: boolean = false;
  supplierOutstanding: number = 0;
  supplierTotalPaid: number = 0;
  totalBillsCount: number = 0;
  openPosCount: number = 0;
  loading: boolean = true;
  errorMessage: string | null = null;
  activeTab: 'services' | 'purchase-orders' | 'bills' | 'payment-history' = 'services';
  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadSupplier(Number(idParam));
    } else {
      this.loading = false;
      this.errorMessage = 'Supplier ID is missing.';
    }
  }

  loadSupplier(id: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.supplierService.getSupplierById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (sup) => {
        this.supplier = sup;
        this.loadSupplierPurchaseOrders(id);
        this.loadSupplierBills(id);
        this.loadSupplierPayments(id);
      },
      error: (err) => {
        console.error('Failed to load supplier profile:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load supplier profile.';
      }
    });
  }

  loadSupplierPurchaseOrders(supplierId: number): void {
    this.loadingPurchaseOrders = true;
    this.cdr.markForCheck();

    this.poService.getPurchaseOrdersBySupplier(supplierId).pipe(
      finalize(() => {
        this.loadingPurchaseOrders = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        this.purchaseOrders = list || [];
        this.openPosCount = this.purchaseOrders.filter(p => p.status === 'Draft' || p.status === 'Issued').length;
      },
      error: (err) => {
        console.error('Failed to load supplier purchase orders:', err);
        this.purchaseOrders = [];
        this.openPosCount = 0;
      }
    });
  }

  loadSupplierBills(supplierId: number): void {
    this.loadingBills = true;
    this.cdr.markForCheck();

    this.billService.getBillsBySupplier(supplierId).pipe(
      finalize(() => {
        this.loadingBills = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        this.supplierBills = list || [];
        this.totalBillsCount = this.supplierBills.length;
        this.supplierOutstanding = this.supplierBills
          .filter(b => b.status !== 'Cancelled')
          .reduce((sum, b) => sum + (b.balance || 0), 0);
      },
      error: (err) => {
        console.error('Failed to load supplier bills:', err);
        this.supplierBills = [];
        this.totalBillsCount = 0;
        this.supplierOutstanding = 0;
      }
    });
  }

  loadSupplierPayments(supplierId: number): void {
    this.loadingPayments = true;
    this.cdr.markForCheck();

    this.paymentService.getPaymentsBySupplier(supplierId).pipe(
      finalize(() => {
        this.loadingPayments = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        this.supplierPayments = list || [];
        this.supplierTotalPaid = this.supplierPayments
          .filter(p => p.status === 'Posted')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      },
      error: (err) => {
        console.error('Failed to load supplier payments:', err);
        this.supplierPayments = [];
        this.supplierTotalPaid = 0;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  setTab(tab: 'services' | 'purchase-orders' | 'bills' | 'payment-history'): void {
    this.activeTab = tab;
  }
}

