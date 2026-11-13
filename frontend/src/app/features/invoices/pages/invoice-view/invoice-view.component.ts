import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { InvoiceShareModalComponent } from '../../components/invoice-share-modal/invoice-share-modal.component';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, RouterModule, InvoiceShareModalComponent],
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.scss']
})
export class InvoiceViewComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);

  invoice: Invoice | null = null;
  loading: boolean = true;
  isDownloadingPdf: boolean = false;
  showShareModal: boolean = false;
  errorMessage: string | null = null;
  currentIdOrNumber: string | null = null;

  getAdjustmentLabel(inv: Invoice): string {
    const type = (inv.adjustmentType || 'advance').toLowerCase();
    switch (type) {
      case 'tax_amount':
        return 'TAX:';
      case 'tax_percent':
        return inv.adjustmentRate != null ? `TAX (${inv.adjustmentRate}%):` : 'TAX:';
      case 'percent_off':
        return inv.adjustmentRate != null ? `DISCOUNT (${inv.adjustmentRate}% OFF):` : 'DISCOUNT:';
      default:
        return 'ADVANCE:';
    }
  }

  private routeSub?: Subscription;
  private timeoutId?: any;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idOrNumber = params.get('id') || params.get('idOrNumber');
      if (!idOrNumber) {
        this.router.navigate(['/admin/invoices']);
        return;
      }

      this.currentIdOrNumber = idOrNumber;
      this.loadInvoice(idOrNumber);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  loadInvoice(idOrNumber: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Safety timeout: Never stay stuck on spinner indefinitely
    this.timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMessage = 'Request timed out while loading the invoice. Please verify connection and retry.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }, 8000);

    this.invoiceService.getInvoice(idOrNumber).subscribe({
      next: (inv) => {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.invoice = inv;
        this.loading = false;
        this.errorMessage = null;
        this.cdr.markForCheck();
        this.cdr.detectChanges();

        // Auto-trigger print if requested via query param
        if (this.route.snapshot.queryParamMap.get('print') === 'true') {
          setTimeout(() => {
            this.printInvoice();
          }, 350);
        }

        // Auto-trigger download if requested
        if (this.route.snapshot.queryParamMap.get('download') === 'true') {
          setTimeout(() => {
            this.downloadPdf();
          }, 350);
        }
      },
      error: (err) => {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        console.error('Failed to load invoice:', err);
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Failed to load invoice statement from database.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  printInvoice(): void {
    window.print();
  }

  openShareModal(): void {
    this.showShareModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  downloadPdf(): void {
    if (!this.invoice) return;

    this.isDownloadingPdf = true;
    this.cdr.markForCheck();

    this.invoiceService.downloadInvoicePdf(this.invoice.id, this.invoice.invoiceNumber).subscribe({
      next: () => {
        this.isDownloadingPdf = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to download invoice PDF:', err);
        this.isDownloadingPdf = false;
        this.cdr.markForCheck();
      }
    });
  }
}
