import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuotationService } from '../../services/quotation.service';
import { QuotationDetails } from '../../models/quotation.models';
import { ToastService } from '../../../../core/services/toast.service';
import { QuotationSendDialogComponent } from '../../components/quotation-send-dialog/quotation-send-dialog.component';
import { QuotationApprovalDialogComponent } from '../../components/quotation-approval-dialog/quotation-approval-dialog.component';

@Component({
  selector: 'app-quotation-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    QuotationSendDialogComponent,
    QuotationApprovalDialogComponent
  ],
  template: `
    <div class="pdf-preview-page">
      <!-- Preview Header Toolbar -->
      <header class="preview-toolbar">
        <div class="toolbar-left">
          <a [routerLink]="['/admin/quotations', quotationId]" class="btn-back">
            &larr; Back to Quotation
          </a>
          @if (quotation) {
            <span class="preview-quote-title">
              {{ quotation.quotationNumber }} (Rev {{ quotation.activeRevision.revisionNumber }})
            </span>
          }
        </div>

        <div class="toolbar-actions">
          <button type="button" class="btn-tool" (click)="downloadPdf()" [disabled]="isDownloading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ isDownloading ? 'Downloading...' : 'Download PDF' }}
          </button>

          <button type="button" class="btn-tool" (click)="openSendDialog()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Share / Send
          </button>

          <button type="button" class="btn-tool" (click)="openApprovalDialog()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Record Decision
          </button>
        </div>
      </header>

      <!-- PDF Viewer Frame -->
      <div class="preview-frame-container">
        @if (isLoading) {
          <div class="loading-box">
            <div class="spinner"></div>
            <span>Generating high-resolution quotation PDF...</span>
          </div>
        } @else if (safePdfUrl) {
          <iframe [src]="safePdfUrl" class="pdf-iframe" title="Quotation PDF Preview"></iframe>
        } @else {
          <div class="error-box">
            <p>Could not generate PDF preview. Please try downloading directly.</p>
            <button type="button" class="btn-tool" (click)="downloadPdf()">Download PDF</button>
          </div>
        }
      </div>

      <!-- Modals -->
      @if (showSendModal && quotation) {
        <app-quotation-send-dialog
          [quotationNumber]="quotation.quotationNumber"
          [revisionId]="quotation.activeRevision.revisionId"
          [customerPhone]="quotation.customerPhone"
          [customerEmail]="quotation.customerEmail || ''"
          [customerName]="quotation.customerName"
          (close)="showSendModal = false"
          (sent)="onSendRecorded()"
        ></app-quotation-send-dialog>
      }

      @if (showApprovalModal && quotation) {
        <app-quotation-approval-dialog
          [quotationNumber]="quotation.quotationNumber"
          [revisionId]="quotation.activeRevision.revisionId"
          [initialContactName]="quotation.contactPerson || quotation.customerName"
          (close)="showApprovalModal = false"
          (recorded)="onApprovalRecorded()"
        ></app-quotation-approval-dialog>
      }
    </div>
  `,
  styles: [`
    .pdf-preview-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      height: calc(100vh - 120px);
    }
    .preview-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn-back {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      text-decoration: none;
      padding: 6px 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      background: #F8FAFC;
    }
    .preview-quote-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
    .btn-tool {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-tool:hover {
      background: #F1F5F9;
      color: #0099DD;
      border-color: #0099DD;
    }
    .preview-frame-container {
      flex: 1;
      background: #525659;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .loading-box, .error-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #F8FAFC;
      font-size: 13px;
    }
    .spinner {
      width: 34px;
      height: 34px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #0099DD;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class QuotationPreviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private quotationService = inject(QuotationService);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  quotationId!: number;
  quotation: QuotationDetails | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  private rawPdfUrl: string | null = null;
  isLoading = true;
  isDownloading = false;

  showSendModal = false;
  showApprovalModal = false;

  ngOnInit() {
    this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetailsAndPdf();
  }

  ngOnDestroy() {
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
  }

  loadDetailsAndPdf() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.quotationService.getQuotationById(this.quotationId).subscribe({
      next: (q) => {
        this.quotation = q;
        this.fetchPdfBlob();
      },
      error: async (err) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        let message = 'Failed to load quotation details';
        if (err.error instanceof Blob) {
          try {
            const errJson = JSON.parse(await err.error.text());
            message = errJson.detail || errJson.title || message;
          } catch {}
        }
        this.toastService.error(message);
      }
    });
  }

  fetchPdfBlob() {
    this.isLoading = true;
    this.cdr.markForCheck();
    const revId = this.quotation?.activeRevision?.revisionId;
    this.quotationService.getPdfBlob(this.quotationId, revId, false).subscribe({
      next: (blob) => {
        if (this.rawPdfUrl) {
          URL.revokeObjectURL(this.rawPdfUrl);
        }
        this.rawPdfUrl = URL.createObjectURL(blob);
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: async (err) => {
        this.isLoading = false;
        this.safePdfUrl = null;
        this.cdr.markForCheck();
        let message = 'Failed to generate PDF document';
        if (err.error instanceof Blob) {
          try {
            const errJson = JSON.parse(await err.error.text());
            message = errJson.detail || errJson.title || message;
          } catch {}
        }
        this.toastService.error(message);
      }
    });
  }

  downloadPdf() {
    if (!this.quotation || this.isDownloading) return;
    this.isDownloading = true;
    this.cdr.markForCheck();
    const revId = this.quotation.activeRevision.revisionId;
    this.quotationService.getPdfBlob(this.quotationId, revId, true).subscribe({
      next: (blob) => {
        this.isDownloading = false;
        this.cdr.markForCheck();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${this.quotation!.quotationNumber}_Rev${this.quotation!.activeRevision.revisionNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        this.toastService.success('Quotation PDF downloaded successfully');
      },
      error: async (err) => {
        this.isDownloading = false;
        this.cdr.markForCheck();
        let message = 'Failed to download PDF';
        if (err.error instanceof Blob) {
          try {
            const errJson = JSON.parse(await err.error.text());
            message = errJson.detail || errJson.title || message;
          } catch {}
        }
        this.toastService.error(message);
      }
    });
  }

  openSendDialog() {
    this.showSendModal = true;
  }

  openApprovalDialog() {
    this.showApprovalModal = true;
  }

  onSendRecorded() {
    this.showSendModal = false;
    this.loadDetailsAndPdf();
  }

  onApprovalRecorded() {
    this.showApprovalModal = false;
    this.loadDetailsAndPdf();
  }
}

