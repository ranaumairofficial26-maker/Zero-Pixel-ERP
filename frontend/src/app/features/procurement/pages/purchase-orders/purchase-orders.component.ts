import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderListItem } from '../../models/purchase-order.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit {
  private poService = inject(PurchaseOrderService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  purchaseOrders: PurchaseOrderListItem[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  poToCancel: PurchaseOrderListItem | null = null;
  isCancelling: boolean = false;
  private searchTimer?: any;

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.poService.getPurchaseOrders(this.searchTerm, this.currentPage, this.pageSize).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.purchaseOrders = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.totalPages = res.totalPages || 0;
      },
      error: (err) => {
        console.error('Failed to load purchase orders:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load purchase orders from database.';
      }
    });
  }

  onSearch(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadPurchaseOrders();
    }, 250);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPurchaseOrders();
    }
  }

  openCancelModal(po: PurchaseOrderListItem): void {
    this.poToCancel = po;
    this.isCancelling = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;
    this.poToCancel = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmCancelPo(): void {
    if (!this.poToCancel || this.isCancelling) return;

    const target = this.poToCancel;
    this.isCancelling = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.poService.cancelPurchaseOrder(target.id).pipe(
      finalize(() => {
        this.isCancelling = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.poToCancel = null;
        this.purchaseOrders = this.purchaseOrders.map(p =>
          p.id === target.id ? { ...p, status: 'Cancelled' } : p
        );
        this.toastService.success(`Purchase Order ${target.poNumber} has been cancelled.`, 'PO Cancelled');
      },
      error: (err) => {
        console.error('Failed to cancel PO:', err);
        this.toastService.error('Failed to cancel purchase order. Please try again.', 'Cancel Failed');
      }
    });
  }
}
