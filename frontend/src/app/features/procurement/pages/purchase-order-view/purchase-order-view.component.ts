import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './purchase-order-view.component.html',
  styleUrl: './purchase-order-view.component.scss'
})
export class PurchaseOrderViewComponent implements OnInit {
  po: PurchaseOrder | null = null;
  isLoading = true;
  isProcessing = false;
  errorMessage: string | null = null;
  actionMessage: string | null = null;
  showCancelModal = false;
  private autoPrint = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: PurchaseOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.autoPrint = this.route.snapshot.queryParamMap.get('print') === 'true';
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Invalid Purchase Order ID.';
      this.isLoading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      return;
    }

    this.loadPurchaseOrder(id);
  }

  loadPurchaseOrder(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.poService
      .getPurchaseOrderById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.po = data;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          if (this.autoPrint) {
            this.autoPrint = false;
            setTimeout(() => window.print(), 300);
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load Purchase Order details.';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
  }

  backToList(): void {
    this.router.navigate(['/admin/procurement/purchase-orders']);
  }

  editPo(): void {
    if (!this.po || this.po.status !== 'Draft') return;
    this.router.navigate(['/admin/procurement/purchase-orders/edit', this.po.id]);
  }

  issuePo(): void {
    if (!this.po || this.po.status !== 'Draft' || this.isProcessing) return;
    this.isProcessing = true;
    this.errorMessage = null;
    this.actionMessage = null;

    this.poService
      .issuePurchaseOrder(this.po.id)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (updated) => {
          this.po = updated;
          this.actionMessage = `Purchase Order ${updated.poNumber} has been issued.`;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to issue Purchase Order.';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
  }

  printPo(): void {
    window.print();
  }

  openCancelModal(): void {
    if (!this.po || this.po.status === 'Cancelled' || this.isProcessing) return;
    this.showCancelModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmCancelPo(): void {
    if (!this.po || this.isProcessing) return;
    this.isProcessing = true;
    this.errorMessage = null;
    this.actionMessage = null;

    this.poService
      .cancelPurchaseOrder(this.po.id)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.showCancelModal = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.actionMessage = res?.message || 'Purchase Order cancelled successfully.';
          if (this.po) {
            this.loadPurchaseOrder(this.po.id);
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to cancel Purchase Order.';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

