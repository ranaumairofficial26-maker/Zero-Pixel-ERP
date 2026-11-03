import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { QuotationService } from '../../services/quotation.service';
import { QuotationDetails } from '../../models/quotation.models';
import { ToastService } from '../../../../core/services/toast.service';
import { QuotationSendDialogComponent } from '../../components/quotation-send-dialog/quotation-send-dialog.component';
import { QuotationApprovalDialogComponent } from '../../components/quotation-approval-dialog/quotation-approval-dialog.component';

@Component({
  selector: 'app-quotation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    QuotationSendDialogComponent,
    QuotationApprovalDialogComponent
  ],
  template: `
    <div class="quotation-details-page">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading quotation details...</span>
        </div>
      } @else if (quotation) {
        <!-- Details Header -->
        <header class="details-header">
          <div class="header-left">
            <div class="breadcrumbs">
              <a routerLink="/admin/quotations">Smart Quotations</a>
              <span>/</span>
              <span>{{ quotation.quotationNumber }}</span>
            </div>
            <div class="title-row">
              <h1 class="page-title">{{ quotation.quotationNumber }}</h1>
              <span class="rev-badge">Revision {{ quotation.activeRevision.revisionNumber }}</span>
              <span class="status-pill" [class.draft]="quotation.activeRevision.status === 'Draft'" [class.finalized]="quotation.activeRevision.status === 'Finalized'">
                {{ quotation.activeRevision.status }}
              </span>
              <span class="approval-pill" [class.approved]="latestApproval === 'Approved'" [class.rejected]="latestApproval === 'Rejected'" [class.revision]="latestApproval === 'Revision Requested'" [class.pending]="latestApproval === 'Pending'">
                {{ latestApproval }}
              </span>
              <span class="prod-type-pill" [class.in-house]="quotation.activeRevision.productionType === 'IN_HOUSE'" [class.outsourced]="quotation.activeRevision.productionType === 'OUTSOURCED'">
                {{ quotation.activeRevision.productionType === 'OUTSOURCED' ? '🚚 Outsourced Production' : '🏢 In-House Production' }}
              </span>
            </div>
          </div>

          <div class="header-actions">
            @if (quotation.activeRevision.linkedOrderId) {
              @if (quotation.activeRevision.productionType === 'OUTSOURCED') {
                <a routerLink="/admin/production/outsourced" class="btn-action order-btn">
                  🚚 View Outsourced Job
                </a>
              } @else {
                <a routerLink="/admin/production/in-house" class="btn-action order-btn">
                  🏢 View In-House Job
                </a>
              }
            }
            <!-- PDF Preview -->
            <a [routerLink]="['/admin/quotations', quotation.quotationId, 'preview']" class="btn-action preview">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              View PDF
            </a>

            <!-- Send Share Dialog -->
            <button type="button" class="btn-action send" (click)="showSendModal = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Share / Send
            </button>

            <!-- Approval Dialog -->
            <button type="button" class="btn-action approval" (click)="showApprovalModal = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Customer Decision
            </button>

            <!-- Finalize or Edit or New Revision -->
            @if (quotation.activeRevision.status === 'Draft') {
              <a [routerLink]="['/admin/quotations', quotation.quotationId, 'edit']" class="btn-action edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Draft
              </a>
              <button type="button" class="btn-primary" (click)="finalizeQuotation()">
                Finalize Quotation
              </button>
            } @else {
              <button type="button" class="btn-primary" (click)="createNewRevision()">
                Create Revision {{ quotation.activeRevision.revisionNumber + 1 }}
              </button>
            }
          </div>
        </header>

        <!-- Main Details Content -->
        <div class="details-grid">
          <!-- Left Column -->
          <div class="col-main">
            <!-- Customer & Quotation Info Grid -->
            <div class="cards-duo">
              <!-- Customer Info Card -->
              <div class="info-card">
                <div class="card-title-row">
                  <h3>Customer Snapshot</h3>
                  @if (quotation.clientId) {
                    <a [routerLink]="['/admin/customers', quotation.clientId]" class="link-profile">
                      View Profile &rarr;
                    </a>
                  }
                </div>
                <div class="info-body">
                  <div class="info-row">
                    <span class="label">Customer Name:</span>
                    <span class="val strong">{{ quotation.customerName }}</span>
                  </div>
                  @if (quotation.contactPerson) {
                    <div class="info-row">
                      <span class="label">Contact Person:</span>
                      <span class="val">{{ quotation.contactPerson }}</span>
                    </div>
                  }
                  <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="val">{{ quotation.customerPhone }}</span>
                  </div>
                  @if (quotation.customerEmail) {
                    <div class="info-row">
                      <span class="label">Email:</span>
                      <span class="val">{{ quotation.customerEmail }}</span>
                    </div>
                  }
                  @if (quotation.customerAddress) {
                    <div class="info-row">
                      <span class="label">Address:</span>
                      <span class="val">{{ quotation.customerAddress }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Metadata Card -->
              <div class="info-card">
                <div class="card-title-row">
                  <h3>Quotation Details</h3>
                </div>
                <div class="info-body">
                  <div class="info-row">
                    <span class="label">Type:</span>
                    <span class="val badge">{{ quotation.quotationType }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Production:</span>
                    <span class="val">{{ quotation.activeRevision.productionType === 'OUTSOURCED' ? 'Outsourced Production' : 'In-House Production' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Quotation Date:</span>
                    <span class="val">{{ quotation.activeRevision.quotationDate | date:'mediumDate' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Valid Until:</span>
                    <span class="val">{{ quotation.activeRevision.validUntil | date:'mediumDate' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Currency:</span>
                    <span class="val">{{ quotation.currency }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Last Updated:</span>
                    <span class="val">{{ quotation.updatedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Table Card -->
            <div class="info-card items-card">
              <div class="card-title-row">
                <h3>Quotation Items ({{ quotation.activeRevision.items.length }})</h3>
              </div>

              <div class="table-responsive">
                <table class="items-table">
                  <thead>
                    <tr>
                      <th class="col-idx">#</th>
                      <th>Product / Service</th>
                      <th>Specifications</th>
                      <th>Production</th>
                      <th class="col-num">Qty</th>
                      <th>Unit</th>
                      <th class="col-num">Rate (PKR)</th>
                      <th class="col-num">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of quotation.activeRevision.items; track item.itemId; let idx = $index) {
                      <tr>
                        <td class="col-idx">{{ idx + 1 }}</td>
                        <td>
                          <div class="product-cell">
                            <div class="prod-title-line">
                              <span class="prod-name">{{ item.productName }}</span>
                              @if (item.serviceCategory) {
                                <span class="badge-service">{{ item.serviceCategory }}</span>
                              }
                            </div>
                            @if (item.description) {
                              <span class="prod-desc">{{ item.description }}</span>
                            }
                          </div>
                        </td>
                        <td>
                          @if (item.serviceCategory) {
                            @let details = parseDetails(item.serviceDetails);
                            <div class="web-specs-box">
                              <div class="web-meta-chips">
                                <span class="chip-tech">{{ item.serviceCategory }}</span>
                                @if (item.serviceCategory === 'Website' && details?.pagesCount) {
                                  <span class="chip-pages">{{ details.pagesCount }} Pages</span>
                                }
                                @if (item.serviceCategory === 'Marketing') {
                                  @if (details?.postsCount) {
                                    <span class="chip-type">{{ details.postsCount }} Posts</span>
                                  }
                                  @if (details?.videoCount) {
                                    <span class="chip-type">{{ details.videoCount }} Videos</span>
                                  }
                                }
                              </div>
                              @if (item.description) {
                                <div class="web-spec-line">{{ item.description }}</div>
                              }
                            </div>
                          } @else {
                            <div class="specs-tags">
                              @if (item.sizeDimensions) { <span class="tag">Size: {{ item.sizeDimensions }}</span> }
                              @if (item.material) { <span class="tag">Material: {{ item.material }}</span> }
                              @if (item.gsm) { <span class="tag">GSM: {{ item.gsm }}</span> }
                              @if (item.printingColor) { <span class="tag">Color: {{ item.printingColor }}</span> }
                              @if (item.finishing) { <span class="tag">Finish: {{ item.finishing }}</span> }
                              @if (!item.sizeDimensions && !item.material && !item.gsm && !item.printingColor && !item.finishing) {
                                <span class="tag muted">Standard Specifications</span>
                              }
                            </div>
                          }
                        </td>
                        <td>
                          <span class="item-prod-badge" [class.in-house]="(item.productionType || quotation.activeRevision.productionType) === 'IN_HOUSE'" [class.outsourced]="(item.productionType || quotation.activeRevision.productionType) === 'OUTSOURCED'">
                            {{ (item.productionType || quotation.activeRevision.productionType) === 'OUTSOURCED' ? 'Outsourced' : 'In-House' }}
                          </span>
                        </td>
                        <td class="col-num">{{ item.quantity | number }}</td>
                        <td>{{ item.unit }}</td>
                        <td class="col-num">{{ item.unitPrice | number:'1.2-2' }}</td>
                        <td class="col-num total-col">{{ item.lineTotal | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Financial Summary Footer -->
              <div class="financials-bar">
                <div class="notes-preview">
                  @if (quotation.activeRevision.customerNotes) {
                    <div class="note-box">
                      <strong>Customer Notes:</strong>
                      <p>{{ quotation.activeRevision.customerNotes }}</p>
                    </div>
                  }
                </div>

                <div class="calc-box">
                  <div class="calc-row">
                    <span>Subtotal:</span>
                    <span>PKR {{ quotation.activeRevision.subtotal | number:'1.2-2' }}</span>
                  </div>
                  @if (quotation.activeRevision.discountAmount > 0) {
                    <div class="calc-row discount">
                      <span>Discount ({{ quotation.activeRevision.discountType }}):</span>
                      <span>- PKR {{ quotation.activeRevision.discountAmount | number:'1.2-2' }}</span>
                    </div>
                  }
                  @if (quotation.activeRevision.taxRate > 0) {
                    <div class="calc-row">
                      <span>Tax ({{ quotation.activeRevision.taxRate }}%):</span>
                      <span>+ PKR {{ quotation.activeRevision.taxAmount | number:'1.2-2' }}</span>
                    </div>
                  }
                  <div class="calc-row grand">
                    <span>Grand Total:</span>
                    <span>PKR {{ quotation.activeRevision.grandTotal | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes & Terms Full View -->
            @if (quotation.activeRevision.termsAndConditions) {
              <div class="info-card">
                <div class="card-title-row">
                  <h3>Terms & Conditions</h3>
                </div>
                <div class="terms-text">
                  {{ quotation.activeRevision.termsAndConditions }}
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Revisions History & Logs -->
          <div class="col-side">
            <!-- Revisions History -->
            <div class="info-card">
              <div class="card-title-row">
                <h3>Revisions History</h3>
              </div>
              <div class="revisions-list">
                @for (rev of quotation.revisions; track rev.revisionId) {
                  <div class="rev-item" [class.current]="rev.revisionId === quotation.activeRevision.revisionId" (click)="switchRevision(rev.revisionId)" title="Click to view Revision {{ rev.revisionNumber }}">
                    <div class="rev-header">
                      <span class="rev-title">Revision {{ rev.revisionNumber }}</span>
                      <span class="rev-status" [class.finalized]="rev.status === 'Finalized'">{{ rev.status }}</span>
                    </div>
                    <div class="rev-meta">
                      <span>{{ rev.quotationDate | date:'mediumDate' }}</span>
                      <span class="rev-total">PKR {{ rev.grandTotal | number:'1.0-0' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Sending Logs -->
            <div class="info-card">
              <div class="card-title-row">
                <h3>Sharing & Send Logs</h3>
                <button type="button" class="btn-link" (click)="showSendModal = true">+ Log</button>
              </div>
              <div class="logs-list">
                @for (log of quotation.activeRevision.sendLogs; track log.sendId) {
                  <div class="log-item">
                    <div class="log-top">
                      <span class="log-method">{{ log.sendMethod }}</span>
                      <span class="log-time">{{ log.markedSentAt | date:'short' }}</span>
                    </div>
                    <div class="log-recipient">{{ log.recipient }}</div>
                    @if (log.notes) {
                      <div class="log-notes">{{ log.notes }}</div>
                    }
                  </div>
                } @empty {
                  <div class="empty-logs">No sharing logs recorded yet.</div>
                }
              </div>
            </div>

            <!-- Customer Response Logs -->
            <div class="info-card">
              <div class="card-title-row">
                <h3>Decision History</h3>
                <button type="button" class="btn-link" (click)="showApprovalModal = true">+ Decision</button>
              </div>
              <div class="logs-list">
                @for (log of quotation.activeRevision.approvalLogs; track log.approvalId) {
                  <div class="log-item decision" [class.approved]="log.decision === 'Approved'" [class.rejected]="log.decision === 'Rejected'">
                    <div class="log-top">
                      <span class="decision-badge">{{ log.decision }}</span>
                      <span class="log-time">{{ log.responseAt | date:'short' }}</span>
                    </div>
                    <div class="log-recipient">Via {{ log.responseMethod }} @if (log.contactName) { ({{ log.contactName }}) }</div>
                    @if (log.notes) {
                      <div class="log-notes">{{ log.notes }}</div>
                    }
                  </div>
                } @empty {
                  <div class="empty-logs">No decision logs recorded yet.</div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        @if (showSendModal) {
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

        @if (showApprovalModal) {
          <app-quotation-approval-dialog
            [quotationNumber]="quotation.quotationNumber"
            [revisionId]="quotation.activeRevision.revisionId"
            [initialContactName]="quotation.contactPerson || quotation.customerName"
            (close)="showApprovalModal = false"
            (recorded)="onApprovalRecorded()"
          ></app-quotation-approval-dialog>
        }
      } @else {
        <div class="empty-state-card">
          <h3>Quotation Details Unavailable</h3>
          <p>The requested quotation could not be loaded or was not found.</p>
          <div class="empty-actions">
            <button type="button" class="btn-primary" (click)="loadDetails()">Retry</button>
            <a routerLink="/admin/quotations" class="btn-action preview">Back to Quotations</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quotation-details-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .loading-state {
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748B;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E2E8F0;
      border-top-color: #0099DD;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 18px 24px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #64748B;
      margin-bottom: 4px;
    }
    .breadcrumbs a {
      color: #0099DD;
      text-decoration: none;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .page-title {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .rev-badge {
      background: #E2E8F0;
      color: #334155;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-pill, .approval-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-pill.draft { background: #FEF3C7; color: #D97706; }
    .status-pill.finalized { background: #DCFCE7; color: #15803D; }
    .approval-pill.pending { background: #FEF9C3; color: #854D0E; }
    .approval-pill.approved { background: #DCFCE7; color: #16A34A; }
    .approval-pill.rejected { background: #FEE2E2; color: #DC2626; }
    .approval-pill.revision { background: #FFEDD5; color: #C2410C; }
    .prod-type-pill {
      font-size: 11.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .prod-type-pill.in-house { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
    .prod-type-pill.outsourced { background: #FAF5FF; color: #9333EA; border: 1px solid #E9D5FF; }
    .order-btn {
      background: #0284C7 !important;
      color: #fff !important;
      border-color: #0284C7 !important;
    }
    .item-prod-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .item-prod-badge.in-house { background: #F0FDF4; color: #16A34A; }
    .item-prod-badge.outsourced { background: #FAF5FF; color: #9333EA; }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 12.5px;
      font-weight: 600;
      color: #475569;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-action:hover {
      background: #F1F5F9;
      color: #0F172A;
      border-color: #94A3B8;
    }
    .btn-primary {
      background: #0099DD;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 12.5px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #0084BE;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 18px;
    }
    .col-main {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .col-side {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .cards-duo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .info-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 18px;
    }
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 8px;
    }
    .card-title-row h3 {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .link-profile, .btn-link {
      font-size: 11.5px;
      font-weight: 600;
      color: #0099DD;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
    }
    .info-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
    }
    .label {
      color: #64748B;
    }
    .val {
      color: #334155;
    }
    .val.strong {
      font-weight: 600;
      color: #0F172A;
    }
    .val.badge {
      background: #EDE9FE;
      color: #6D28D9;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .items-card {
      padding: 0;
      overflow: hidden;
    }
    .items-card .card-title-row {
      padding: 14px 18px;
      margin: 0;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .items-table th {
      background: #F8FAFC;
      padding: 9px 14px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #E2E8F0;
    }
    .items-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: top;
    }
    .col-idx { width: 30px; color: #94A3B8; }
    .col-num { text-align: right; }
    .total-col { font-weight: 700; color: #0F172A; }
    .product-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .prod-name {
      font-weight: 600;
      color: #0F172A;
    }
    .prod-desc {
      font-size: 11px;
      color: #64748B;
    }
    .specs-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tag {
      background: #F1F5F9;
      color: #475569;
      font-size: 10.5px;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .financials-bar {
      display: flex;
      justify-content: space-between;
      padding: 16px 18px;
      background: #FAFAFA;
      border-top: 1px solid #E2E8F0;
    }
    .notes-preview {
      flex: 1;
      max-width: 50%;
    }
    .note-box {
      font-size: 12px;
      color: #475569;
    }
    .note-box p {
      margin: 2px 0 0 0;
      font-size: 11.5px;
      color: #64748B;
    }
    .calc-box {
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #475569;
    }
    .calc-row.discount {
      color: #DC2626;
    }
    .calc-row.grand {
      font-size: 14px;
      font-weight: 700;
      color: #0099DD;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      margin-top: 2px;
    }
    .terms-text {
      white-space: pre-line;
      font-size: 12px;
      line-height: 1.5;
      color: #64748B;
    }
    .revisions-list, .logs-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .rev-item {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 10px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    .rev-item:hover {
      border-color: #0099DD;
      background: #F8FAFC;
    }
    .rev-item.current {
      border-color: #0099DD;
      background: #F0F9FF;
      box-shadow: 0 0 0 1px #0099DD;
    }
    .rev-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
    }
    .rev-status {
      font-size: 10px;
      background: #FEF3C7;
      color: #D97706;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .rev-status.finalized {
      background: #DCFCE7;
      color: #15803D;
    }
    .rev-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748B;
      margin-top: 4px;
    }
    .rev-total {
      font-weight: 600;
      color: #0F172A;
    }
    .log-item {
      border-left: 3px solid #0099DD;
      background: #F8FAFC;
      border-radius: 0 6px 6px 0;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .log-item.decision {
      border-left-color: #F59E0B;
    }
    .log-item.decision.approved {
      border-left-color: #10B981;
    }
    .log-item.decision.rejected {
      border-left-color: #EF4444;
    }
    .log-top {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
    }
    .log-method {
      font-weight: 600;
      color: #0F172A;
    }
    .decision-badge {
      font-weight: 700;
      color: #0F172A;
    }
    .log-time {
      font-size: 10.5px;
      color: #94A3B8;
    }
    .log-recipient {
      font-size: 11.5px;
      color: #475569;
    }
    .log-notes {
      font-size: 11px;
      color: #64748B;
      font-style: italic;
    }
    .empty-logs {
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
      padding: 10px 0;
    }
    .prod-title-line {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .badge-service {
      font-size: 10px;
      font-weight: 700;
      background: #EEF2FF;
      color: #4F46E5;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #C7D2FE;
    }
    .web-specs-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11px;
      color: #334155;
    }
    .web-meta-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 2px;
    }
    .chip-tech {
      background: #E0F2FE;
      color: #0369A1;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
    }
    .chip-type {
      background: #F1F5F9;
      color: #475569;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
    }
    .chip-pages {
      background: #FEF3C7;
      color: #B45309;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
    }
    .web-spec-line {
      line-height: 1.35;
    }
    .recurring-notice {
      color: #0284C7;
      font-weight: 600;
      background: #F0F9FF;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px dashed #BAE6FD;
      display: inline-block;
      margin-top: 2px;
    }
  `]
})
export class QuotationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  quotationId!: number;
  quotation: QuotationDetails | null = null;
  isLoading = true;

  showSendModal = false;
  showApprovalModal = false;

  get latestApproval(): string {
    const logs = this.quotation?.activeRevision.approvalLogs;
    if (logs && logs.length > 0) {
      return logs[0].decision;
    }
    return 'Pending';
  }

  parseDetails(detailsStr?: string | null): any {
    if (!detailsStr) return null;
    try {
      return typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr;
    } catch {
      return null;
    }
  }

  ngOnInit() {
    this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
  }

  loadDetails(revisionId?: number) {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.quotationService.getQuotationById(this.quotationId, revisionId).subscribe({
      next: (q) => {
        this.quotation = q;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.toastService.error(err.error?.detail || 'Failed to load quotation');
      }
    });
  }

  switchRevision(revisionId: number) {
    if (this.quotation && this.quotation.activeRevision.revisionId === revisionId) {
      return;
    }
    this.loadDetails(revisionId);
  }

  finalizeQuotation() {
    if (!confirm('Are you sure you want to finalize this quotation? Finalized revisions are locked against direct editing.')) {
      return;
    }

    this.quotationService.finalizeQuotation(this.quotationId).subscribe({
      next: (updated) => {
        this.toastService.success(`Quotation ${updated.quotationNumber} is now finalized!`);
        this.loadDetails();
      },
      error: (err) => {
        this.toastService.error(err.error?.detail || 'Failed to finalize quotation');
      }
    });
  }

  createNewRevision() {
    this.quotationService.createRevision(this.quotationId).subscribe({
      next: (updated) => {
        this.toastService.success(`Created Revision ${updated.activeRevision.revisionNumber}!`);
        this.loadDetails();
      },
      error: (err) => {
        this.toastService.error(err.error?.detail || 'Failed to create revision');
      }
    });
  }

  onSendRecorded() {
    this.showSendModal = false;
    this.loadDetails();
  }

  onApprovalRecorded() {
    this.showApprovalModal = false;
    this.loadDetails();
  }

  parseServiceDetails(details?: string): any {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }
}

