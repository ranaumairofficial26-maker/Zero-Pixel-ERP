import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierBillAgingReport } from '../../models/supplier-bill.model';
import { SupplierBillService } from '../../services/supplier-bill.service';

@Component({
  selector: 'app-supplier-bill-aging',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-bill-aging.component.html',
  styleUrl: './supplier-bill-aging.component.scss'
})
export class SupplierBillAgingComponent implements OnInit {
  report: SupplierBillAgingReport = {
    totalOutstanding: 0,
    totalNotYetDue: 0,
    total1To30Days: 0,
    total31To60Days: 0,
    total61To90Days: 0,
    totalOver90Days: 0,
    items: []
  };

  isLoading = true;
  errorMessage: string | null = null;
  selectedCategory: string = 'All';

  constructor(
    private billService: SupplierBillService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAgingReport();
  }

  loadAgingReport(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.billService
      .getAgingReport()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.report = res;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to load aging report.';
        }
      });
  }

  get filteredItems() {
    if (this.selectedCategory === 'All') {
      return this.report.items;
    }
    return this.report.items.filter((i) => i.agingCategory === this.selectedCategory);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  backToList(): void {
    this.router.navigate(['/admin/procurement/supplier-bills']);
  }

  viewBill(id: number): void {
    this.router.navigate(['/admin/procurement/supplier-bills', id]);
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

