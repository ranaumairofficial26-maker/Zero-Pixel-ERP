import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-quotation-send-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-left">
            <div class="icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0099DD" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <div>
              <h3 class="modal-title">Record Quotation Sharing</h3>
              <p class="modal-subtitle">Log that Quotation #{{ quotationNumber }} was shared with the client</p>
            </div>
          </div>
          <button type="button" class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Send Method</label>
            <div class="method-grid">
              <label class="method-card" [class.selected]="sendMethod === 'WhatsApp'">
                <input type="radio" name="sendMethod" [(ngModel)]="sendMethod" value="WhatsApp" (change)="onMethodChange()" />
                <span class="method-name">WhatsApp</span>
              </label>
              <label class="method-card" [class.selected]="sendMethod === 'Email'">
                <input type="radio" name="sendMethod" [(ngModel)]="sendMethod" value="Email" (change)="onMethodChange()" />
                <span class="method-name">Email</span>
              </label>
              <label class="method-card" [class.selected]="sendMethod === 'Manual'">
                <input type="radio" name="sendMethod" [(ngModel)]="sendMethod" value="Manual" (change)="onMethodChange()" />
                <span class="method-name">In-Person / Physical</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Recipient (Phone or Email) <span class="required">*</span></label>
            <input type="text" [(ngModel)]="recipient" class="form-input" placeholder="e.g. +92 300 1234567 or email@domain.com" />
          </div>

          @if (sendMethod === 'WhatsApp' && recipient) {
            <div class="whatsapp-helper">
              <div class="helper-text">
                Quick Open WhatsApp Web/App with pre-filled message:
              </div>
              <a [href]="getWhatsAppUrl()" target="_blank" class="btn-whatsapp-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                Open WhatsApp Chat
              </a>
            </div>
          }

          <div class="form-group">
            <label class="form-label">Internal Notes (Optional)</label>
            <textarea [(ngModel)]="notes" rows="2" class="form-textarea" placeholder="Add any details about how it was communicated..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" (click)="close.emit()">Cancel</button>
          <button type="button" class="btn-primary" [disabled]="!recipient || isSubmitting" (click)="submit()">
            @if (isSubmitting) {
              Recording...
            } @else {
              Mark as Sent
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-container {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 22px;
      border-bottom: 1px solid #E2E8F0;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #F0F9FF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      font-size: 16px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .modal-subtitle {
      font-size: 12px;
      color: #64748B;
      margin: 2px 0 0 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      color: #94A3B8;
      cursor: pointer;
    }
    .modal-body {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
    .required {
      color: #EF4444;
    }
    .method-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .method-card {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .method-card input {
      display: none;
    }
    .method-card.selected {
      border-color: #0099DD;
      background: #F0F9FF;
      color: #0099DD;
      font-weight: 600;
    }
    .method-name {
      font-size: 12px;
    }
    .form-input, .form-textarea {
      width: 100%;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
    }
    .form-input:focus, .form-textarea:focus {
      border-color: #0099DD;
    }
    .whatsapp-helper {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .helper-text {
      font-size: 11px;
      color: #166534;
      font-weight: 500;
    }
    .btn-whatsapp-link {
      background: #25D366;
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .modal-footer {
      padding: 14px 22px;
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-secondary {
      background: #fff;
      border: 1px solid #CBD5E1;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .btn-primary {
      background: #0099DD;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class QuotationSendDialogComponent {
  @Input() quotationNumber: string = '';
  @Input() revisionId: number = 0;
  @Input() customerPhone: string = '';
  @Input() customerEmail: string = '';
  @Input() customerName: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() sent = new EventEmitter<void>();

  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);

  sendMethod: string = 'WhatsApp';
  recipient: string = '';
  notes: string = '';
  isSubmitting = false;

  ngOnInit() {
    this.recipient = this.customerPhone || '';
  }

  onMethodChange() {
    if (this.sendMethod === 'WhatsApp') {
      this.recipient = this.customerPhone || '';
    } else if (this.sendMethod === 'Email') {
      this.recipient = this.customerEmail || '';
    }
  }

  getWhatsAppUrl(): string {
    const cleanPhone = (this.recipient || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${this.customerName}, here is your quotation #${this.quotationNumber} from Zero Pixel. Please review and let us know if you approve or require any revisions.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  submit() {
    if (!this.recipient || !this.revisionId) return;
    this.isSubmitting = true;

    this.quotationService.recordSendLog({
      revisionId: this.revisionId,
      sendMethod: this.sendMethod,
      recipient: this.recipient,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success(`Quotation sharing recorded via ${this.sendMethod}`);
        this.sent.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to record send log');
      }
    });
  }
}
