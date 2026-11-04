import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize, timeout } from 'rxjs';
import { QuotationService } from '../../services/quotation.service';
import { QuotationListItem, QuotationSummary } from '../../models/quotation.models';
import { ToastService } from '../../../../core/services/toast.service';
import { QuotationSendDialogComponent } from '../../components/quotation-send-dialog/quotation-send-dialog.component';
import { QuotationApprovalDialogComponent } from '../../components/quotation-approval-dialog/quotation-approval-dialog.component';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    QuotationSendDialogComponent,
    QuotationApprovalDialogComponent
  ],
  template: `
    <div class="quotations-page">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Smart Quotations</h1>
          <p class="page-subtitle">Manage customer quotations, multi-revisions, and pricing.</p>
        </div>
        <div class="header-actions">
          <a [routerLink]="['/admin/quotations/create']" [queryParams]="selectedType() === 'Digital Marketing' ? { type: 'Digital Marketing' } : null" class="btn-create">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create New Quotation
          </a>
        </div>
      </header>

      <!-- Dashboard Summary Cards -->
      <section class="summary-cards-grid">
        <div class="summary-card">
          <div class="card-icon total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="card-body">
            <span class="card-count">{{ summary()?.totalQuotations ?? 0 }}</span>
            <span class="card-label">Total Quotations</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon draft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div class="card-body">
            <span class="card-count">{{ summary()?.draftQuotations ?? 0 }}</span>
            <span class="card-label">Drafts</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon finalized">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="card-body">
            <span class="card-count">{{ summary()?.finalizedQuotations ?? 0 }}</span>
            <span class="card-label">Finalized</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon approved">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div class="card-body">
            <span class="card-count">{{ summary()?.approvedQuotations ?? 0 }}</span>
            <span class="card-label">Approved</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon expired">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <div class="card-body">
            <span class="card-count">{{ summary()?.expiredQuotations ?? 0 }}</span>
            <span class="card-label">Expired</span>
          </div>
        </div>
      </section>

      <!-- Filter & Search Toolbar -->
      <section class="toolbar-section">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            class="toolbar-search-input"
            placeholder="Search quotation #, customer name, or product..."
          />
          @if (searchQuery()) {
            <button type="button" class="btn-clear-search" (click)="clearSearch()">&times;</button>
          }
        </div>

        <div class="filters-group">
          <!-- Type Filter -->
          <select [ngModel]="selectedType()" (ngModelChange)="onTypeChange($event)" class="filter-select">
            <option value="all">All Types</option>
            <option value="Printing">Printing</option>
            <option value="Digital Marketing">Digital Marketing</option>
          </select>

          <!-- Status Filter -->
          <select [ngModel]="selectedStatus()" (ngModelChange)="onStatusChange($event)" class="filter-select">
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Finalized">Finalized</option>
          </select>

          <!-- Approval Filter -->
          <select [ngModel]="selectedApproval()" (ngModelChange)="onApprovalChange($event)" class="filter-select">
            <option value="all">All Approvals</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Revision Requested">Revision Req</option>
            <option value="Rejected">Rejected</option>
          </select>

          <!-- Sending Filter -->
          <select [ngModel]="selectedSending()" (ngModelChange)="onSendingChange($event)" class="filter-select">
            <option value="all">All Sending</option>
            <option value="Not Sent">Not Sent</option>
            <option value="Sent">Sent</option>
          </select>
        </div>
      </section>

      <!-- Quotations Table Card -->
      <div class="table-card">
        <!-- State 1: Active Loading Overlay -->
        @if (isLoading()) {
          <div class="table-loading-overlay">
            <div class="spinner"></div>
            <span>Loading quotations...</span>
          </div>
        }

        <!-- State 4: Error State with Retry Button -->
        @if (!isLoading() && errorMessage()) {
          <div class="table-error-state">
            <div class="error-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 class="error-title">Unable to load quotations</h3>
            <p class="error-desc">{{ errorMessage() }}</p>
            <button type="button" class="btn-retry" (click)="loadQuotations()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              Retry
            </button>
          </div>
        }

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-num" (click)="setSort('quotation_number')">
                  Quote #
                  <span class="sort-icon">{{ getSortIcon('quotation_number') }}</span>
                </th>
                <th>Rev</th>
                <th>Type</th>
                <th (click)="setSort('date')">
                  Date
                  <span class="sort-icon">{{ getSortIcon('date') }}</span>
                </th>
                <th (click)="setSort('customer')">
                  Customer
                  <span class="sort-icon">{{ getSortIcon('customer') }}</span>
                </th>
                <th>Product Summary</th>
                <th class="col-amount" (click)="setSort('amount')">
                  Grand Total
                  <span class="sort-icon">{{ getSortIcon('amount') }}</span>
                </th>
                <th>Status</th>
                <th>Sending</th>
                <th>Approval</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- State 2: Success with Data -->
              @for (quote of quotations(); track quote.quotationId) {
                <tr class="table-row">
                  <!-- Quotation # -->
                  <td class="col-num">
                    <a [routerLink]="['/admin/quotations', quote.quotationId]" class="quote-link">
                      {{ quote.quotationNumber }}
                    </a>
                  </td>

                  <!-- Revision -->
                  <td>
                    <span class="rev-badge">Rev {{ quote.revisionNumber }}</span>
                  </td>

                  <!-- Type -->
                  <td>
                    <span class="type-badge" [class.printing]="quote.quotationType === 'Printing'" [class.service]="quote.quotationType === 'Service'">
                      {{ quote.quotationType }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="col-date">
                    <span class="primary-date">{{ quote.quotationDate | date:'mediumDate' }}</span>
                    <span class="sub-date">Valid: {{ quote.validUntil | date:'shortDate' }}</span>
                  </td>

                  <!-- Customer -->
                  <td>
                    <div class="customer-cell">
                      <span class="customer-name">{{ quote.customerName }}</span>
                      <span class="customer-phone">{{ quote.customerPhone }}</span>
                    </div>
                  </td>

                  <!-- Product Summary -->
                  <td class="col-summary">
                    <span class="product-text" [title]="quote.productSummary">
                      {{ quote.productSummary || 'No items listed' }}
                    </span>
                  </td>

                  <!-- Grand Total -->
                  <td class="col-amount">
                    <span class="amount-val">{{ quote.currency }} {{ quote.grandTotal | number:'1.2-2' }}</span>
                  </td>

                  <!-- Quotation Status -->
                  <td>
                    <span class="status-pill" [class.draft]="quote.status === 'Draft'" [class.finalized]="quote.status === 'Finalized'">
                      {{ quote.status }}
                    </span>
                  </td>

                  <!-- Sending Status -->
                  <td>
                    <span class="sending-pill" [class.sent]="quote.sendingStatus !== 'Not Sent'">
                      {{ quote.sendingStatus }}
                    </span>
                  </td>

                  <!-- Approval Status -->
                  <td>
                    <span class="approval-pill" [class.approved]="quote.approvalStatus === 'Approved'" [class.rejected]="quote.approvalStatus === 'Rejected'" [class.revision]="quote.approvalStatus === 'Revision Requested'" [class.pending]="quote.approvalStatus === 'Pending'">
                      {{ quote.approvalStatus }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="col-actions">
                    <div class="action-buttons">
                      @if (quote.status === 'Draft') {
                        <a [routerLink]="['/admin/quotations', quote.quotationId, 'edit']" class="btn-action edit" title="Edit Draft">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </a>
                      } @else {
                        <a [routerLink]="['/admin/quotations', quote.quotationId]" class="btn-action view" title="View Details">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </a>
                      }

                      <a [routerLink]="['/admin/quotations', quote.quotationId, 'preview']" class="btn-action preview" title="View PDF">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      </a>

                      <button type="button" class="btn-action send" (click)="openSendDialog(quote)" title="Record Send">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </button>

                      <button type="button" class="btn-action approval" (click)="openApprovalDialog(quote)" title="Record Approval Decision">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </button>

                      <button type="button" class="btn-action delete" (click)="confirmDelete(quote)" title="Delete Quotation">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <!-- State 3: Success with No Data -->
                @if (!isLoading() && !errorMessage()) {
                  <tr>
                    <td colspan="11" class="empty-state-cell">
                      <div class="empty-state">
                        <div class="empty-icon">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <h3>No Quotations Found</h3>
                        <p>There are no quotations matching your current filters or search term.</p>
                        <a routerLink="/admin/quotations/create" class="btn-create-sm">Create Quotation</a>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Section -->
        <div class="pagination-footer">
          <div class="page-size-selector">
            <label>Show</label>
            <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)" class="page-select">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
            <label>per page</label>
            <span class="total-indicator">Total: {{ totalCount() }} quotations</span>
          </div>

          <div class="pagination-controls">
            <button
              type="button"
              class="btn-page"
              [disabled]="currentPage() <= 1"
              (click)="goToPage(currentPage() - 1)"
            >
              Previous
            </button>
            <span class="page-current">Page {{ currentPage() }} of {{ totalPages() || 1 }}</span>
            <button
              type="button"
              class="btn-page"
              [disabled]="currentPage() >= totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modals -->
      @if (activeSendQuote) {
        <app-quotation-send-dialog
          [quotationNumber]="activeSendQuote.quotationNumber"
          [revisionId]="activeSendQuote.revisionId"
          [customerPhone]="activeSendQuote.customerPhone"
          [customerName]="activeSendQuote.customerName"
          (close)="activeSendQuote = null"
          (sent)="onSendRecorded()"
        ></app-quotation-send-dialog>
      }

      @if (activeApprovalQuote) {
        <app-quotation-approval-dialog
          [quotationNumber]="activeApprovalQuote.quotationNumber"
          [revisionId]="activeApprovalQuote.revisionId"
          [initialContactName]="activeApprovalQuote.contactPerson || activeApprovalQuote.customerName"
          (close)="activeApprovalQuote = null"
          (recorded)="onApprovalRecorded()"
        ></app-quotation-approval-dialog>
      }
    </div>
  `,
  styles: [`
    .quotations-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 18px 24px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .page-title {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .page-subtitle {
      font-size: 13px;
      color: #64748B;
      margin: 3px 0 0 0;
    }
    .btn-create {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0099DD;
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      padding: 9px 18px;
      border-radius: 7px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn-create:hover {
      background: #0084BE;
    }
    .summary-cards-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }
    .summary-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon.total { background: #F0F9FF; color: #0284C7; }
    .card-icon.draft { background: #FEF3C7; color: #D97706; }
    .card-icon.finalized { background: #ECFDF5; color: #059669; }
    .card-icon.approved { background: #DCFCE7; color: #16A34A; }
    .card-icon.expired { background: #FEE2E2; color: #DC2626; }
    .card-body {
      display: flex;
      flex-direction: column;
    }
    .card-count {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.2;
    }
    .card-label {
      font-size: 12px;
      color: #64748B;
      font-weight: 500;
    }
    .toolbar-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: #fff;
      padding: 12px 18px;
      border-radius: 9px;
      border: 1px solid #E2E8F0;
    }
    .search-box {
      position: relative;
      flex: 1;
      max-width: 420px;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: #94A3B8;
      pointer-events: none;
    }
    .toolbar-search-input {
      width: 100%;
      padding: 8px 32px 8px 36px;
      border: 1px solid #CBD5E1;
      border-radius: 7px;
      font-size: 13px;
      outline: none;
    }
    .toolbar-search-input:focus {
      border-color: #0099DD;
    }
    .btn-clear-search {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      font-size: 18px;
      color: #94A3B8;
      cursor: pointer;
    }
    .filters-group {
      display: flex;
      gap: 8px;
    }
    .filter-select {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 12px;
      color: #334155;
      background: #fff;
      outline: none;
    }
    .table-card {
      position: relative;
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
      min-height: 250px;
    }
    .table-loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(1px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 10;
    }
    .table-error-state {
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 8px;
    }
    .error-title {
      font-size: 15px;
      font-weight: 700;
      color: #DC2626;
      margin: 4px 0 0 0;
    }
    .error-desc {
      font-size: 12.5px;
      color: #64748B;
      margin: 0;
      max-width: 400px;
    }
    .btn-retry {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0099DD;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 7px 14px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-retry:hover {
      background: #0084BE;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #E2E8F0;
      border-top-color: #0099DD;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      text-align: left;
    }
    .data-table th {
      background: #F8FAFC;
      padding: 10px 12px;
      color: #475569;
      font-weight: 600;
      border-bottom: 1px solid #E2E8F0;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }
    .data-table th:hover {
      color: #0099DD;
    }
    .sort-icon {
      margin-left: 4px;
      font-size: 11px;
    }
    .table-row {
      border-bottom: 1px solid #F1F5F9;
      transition: background 0.12s;
    }
    .table-row:hover {
      background: #F8FAFC;
    }
    .data-table td {
      padding: 10px 12px;
      color: #334155;
      vertical-align: middle;
    }
    .quote-link {
      font-weight: 700;
      color: #0099DD;
      text-decoration: none;
    }
    .quote-link:hover {
      text-decoration: underline;
    }
    .rev-badge {
      display: inline-block;
      background: #E2E8F0;
      color: #475569;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .type-badge.printing { background: #EDE9FE; color: #6D28D9; }
    .type-badge.service { background: #FEF3C7; color: #B45309; }
    .col-date {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .primary-date {
      font-weight: 600;
      color: #0F172A;
    }
    .sub-date {
      font-size: 10.5px;
      color: #94A3B8;
    }
    .customer-cell {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .customer-name {
      font-weight: 600;
      color: #0F172A;
    }
    .customer-phone {
      font-size: 11px;
      color: #64748B;
    }
    .col-summary {
      max-width: 180px;
    }
    .product-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #475569;
    }
    .col-amount {
      text-align: right;
    }
    .amount-val {
      font-weight: 700;
      color: #0F172A;
    }
    .status-pill, .sending-pill, .approval-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-pill.draft { background: #FEF3C7; color: #D97706; }
    .status-pill.finalized { background: #DCFCE7; color: #15803D; }
    .sending-pill { background: #F1F5F9; color: #64748B; }
    .sending-pill.sent { background: #E0E7FF; color: #4338CA; }
    .approval-pill.pending { background: #FEF9C3; color: #854D0E; }
    .approval-pill.approved { background: #DCFCE7; color: #16A34A; }
    .approval-pill.rejected { background: #FEE2E2; color: #DC2626; }
    .approval-pill.revision { background: #FFEDD5; color: #C2410C; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .btn-action {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      color: #475569;
      border-radius: 5px;
      padding: 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-action:hover {
      background: #0099DD;
      color: #fff;
      border-color: #0099DD;
    }
    .btn-action.delete:hover {
      background: #EF4444;
      border-color: #EF4444;
      color: #fff;
    }
    .empty-state-cell {
      padding: 40px !important;
      text-align: center;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .empty-state h3 {
      font-size: 15px;
      font-weight: 700;
      color: #334155;
      margin: 8px 0 0 0;
    }
    .empty-state p {
      font-size: 12px;
      color: #64748B;
      margin: 0;
    }
    .btn-create-sm {
      margin-top: 10px;
      background: #0099DD;
      color: #fff;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
    }
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      font-size: 12px;
      color: #64748B;
    }
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .page-select {
      border: 1px solid #CBD5E1;
      border-radius: 5px;
      padding: 3px 6px;
      font-size: 12px;
      background: #fff;
    }
    .total-indicator {
      margin-left: 14px;
      font-weight: 500;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-page {
      background: #fff;
      border: 1px solid #CBD5E1;
      border-radius: 5px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-page:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .page-current {
      font-weight: 600;
      color: #0F172A;
    }
    @media (max-width: 1024px) {
      .summary-cards-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* ========================================================
       DARK MODE OVERRIDES (FULL COMPREHENSIVE COVERAGE)
       ======================================================== */
    :host-context(html.dark-mode),
    :host-context(body.dark-mode),
    :host-context(.dark-mode) {
      .page-header {
        background: #111827;
        border-color: #1f293d;
      }
      .page-title {
        color: #f8fafc;
      }
      .page-subtitle {
        color: #94a3b8;
      }

      .summary-card {
        background: #111827;
        border-color: #1f293d;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
      .summary-card:hover {
        background: #162032;
        border-color: #2a374f;
      }
      .card-count {
        color: #ffffff;
      }
      .card-label {
        color: #94a3b8;
      }

      .card-icon.total { background: rgba(2, 132, 199, 0.15); color: #38bdf8; }
      .card-icon.draft { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
      .card-icon.finalized { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      .card-icon.approved { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
      .card-icon.expired { background: rgba(239, 68, 68, 0.15); color: #f87171; }

      .toolbar-section {
        background: #111827;
        border-color: #1f293d;
      }
      .toolbar-search-input {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;
      }
      .toolbar-search-input:focus {
        border-color: #00adef;
      }
      .filter-select {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;
      }

      .table-card {
        background: #111827;
        border-color: #1f293d;
      }
      .data-table th {
        background: #0d1424;
        color: #94a3b8;
        border-bottom-color: #1f293d;
      }
      .data-table th:hover {
        color: #38bdf8;
      }
      .data-table td {
        color: #e2e8f0;
        border-bottom-color: #1f293d;
      }
      .table-row {
        border-bottom-color: #1f293d;
      }
      .table-row:hover {
        background: #162032;
      }

      .quote-link {
        color: #38bdf8;
        font-weight: 700;
      }
      .quote-link:hover {
        color: #7dd3fc;
      }

      .rev-badge {
        background: #1e293b;
        color: #cbd5e1;
        border: 1px solid #2a374f;
      }

      .type-badge.printing {
        background: rgba(139, 92, 246, 0.2);
        color: #c4b5fd;
        border: 1px solid rgba(139, 92, 246, 0.4);
      }
      .type-badge.service {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.4);
      }

      .primary-date {
        color: #f8fafc;
      }
      .sub-date {
        color: #94a3b8;
      }

      .customer-name {
        color: #f8fafc;
        font-weight: 700;
      }
      .customer-phone {
        color: #94a3b8;
      }

      .product-text {
        color: #cbd5e1;
      }

      .amount-val {
        color: #38bdf8;
        font-weight: 800;
      }

      .status-pill.draft {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);
      }
      .status-pill.finalized {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }

      .sending-pill {
        background: #1e293b;
        color: #94a3b8;
        border: 1px solid #2a374f;
      }
      .sending-pill.sent {
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.4);
      }

      .approval-pill.pending {
        background: rgba(234, 179, 8, 0.2);
        color: #fde047;
        border: 1px solid rgba(234, 179, 8, 0.4);
      }
      .approval-pill.approved {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }
      .approval-pill.rejected {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.4);
      }
      .approval-pill.revision {
        background: rgba(249, 115, 22, 0.2);
        color: #fdba74;
        border: 1px solid rgba(249, 115, 22, 0.4);
      }

      .btn-action {
        background: #172133;
        border-color: #2a374f;
        color: #94a3b8;
      }
      .btn-action:hover {
        background: #00adef;
        border-color: #00adef;
        color: #ffffff;
      }
      .btn-action.delete:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }

      .pagination-footer {
        background: #0d1424;
        border-top-color: #1f293d;
        color: #94a3b8;
      }
      .page-select {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;
      }
      .btn-page {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;
      }
      .btn-page:hover:not(:disabled) {
        background: #1e293b;
      }
      .page-current {
        color: #f8fafc;
      }
      .empty-state h3 {
        color: #f8fafc;
      }
      .empty-state p {
        color: #94a3b8;
      }
    }
  `]
})
export class QuotationListComponent implements OnInit, OnDestroy {
  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Reactive State via Signals
  quotations = signal<QuotationListItem[]>([]);
  summary = signal<QuotationSummary | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Filters State via Signals
  searchQuery = signal<string>('');
  selectedType = signal<string>(sessionStorage.getItem('zp_quotations_type_filter') || 'all');
  selectedStatus = signal<string>('all');
  selectedApproval = signal<string>('all');
  selectedSending = signal<string>('all');

  // Pagination & Sorting Signals
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(1);
  sortBy = signal<string>('date');
  isAscending = signal<boolean>(false);

  // Search Debouncing & Race Condition Prevention
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private activeRequestSub?: Subscription;
  private currentRequestId = 0;

  // Modals state
  activeSendQuote: QuotationListItem | null = null;
  activeApprovalQuote: QuotationListItem | null = null;

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadQuotations();
    });

    this.loadSummary();
    this.loadQuotations();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
    this.activeRequestSub?.unsubscribe();
  }

  loadSummary() {
    this.quotationService.getSummary().subscribe({
      next: (res) => {
        this.summary.set(res);
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadQuotations() {
    // Cancel any in-flight request
    this.activeRequestSub?.unsubscribe();

    const requestId = ++this.currentRequestId;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.activeRequestSub = this.quotationService.getQuotations({
      search: this.searchQuery(),
      quotationType: this.selectedType(),
      status: this.selectedStatus(),
      approvalStatus: this.selectedApproval(),
      sendingStatus: this.selectedSending(),
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      isAscending: this.isAscending()
    }).pipe(
      finalize(() => {
        if (requestId === this.currentRequestId) {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }
      })
    ).subscribe({
      next: (res) => {
        if (requestId !== this.currentRequestId) return;
        this.quotations.set(res?.items || []);
        this.totalCount.set(res?.totalCount || 0);
        this.totalPages.set(res?.totalPages || 1);
        this.errorMessage.set(null);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (requestId !== this.currentRequestId) return;
        const msg = err.name === 'TimeoutError'
          ? 'Request timed out. Please check server connection and try again.'
          : (err.error?.detail || err.error?.message || 'Unable to load quotations. Please try again.');
        this.errorMessage.set(msg);
        this.quotations.set([]);
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.searchSubject.next(val);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.searchSubject.next('');
  }

  onTypeChange(val: string) {
    this.selectedType.set(val);
    sessionStorage.setItem('zp_quotations_type_filter', val);
    this.currentPage.set(1);
    this.loadQuotations();
  }

  onStatusChange(val: string) {
    this.selectedStatus.set(val);
    this.currentPage.set(1);
    this.loadQuotations();
  }

  onApprovalChange(val: string) {
    this.selectedApproval.set(val);
    this.currentPage.set(1);
    this.loadQuotations();
  }

  onSendingChange(val: string) {
    this.selectedSending.set(val);
    this.currentPage.set(1);
    this.loadQuotations();
  }

  setSort(col: string) {
    if (this.sortBy() === col) {
      this.isAscending.set(!this.isAscending());
    } else {
      this.sortBy.set(col);
      this.isAscending.set(false);
    }
    this.currentPage.set(1);
    this.loadQuotations();
  }

  getSortIcon(col: string): string {
    if (this.sortBy() !== col) return '↕';
    return this.isAscending() ? '↑' : '↓';
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages() && p !== this.currentPage()) {
      this.currentPage.set(p);
      this.loadQuotations();
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize.set(Number(newSize));
    this.currentPage.set(1);
    this.loadQuotations();
  }

  openSendDialog(quote: QuotationListItem) {
    this.activeSendQuote = quote;
  }

  onSendRecorded() {
    this.activeSendQuote = null;
    this.loadQuotations();
    this.loadSummary();
  }

  openApprovalDialog(quote: QuotationListItem) {
    this.activeApprovalQuote = quote;
  }

  onApprovalRecorded() {
    this.activeApprovalQuote = null;
    this.loadQuotations();
    this.loadSummary();
  }

  confirmDelete(quote: QuotationListItem) {
    if (confirm(`Are you sure you want to delete Quotation ${quote.quotationNumber}?`)) {
      this.quotationService.deleteQuotation(quote.quotationId).subscribe({
        next: () => {
          this.toastService.success(`Quotation ${quote.quotationNumber} deleted`);
          this.loadQuotations();
          this.loadSummary();
        },
        error: (err) => {
          this.toastService.error(err.error?.detail || 'Failed to delete quotation');
        }
      });
    }
  }
}
