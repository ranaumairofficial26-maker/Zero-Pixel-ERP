import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap, finalize } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceListItem } from '../../models/invoice.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { ToastService } from '../../../../core/services/toast.service';
import { InvoiceShareModalComponent, ShareableInvoice } from '../../components/invoice-share-modal/invoice-share-modal.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InvoiceShareModalComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  public themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  invoices: InvoiceListItem[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  // Delete Confirmation Modal State
  invoiceToDelete: InvoiceListItem | null = null;
  isDeleting: boolean = false;

  // Share Modal State
  invoiceToShare: ShareableInvoice | null = null;
  markingPaidId: number | null = null;

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.invoiceService.getInvoices(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.invoices = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.totalPages = res.totalPages || 0;
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load invoices:', err);
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadInvoices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInvoices();
    }
  }

  downloadPdf(inv: InvoiceListItem): void {
    this.invoiceService.downloadInvoicePdf(inv.id, inv.invoiceNumber).subscribe({
      error: (err) => {
        console.error('Failed to download invoice PDF:', err);
        this.toastService.error('Failed to download invoice PDF. Please try again.', 'Download Failed');
      }
    });
  }

  openShareModal(inv: InvoiceListItem): void {
    this.invoiceToShare = {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      customerName: inv.customerName,
      contactNumber: inv.contactNumber,
      email: null,
      total: inv.total,
      advance: inv.advance,
      balance: inv.balance
    };
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.invoiceService.getInvoice(inv.id).subscribe({
      next: (fullInv) => {
        if (this.invoiceToShare && this.invoiceToShare.id === inv.id) {
          this.invoiceToShare = {
            ...this.invoiceToShare,
            customerId: fullInv.customerId,
            contactNumber: fullInv.contactNumber || inv.contactNumber,
            email: fullInv.email || null
          };
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      }
    });
  }

  closeShareModal(): void {
    this.invoiceToShare = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  openDeleteModal(inv: InvoiceListItem): void {
    this.invoiceToDelete = inv;
    this.isDeleting = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.invoiceToDelete = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmDeleteInvoice(): void {
    if (!this.invoiceToDelete || this.isDeleting) return;

    const target = this.invoiceToDelete;
    this.isDeleting = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.invoiceService.deleteInvoice(target.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.invoiceToDelete = null;
        this.toastService.success(`Invoice ${target.invoiceNumber} has been deleted.`, 'Invoice Deleted');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Failed to delete invoice:', err);
        this.isDeleting = false;
        this.toastService.error('Failed to delete invoice. Please try again.', 'Delete Failed');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  getStatusBadge(inv: InvoiceListItem): { label: string; class: string } {
    if (inv.balance <= 0) {
      return { label: 'Paid', class: 'status-paid' };
    }
    if (inv.advance > 0 && inv.balance > 0) {
      return { label: 'Partial', class: 'status-partial' };
    }
    return { label: 'Unpaid', class: 'status-unpaid' };
  }

  markAsPaid(inv: InvoiceListItem): void {
    if (this.markingPaidId !== null || inv.balance <= 0) return;

    this.markingPaidId = inv.id;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.invoiceService.getInvoice(inv.id).pipe(
      switchMap((fullInv) =>
        this.invoiceService.updateInvoice(inv.id, {
          customerId: fullInv.customerId,
          invoiceDate: fullInv.invoiceDate,
          ntnNumber: fullInv.ntnNumber || null,
          clientPoNumber: fullInv.clientPoNumber || null,
          advance: fullInv.total,
          notes: fullInv.notes || null,
          items: (fullInv.items || []).map(it => ({
            grNumber: it.grNumber || null,
            description: it.description,
            quantity: it.quantity,
            rate: it.rate
          }))
        })
      ),
      finalize(() => {
        this.markingPaidId = null;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updated) => {
        this.invoices = this.invoices.map(item =>
          item.id === inv.id
            ? { ...item, advance: updated?.advance ?? item.total, balance: updated?.balance ?? 0 }
            : item
        );
        this.markingPaidId = null;
        this.toastService.success(`Invoice ${inv.invoiceNumber} marked as Paid.`, 'Payment Updated');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to mark invoice as paid:', err);
        this.toastService.error('Failed to mark invoice as Paid. Please try again.', 'Update Failed');
      }
    });
  }
}

