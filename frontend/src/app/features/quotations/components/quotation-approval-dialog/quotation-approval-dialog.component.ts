import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-quotation-approval-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-left">
            <div class="icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 class="modal-title">Record Customer Response</h3>
              <p class="modal-subtitle">Log external customer response for Quotation #{{ quotationNumber }}</p>
            </div>
          </div>
          <button type="button" class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Customer Decision <span class="required">*</span></label>
            <div class="decision-grid">
              <label class="decision-card approved" [class.selected]="decision === 'Approved'">
                <input type="radio" name="decision" [(ngModel)]="decision" value="Approved" />
                <span class="decision-icon">✓</span>
                <span class="decision-title">Approved</span>
                <span class="decision-desc">Ready for future order</span>
              </label>

              <label class="decision-card revision" [class.selected]="decision === 'Revision Requested'">
                <input type="radio" name="decision" [(ngModel)]="decision" value="Revision Requested" />
                <span class="decision-icon">↻</span>
                <span class="decision-title">Revision</span>
                <span class="decision-desc">Changes requested</span>
              </label>

              <label class="decision-card rejected" [class.selected]="decision === 'Rejected'">
                <input type="radio" name="decision" [(ngModel)]="decision" value="Rejected" />
                <span class="decision-icon">✕</span>
                <span class="decision-title">Rejected</span>
                <span class="decision-desc">Client declined</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Communication Channel</label>
            <select [(ngModel)]="responseMethod" class="form-select">
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
              <option value="Office Visit">Office Visit</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Contact Person Name</label>
            <input type="text" [(ngModel)]="contactName" class="form-input" placeholder="e.g. Mr. Tariq" />
          </div>

          <div class="form-group">
            <label class="form-label">Notes / Reasons / Feedback</label>
            <textarea [(ngModel)]="notes" rows="3" class="form-textarea" placeholder="Detail the customer feedback or conditions..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" (click)="close.emit()">Cancel</button>
          <button type="button" class="btn-primary" [disabled]="!decision || isSubmitting" (click)="submit()">
            @if (isSubmitting) {
              Recording...
            } @else {
              Save Response
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
      max-width: 500px;
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
      background: #ECFDF5;
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
    .decision-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .decision-card {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      transition: all 0.15s;
    }
    .decision-card input {
      display: none;
    }
    .decision-icon {
      font-size: 18px;
      font-weight: 800;
    }
    .decision-title {
      font-size: 13px;
      font-weight: 700;
    }
    .decision-desc {
      font-size: 10px;
      color: #64748B;
    }
    .decision-card.approved.selected {
      border-color: #10B981;
      background: #ECFDF5;
      color: #065F46;
    }
    .decision-card.revision.selected {
      border-color: #F59E0B;
      background: #FFFBEB;
      color: #92400E;
    }
    .decision-card.rejected.selected {
      border-color: #EF4444;
      background: #FEF2F2;
      color: #991B1B;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #0099DD;
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
export class QuotationApprovalDialogComponent {
  @Input() quotationNumber: string = '';
  @Input() revisionId: number = 0;
  @Input() initialContactName: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() recorded = new EventEmitter<void>();

  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);

  decision: string = 'Approved';
  responseMethod: string = 'WhatsApp';
  contactName: string = '';
  notes: string = '';
  isSubmitting = false;

  ngOnInit() {
    this.contactName = this.initialContactName || '';
  }

  submit() {
    if (!this.decision || !this.revisionId) return;
    this.isSubmitting = true;

    this.quotationService.recordApprovalLog({
      revisionId: this.revisionId,
      decision: this.decision,
      responseMethod: this.responseMethod,
      contactName: this.contactName,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success(`Customer decision recorded as "${this.decision}"`);
        this.recorded.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to record decision');
      }
    });
  }
}
