import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierBillListItem, SupplierBillSummary } from '../../models/supplier-bill.model';
import { SupplierBillService } from '../../services/supplier-bill.service';

@Component({
  selector: 'app-supplier-bills',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './supplier-bills.component.html',
  styleUrl: './supplier-bills.component.scss'
})
export class SupplierBillsComponent implements OnInit {
  bills: SupplierBillListItem[] = [];
  summary: SupplierBillSummary = {
    outstandingPayables: 0,
    overdueBillsCount: 0,
    paidThisMonth: 'Not Available'
  };

  isLoading = true;
  isLoadingSummary = true;
  isCancelling = false;
  errorMessage: string | null = null;
  actionMessage: string | null = null;

  searchTerm = '';
  selectedStatus = 'All';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  billToCancel: SupplierBillListItem | null = null;
  showCancelModal = false;

  constructor(
    private billService: SupplierBillService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadBills();
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.billService
      .getSummary()
      .pipe(
        finalize(() => {
          this.isLoadingSummary = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.summary = res;
        },
        error: (err) => {
          console.error('Failed to load bill summary:', err);
        }
      });
  }

  loadBills(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.billService
      .getSupplierBills(this.searchTerm, this.selectedStatus, this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.bills = res.items || [];
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load supplier bills.';
        }
      });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadBills();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadBills();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.loadBills();
  }

  goToRecordBill(): void {
    this.router.navigate(['/admin/procurement/supplier-bills/create']);
  }

  goToAgingReport(): void {
    this.router.navigate(['/admin/procurement/supplier-bills/aging-report']);
  }

  viewBill(id: number): void {
    this.router.navigate(['/admin/procurement/supplier-bills', id]);
  }

  editBill(id: number): void {
    this.router.navigate(['/admin/procurement/supplier-bills/edit', id]);
  }

  openCancelModal(bill: SupplierBillListItem): void {
    if (bill.status === 'Cancelled' || this.isCancelling) return;
    this.billToCancel = bill;
    this.showCancelModal = true;
    this.cdr.markForCheck();
  }

  closeCancelModal(): void {
    this.billToCancel = null;
    this.showCancelModal = false;
    this.cdr.markForCheck();
  }

  confirmCancel(): void {
    if (!this.billToCancel || this.isCancelling) return;
    this.isCancelling = true;
    const id = this.billToCancel.id;
    const num = this.billToCancel.internalBillNumber;

    this.billService
      .cancelSupplierBill(id)
      .pipe(
        finalize(() => {
          this.isCancelling = false;
          this.closeCancelModal();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.actionMessage = res?.message || `Supplier bill ${num} has been cancelled.`;
          this.loadBills();
          this.loadSummary();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.error?.detail || 'Failed to cancel supplier bill.';
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
}
