import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierBill } from '../../models/supplier-bill.model';
import { SupplierBillService } from '../../services/supplier-bill.service';

@Component({
  selector: 'app-supplier-bill-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-bill-view.component.html',
  styleUrl: './supplier-bill-view.component.scss'
})
export class SupplierBillViewComponent implements OnInit {
  bill: SupplierBill | null = null;
  isLoading = true;
  isProcessing = false;
  errorMessage: string | null = null;
  actionMessage: string | null = null;
  showCancelModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billService: SupplierBillService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Invalid Supplier Bill ID.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loadBill(id);
  }

  loadBill(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

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
        next: (data) => {
          this.bill = data;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load Supplier Bill details.';
        }
      });
  }

  backToList(): void {
    this.router.navigate(['/admin/procurement/supplier-bills']);
  }

  editBill(): void {
    if (!this.bill || this.bill.status === 'Cancelled' || this.bill.paidAmount > 0) return;
    this.router.navigate(['/admin/procurement/supplier-bills/edit', this.bill.id]);
  }

  openCancelModal(): void {
    if (!this.bill || this.bill.status === 'Cancelled' || this.isProcessing) return;
    this.showCancelModal = true;
    this.cdr.markForCheck();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cdr.markForCheck();
  }

  confirmCancel(): void {
    if (!this.bill || this.isProcessing) return;
    this.isProcessing = true;
    this.errorMessage = null;
    this.actionMessage = null;

    this.billService
      .cancelSupplierBill(this.bill.id)
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
          this.actionMessage = res?.message || 'Supplier bill cancelled successfully.';
          if (this.bill) {
            this.loadBill(this.bill.id);
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Failed to cancel supplier bill.';
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

