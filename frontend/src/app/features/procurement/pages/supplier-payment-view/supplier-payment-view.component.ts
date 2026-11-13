import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierPayment } from '../../models/supplier-payment.model';
import { SupplierPaymentService } from '../../services/supplier-payment.service';

@Component({
  selector: 'app-supplier-payment-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './supplier-payment-view.component.html',
  styleUrl: './supplier-payment-view.component.scss'
})
export class SupplierPaymentViewComponent implements OnInit {
  payment: SupplierPayment | null = null;
  isLoading = true;
  isReversing = false;
  errorMessage: string | null = null;
  actionMessage: string | null = null;

  showReverseModal = false;
  reversalReason = '';
  reversalError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: SupplierPaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Invalid Supplier Payment ID.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loadPayment(id);
  }

  loadPayment(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.paymentService
      .getSupplierPaymentById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.payment = data;
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to load payment details.';
        }
      });
  }

  backToList(): void {
    this.router.navigate(['/admin/procurement/supplier-payments']);
  }

  openReverseModal(): void {
    if (!this.payment || this.payment.status === 'Reversed' || this.isReversing) return;
    this.reversalReason = '';
    this.reversalError = null;
    this.showReverseModal = true;
    this.cdr.markForCheck();
  }

  closeReverseModal(): void {
    this.showReverseModal = false;
    this.reversalReason = '';
    this.reversalError = null;
    this.cdr.markForCheck();
  }

  confirmReverse(): void {
    if (!this.payment || this.isReversing) return;

    if (!this.reversalReason || !this.reversalReason.trim()) {
      this.reversalError = 'Reversal reason is required.';
      return;
    }

    this.isReversing = true;
    this.reversalError = null;
    this.errorMessage = null;
    this.actionMessage = null;

    this.paymentService
      .reverseSupplierPayment(this.payment.id, { reversalReason: this.reversalReason.trim() })
      .pipe(
        finalize(() => {
          this.isReversing = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (updated) => {
          this.payment = updated;
          this.closeReverseModal();
          this.actionMessage = `Payment ${updated.paymentNumber} has been reversed and bill balance has been updated.`;
        },
        error: (err) => {
          this.reversalError = err?.error?.detail || err?.error?.message || 'Failed to reverse payment.';
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
