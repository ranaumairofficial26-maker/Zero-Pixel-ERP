import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/auth/auth.service';

export interface ShareableInvoice {
  id: number;
  customerId?: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  contactNumber?: string | null;
  email?: string | null;
  total: number;
  advance: number;
  balance: number;
}

@Component({
  selector: 'app-invoice-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="share-modal-backdrop" *ngIf="invoice" (click)="close.emit()">
      <div class="share-modal-card" (click)="$event.stopPropagation()">
        <div class="modal-top-accent"></div>

        <div class="modal-header">
          <div class="header-left">
            <div class="header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <div>
              <h3 class="modal-title">Share Invoice PDF</h3>
              <p class="modal-subtitle">
                {{ invoice.invoiceNumber }}.pdf &bull; {{ invoice.customerName }}
              </p>
            </div>
          </div>

          <button type="button" class="btn-close" (click)="close.emit()" title="Close" [disabled]="isSharing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Method Tabs -->
          <div class="method-tabs">
            <button
              type="button"
              class="method-tab whatsapp-tab"
              [class.active]="method === 'whatsapp'"
              (click)="method = 'whatsapp'"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              WhatsApp
            </button>

            <button
              type="button"
              class="method-tab email-tab"
              [class.active]="method === 'email'"
              (click)="method = 'email'"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email
            </button>
          </div>

          <!-- WhatsApp Fields -->
          <div class="form-group" *ngIf="method === 'whatsapp'">
            <label class="form-label">Customer WhatsApp Number</label>
            <input
              type="text"
              [(ngModel)]="phone"
              class="form-input"
              placeholder="e.g. 03001234567 or +92 300 1234567"
            />
            <span class="field-hint">Invoice PDF will be prepared and WhatsApp will open for this contact.</span>
          </div>

          <!-- Email Fields -->
          <ng-container *ngIf="method === 'email'">
            <div class="form-group">
              <label class="form-label">Recipient Email Address</label>
              <input
                type="email"
                [(ngModel)]="email"
                class="form-input"
                placeholder="client@company.com"
              />
              <span class="field-hint">From: <strong>{{ senderEmail }}</strong> (Settings se change kar sakte hain)</span>
            </div>

            <div class="form-group">
              <label class="form-label">Email Subject</label>
              <input
                type="text"
                [(ngModel)]="subject"
                class="form-input"
              />
            </div>
          </ng-container>

          <!-- PDF File Preview Pill -->
          <div class="pdf-file-pill">
            <div class="pdf-file-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span><strong>{{ invoice.invoiceNumber }}.pdf</strong></span>
            </div>
            <span class="pdf-ready-badge">PDF Only</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" (click)="close.emit()" [disabled]="isSharing">Close</button>

          <button
            *ngIf="method === 'whatsapp'"
            type="button"
            class="btn-send btn-whatsapp"
            (click)="sharePdf('whatsapp')"
            [disabled]="isSharing"
          >
            {{ isSharing ? 'Preparing PDF...' : 'Send PDF on WhatsApp' }}
          </button>

          <button
            *ngIf="method === 'email'"
            type="button"
            class="btn-send btn-email"
            (click)="sharePdf('email')"
            [disabled]="isSharing"
          >
            {{ isSharing ? 'Preparing PDF...' : 'Send PDF via Email' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .share-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .share-modal-card {
      position: relative;
      width: 100%;
      max-width: 460px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
      overflow: hidden;
    }

    .modal-top-accent {
      height: 4px;
      background: linear-gradient(90deg, #0284c7, #10b981);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.35rem;
      border-bottom: 1px solid #e2e8f0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .header-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #e0f2fe;
        color: #0284c7;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .modal-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
      }

      .modal-subtitle {
        margin: 0.15rem 0 0;
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 600;
      }

      .btn-close {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
      }
    }

    .modal-body {
      padding: 1.2rem 1.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
    }

    .method-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;

      .method-tab {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-radius: 10px;
        border: 1.5px solid #e2e8f0;
        background: #f8fafc;
        color: #475569;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;

        &.whatsapp-tab.active {
          background: #dcfce7;
          border-color: #16a34a;
          color: #15803d;
        }

        &.email-tab.active {
          background: #e0f2fe;
          border-color: #0284c7;
          color: #0369a1;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .form-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: #334155;
      }

      .form-input {
        width: 100%;
        padding: 0.55rem 0.8rem;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.85rem;
        color: #0f172a;
        background: #ffffff;
        outline: none;
        box-sizing: border-box;

        &:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.14);
        }
      }

      .field-hint {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    .pdf-file-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.65rem 0.9rem;

      .pdf-file-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.84rem;
        color: #0f172a;
      }

      .pdf-ready-badge {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #fee2e2;
        color: #b91c1c;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.65rem;
      padding: 0.95rem 1.35rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;

      .btn-cancel {
        padding: 0.55rem 0.95rem;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #334155;
        font-size: 0.825rem;
        font-weight: 700;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
        }
      }

      .btn-send {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.55rem 1.15rem;
        border-radius: 8px;
        border: none;
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;

        &:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        &.btn-whatsapp {
          background: #16a34a;
          &:hover:not(:disabled) { background: #15803d; }
        }

        &.btn-email {
          background: #0284c7;
          &:hover:not(:disabled) { background: #0369a1; }
        }
      }
    }

      `]
})
export class InvoiceShareModalComponent implements OnChanges {
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  get senderEmail(): string {
    return this.authService.currentUser()?.email || 'naveed@zeropixel.pk';
  }

  @Input() invoice: ShareableInvoice | null = null;
  @Output() close = new EventEmitter<void>();

  method: 'whatsapp' | 'email' = 'whatsapp';
  phone: string = '';
  email: string = '';
  subject: string = '';
  isSharing: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] && this.invoice) {
      this.phone = this.invoice.contactNumber || '';
      this.email = this.invoice.email || '';
      this.subject = `Invoice ${this.invoice.invoiceNumber} - Zero Pixel`;

      if (!this.email && this.invoice.customerId) {
        this.customerService.getCustomerById(this.invoice.customerId).subscribe({
          next: (cust) => {
            if (!this.email && cust?.email) {
              this.email = cust.email;
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            }
          }
        });
      }
    }
  }

  private formatWhatsAppDigits(raw: string): string {
    let digits = (raw || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    if (digits.startsWith('03') && digits.length === 11) {
      digits = '92' + digits.substring(1);
    } else if (digits.startsWith('0') && digits.length >= 10) {
      digits = '92' + digits.substring(1);
    }
    return digits;
  }

  async sharePdf(channel: 'whatsapp' | 'email'): Promise<void> {
    if (!this.invoice || this.isSharing) return;
    this.isSharing = true;

    try {
      const blob = await firstValueFrom(this.invoiceService.getInvoicePdfBlob(this.invoice.id, true));
      const fileName = `${this.invoice.invoiceNumber.trim()}.pdf`;
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      // Try native Web Share API with the PDF file first (works on supported devices/browsers)
      const nav: any = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && typeof nav.share === 'function' && (!nav.canShare || nav.canShare({ files: [pdfFile] }))) {
        try {
          await nav.share({
            title: this.subject || fileName,
            files: [pdfFile]
          });
          this.isSharing = false;
          this.toastService.success(`${fileName} shared successfully.`, 'Shared');
          this.close.emit();
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            this.isSharing = false;
            return;
          }
          // Fall through to download + open WhatsApp/Email
        }
      }

      // Download the PDF so the user can attach it directly
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      if (channel === 'whatsapp') {
        const digits = this.formatWhatsAppDigits(this.phone);
        const waUrl = digits ? `https://wa.me/${digits}` : `https://wa.me/`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        this.toastService.info(`${fileName} downloaded — attach it in WhatsApp.`, 'PDF Ready');
      } else {
        const to = encodeURIComponent((this.email || '').trim());
        const sub = encodeURIComponent(this.subject || `Invoice ${this.invoice.invoiceNumber}`);
        window.location.href = `mailto:${to}?subject=${sub}`;
        this.toastService.info(`${fileName} downloaded — attach it in your email.`, 'PDF Ready');
      }
    } catch {
      this.toastService.error('Failed to prepare invoice PDF for sharing.', 'Share Failed');
    } finally {
      this.isSharing = false;
    }
  }
}
