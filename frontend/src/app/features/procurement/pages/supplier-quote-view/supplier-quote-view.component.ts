import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { SupplierQuoteService } from '../../services/supplier-quote.service';
import { SupplierQuote } from '../../models/supplier-quote.model';

@Component({
  selector: 'app-supplier-quote-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-quote-view.component.html',
  styleUrls: ['./supplier-quote-view.component.scss']
})
export class SupplierQuoteViewComponent implements OnInit {
  private quoteService = inject(SupplierQuoteService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  quote: SupplierQuote | null = null;
  loading: boolean = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadQuote(Number(idParam));
    } else {
      this.loading = false;
      this.errorMessage = 'Supplier Quote ID is missing.';
    }
  }

  loadQuote(id: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.quoteService.getQuoteById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (q) => {
        this.quote = q;
      },
      error: (err) => {
        console.error('Failed to load supplier quote:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load supplier quote details.';
      }
    });
  }
}

