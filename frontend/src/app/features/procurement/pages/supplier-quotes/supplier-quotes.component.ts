import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierQuoteService } from '../../services/supplier-quote.service';
import { SupplierQuoteListItem } from '../../models/supplier-quote.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-supplier-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './supplier-quotes.component.html',
  styleUrls: ['./supplier-quotes.component.scss']
})
export class SupplierQuotesComponent implements OnInit {
  private quoteService = inject(SupplierQuoteService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  quotes: SupplierQuoteListItem[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  quoteToCancel: SupplierQuoteListItem | null = null;
  isCancelling: boolean = false;
  private searchTimer?: any;

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.quoteService.getQuotes(this.searchTerm, this.currentPage, this.pageSize).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.quotes = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.totalPages = res.totalPages || 0;
      },
      error: (err) => {
        console.error('Failed to load supplier quotes:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load supplier quotes from database.';
      }
    });
  }

  onSearch(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadQuotes();
    }, 250);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadQuotes();
    }
  }

  openCancelModal(q: SupplierQuoteListItem): void {
    this.quoteToCancel = q;
    this.isCancelling = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;
    this.quoteToCancel = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmCancelQuote(): void {
    if (!this.quoteToCancel || this.isCancelling) return;

    const target = this.quoteToCancel;
    this.isCancelling = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.quoteService.cancelQuote(target.id).pipe(
      finalize(() => {
        this.isCancelling = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.quoteToCancel = null;
        this.quotes = this.quotes.map(q =>
          q.id === target.id ? { ...q, status: 'Cancelled' } : q
        );
        this.toastService.success(`Supplier quote ${target.quoteNumber} has been cancelled.`, 'Quote Cancelled');
      },
      error: (err) => {
        console.error('Failed to cancel supplier quote:', err);
        this.toastService.error('Failed to cancel supplier quote. Please try again.', 'Cancel Failed');
      }
    });
  }
}
