import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierPaymentListItem } from '../../models/supplier-payment.model';
import { SupplierPaymentService } from '../../services/supplier-payment.service';

@Component({
  selector: 'app-supplier-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './supplier-payments.component.html',
  styleUrl: './supplier-payments.component.scss'
})
export class SupplierPaymentsComponent implements OnInit {
  payments: SupplierPaymentListItem[] = [];
  isLoading = true;
  isReversing = false;
  errorMessage: string | null = null;
  actionMessage: string | null = null;

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  paymentToReverse: SupplierPaymentListItem | null = null;
  reversalReason = '';
  reversalError: string | null = null;
  showReverseModal = false;

  constructor(
    private paymentService: SupplierPaymentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.paymentService
      .getSupplierPayments(this.searchTerm, this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.payments = res.items || [];
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to load supplier payments.';
        }
      });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadPayments();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.loadPayments();
  }

  goToRecordPayment(): void {
    this.router.navigate(['/admin/procurement/supplier-payments/create']);
  }

  viewPayment(id: number): void {
    this.router.navigate(['/admin/procurement/supplier-payments', id]);
  }

  openReverseModal(payment: SupplierPaymentListItem): void {
    if (payment.status === 'Reversed' || this.isReversing) return;
    this.paymentToReverse = payment;
    this.reversalReason = '';
    this.reversalError = null;
    this.showReverseModal = true;
    this.cdr.markForCheck();
  }

  closeReverseModal(): void {
    this.paymentToReverse = null;
    this.reversalReason = '';
    this.reversalError = null;
    this.showReverseModal = false;
    this.cdr.markForCheck();
  }

  confirmReverse(): void {
    if (!this.paymentToReverse || this.isReversing) return;

    if (!this.reversalReason || !this.reversalReason.trim()) {
      this.reversalError = 'Reversal reason is required.';
      return;
    }

    this.isReversing = true;
    this.reversalError = null;
    const id = this.paymentToReverse.id;
    const num = this.paymentToReverse.paymentNumber;

    this.paymentService
      .reverseSupplierPayment(id, { reversalReason: this.reversalReason.trim() })
      .pipe(
        finalize(() => {
          this.isReversing = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.closeReverseModal();
          this.actionMessage = `Payment ${num} has been reversed and the linked bill balance has been recalculated.`;
          this.loadPayments();
        },
        error: (err) => {
          this.reversalError = err?.error?.detail || err?.error?.message || 'Failed to reverse supplier payment.';
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
