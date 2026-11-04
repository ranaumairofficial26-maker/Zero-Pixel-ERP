import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { ProductionService } from '../../services/production.service';
import { ProductionJob } from '../../models/production.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-outsourced-production',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="production-page">
      <!-- Header -->
      <header class="page-header">
        <div class="header-titles">
          <div class="breadcrumbs">
            <span>Production</span>
            <span>/</span>
            <span>Outsourced Production</span>
          </div>
          <h1 class="title">Outsourced Production Management</h1>
          <p class="subtitle">Real-time tracking for third-party vendor POs, outsourced costs, delivery schedules, and receipt inspections.</p>
        </div>
      </header>

      <!-- KPI Metrics Bar -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total Outsourced Jobs</span>
          <span class="kpi-val">{{ jobs().length }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Pending Vendor PO</span>
          <span class="kpi-val pending">{{ getCount('Pending Vendor PO') }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">With Vendor / In Prod</span>
          <span class="kpi-val vendor">{{ getCount('Sent to Vendor') + getCount('In Production') }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Received & Inspected</span>
          <span class="kpi-val inspected">{{ getCount('Received & Inspected') }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Vendor Cost</span>
          <span class="kpi-val cost">PKR {{ getTotalCost() | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-card">
        <div class="status-tabs">
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'all'" (click)="filterStatus('all')">All</button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'Pending Vendor PO'" (click)="filterStatus('Pending Vendor PO')">Pending PO</button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'In Production'" (click)="filterStatus('In Production')">In Production</button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'Received & Inspected'" (click)="filterStatus('Received & Inspected')">Inspected</button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'Completed'" (click)="filterStatus('Completed')">Completed</button>
        </div>

        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="onSearchChange($event)" 
            placeholder="Search by Job #, Vendor, Order #, Customer..." 
          />
        </div>
      </div>

      <!-- Jobs List -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading outsourced production jobs...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>Unable to load production jobs. Please try again.</h3>
          <p>{{ errorMessage() }}</p>
          <button type="button" class="btn-manage" style="margin-top: 14px;" (click)="loadJobs()">
            Retry
          </button>
        </div>
      } @else if (filteredJobs().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <h3>No outsourced production jobs found.</h3>
          <p>Confirm printing orders assigned to Outsourced Production to dispatch jobs to external vendors.</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Order Ref & Customer</th>
                <th>Assigned Items</th>
                <th>Vendor Details</th>
                <th>Outsourced Cost</th>
                <th>Expected Delivery</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (job of filteredJobs(); track job.jobId) {
                <tr>
                  <td>
                    <span class="job-code">{{ job.jobNumber }}</span>
                    <span class="job-date">{{ job.createdAt | date:'shortDate' }}</span>
                  </td>
                  <td>
                    <strong class="order-link">{{ job.orderNumber }}</strong>
                    <div class="cust-name">{{ job.customerName }}</div>
                  </td>
                  <td>
                    <div class="items-summary">
                      @for (item of job.items; track item.jobItemId) {
                        <div class="item-chip">
                          <span class="chip-qty">{{ item.quantity }} {{ item.unit }}</span>
                          <span class="chip-name">{{ item.productName }}</span>
                          @if (item.sizeDimensions || item.material) {
                            <span class="chip-spec">({{ item.sizeDimensions || item.material }})</span>
                          }
                        </div>
                      }
                    </div>
                  </td>
                  <td>
                    @if (job.vendorName) {
                      <div class="vendor-box">
                        <strong class="v-name">{{ job.vendorName }}</strong>
                        @if (job.vendorContact) {
                          <span class="v-phone">📞 {{ job.vendorContact }}</span>
                        }
                      </div>
                    } @else {
                      <span class="no-vendor-pill">⚠️ No Vendor Assigned</span>
                    }
                  </td>
                  <td>
                    <div class="cost-col">
                      <span class="cost-amount">PKR {{ (job.vendorCost || 0) | number:'1.2-2' }}</span>
                      <span class="cost-badge">Internal Only</span>
                    </div>
                  </td>
                  <td>
                    @if (job.expectedDeliveryDate) {
                      <span class="delivery-date">{{ job.expectedDeliveryDate | date:'mediumDate' }}</span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td>
                    <div class="status-cell">
                      <select 
                        [ngModel]="job.status" 
                        (ngModelChange)="quickChangeStatus(job, $event)" 
                        class="status-quick-select" 
                        [class]="getStatusClass(job.status)"
                      >
                        <option value="Pending Vendor PO">⏳ Pending Vendor PO</option>
                        <option value="In Progress">🚀 In Progress</option>
                        <option value="Completed">✅ Completed</option>
                        <option value="Delivered">📦 Delivered</option>
                        <option value="On Hold">⏸️ On Hold</option>
                      </select>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons-group">
                      @if (job.status !== 'In Progress' && job.status !== 'Completed' && job.status !== 'Delivered') {
                        <button type="button" class="btn-action accept" (click)="acceptJob(job)" title="Accept Job">
                          Accept
                        </button>
                      } @else if (job.status === 'In Progress') {
                        <button type="button" class="btn-action complete" (click)="completeJob(job)" title="Mark Completed">
                          Complete
                        </button>
                      }
                      <button type="button" class="btn-action edit" (click)="openEditModal(job)" title="Manage Vendor & PO">
                        Edit
                      </button>
                      <button type="button" class="btn-action delete" (click)="promptDeleteJob(job)" title="Delete Job">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Edit Job / Vendor Modal -->
      @if (editModalOpen && selectedJob) {
        <div class="modal-backdrop" (click)="closeEditModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">Manage Vendor PO: {{ selectedJob.jobNumber }}</h3>
                <p class="modal-subtitle">Order: {{ selectedJob.orderNumber }} &bull; Customer: {{ selectedJob.customerName }}</p>
              </div>
              <button type="button" class="close-btn" (click)="closeEditModal()">&times;</button>
            </div>

            <div class="modal-body">
              <div class="notice-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Vendor pricing and contact details are kept strictly internal and are never exposed in customer-facing quotation PDFs.</span>
              </div>

              <div class="fields-grid-2">
                <div class="form-group">
                  <label class="form-label">Vendor Name <span class="required">*</span></label>
                  <input type="text" [(ngModel)]="editForm.vendorName" class="form-input" placeholder="e.g. Apex Packaging & Print Works" />
                </div>

                <div class="form-group">
                  <label class="form-label">Vendor Contact / Phone</label>
                  <input type="text" [(ngModel)]="editForm.vendorContact" class="form-input" placeholder="e.g. +92 300 7654321" />
                </div>

                <div class="form-group">
                  <label class="form-label">Vendor Cost (PKR)</label>
                  <input type="number" [(ngModel)]="editForm.vendorCost" min="0" class="form-input" placeholder="e.g. 25000" />
                </div>

                <div class="form-group">
                  <label class="form-label">Expected Delivery Date</label>
                  <input type="date" [(ngModel)]="editForm.expectedDeliveryDate" class="form-input" />
                </div>

                <div class="form-group">
                  <label class="form-label">Vendor / Production Status</label>
                  <select [(ngModel)]="editForm.status" class="form-select">
                    <option value="Pending Vendor PO">Pending Vendor PO</option>
                    <option value="Sent to Vendor">Sent to Vendor</option>
                    <option value="In Production">In Production with Vendor</option>
                    <option value="Received & Inspected">Received & Inspected</option>
                    <option value="Completed">Completed / Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select [(ngModel)]="editForm.priority" class="form-select">
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Rush</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Internal Vendor Notes & Delivery Terms</label>
                <textarea [(ngModel)]="editForm.internalNotes" rows="3" class="form-textarea" placeholder="Add delivery instructions, quality check remarks, or vendor PO details..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeEditModal()">Cancel</button>
              <button type="button" class="btn-save" [disabled]="isSaving" (click)="saveJob()">
                @if (isSaving) { Saving... } @else { Save Vendor Details }
              </button>
            </div>
          </div>
        </div>
      }
      <!-- Delete Confirmation Modal -->
      @if (deleteModalOpen && jobToDelete) {
        <div class="modal-backdrop" (click)="closeDeleteModal()">
          <div class="modal-dialog delete-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Delete Outsourced Job</h3>
              <button type="button" class="close-btn" (click)="closeDeleteModal()">&times;</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete Outsourced Job <strong>{{ jobToDelete.jobNumber }}</strong> for Order <strong>{{ jobToDelete.orderNumber }}</strong>?</p>
              <p class="text-muted text-xs">This action will remove this production job record permanently.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeDeleteModal()">Cancel</button>
              <button type="button" class="btn-action delete" style="padding: 8px 16px;" [disabled]="isDeleting" (click)="executeDeleteJob()">
                @if (isDeleting) { Deleting... } @else { Confirm Delete }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .status-cell {
      display: flex;
      align-items: center;
    }
    .status-quick-select {
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      font-size: 12px;
      font-weight: 600;
      background: #fff;
      cursor: pointer;
      outline: none;
    }
    .status-quick-select.st-pending-po {
      background: #FEF3C7;
      color: #B45309;
      border-color: #FDE68A;
    }
    .status-quick-select.st-vendor {
      background: #EDE9FE;
      color: #6D28D9;
      border-color: #DDD6FE;
    }
    .status-quick-select.st-completed {
      background: #DCFCE7;
      color: #15803D;
      border-color: #86EFAC;
    }

    .action-buttons-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-end;
    }
    .btn-action {
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }
    .btn-action.accept {
      background: #EFF6FF;
      color: #2563EB;
      border-color: #BFDBFE;
    }
    .btn-action.accept:hover {
      background: #2563EB;
      color: #fff;
    }
    .btn-action.complete {
      background: #F0FDF4;
      color: #16A34A;
      border-color: #BBF7D0;
    }
    .btn-action.complete:hover {
      background: #16A34A;
      color: #fff;
    }
    .btn-action.edit {
      background: #F8FAFC;
      color: #475569;
      border-color: #CBD5E1;
    }
    .btn-action.edit:hover {
      background: #E2E8F0;
      color: #0F172A;
    }
    .btn-action.delete {
      background: #FEF2F2;
      color: #DC2626;
      border-color: #FECACA;
    }
    .btn-action.delete:hover {
      background: #DC2626;
      color: #fff;
    }
    .modal-dialog.delete-dialog {
      max-width: 440px;
    }
    .production-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .page-header {
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
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: #64748B;
      margin: 4px 0 0 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }
    .kpi-card {
      background: #fff;
      padding: 14px 18px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
    }
    .kpi-val.pending { color: #D97706; }
    .kpi-val.vendor { color: #9333EA; }
    .kpi-val.inspected { color: #0284C7; }
    .kpi-val.cost { color: #059669; }

    .toolbar-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 12px 18px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      flex-wrap: wrap;
      gap: 12px;
    }
    .status-tabs {
      display: flex;
      gap: 6px;
    }
    .tab-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: #64748B;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .tab-btn.active {
      background: #FAF5FF;
      color: #9333EA;
      border-color: #E9D5FF;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 6px 12px;
      width: 320px;
      background: #fff;
    }
    .search-box input {
      border: none;
      outline: none;
      font-size: 12.5px;
      width: 100%;
    }
    .table-container {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    .data-table th {
      background: #F8FAFC;
      color: #475569;
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 1px solid #E2E8F0;
      white-space: nowrap;
    }
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .job-code {
      display: block;
      font-weight: 700;
      color: #9333EA;
    }
    .job-date {
      font-size: 11px;
      color: #94A3B8;
    }
    .order-link { color: #0F172A; }
    .cust-name { font-size: 12px; color: #64748B; }
    .items-summary {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-chip { font-size: 12px; color: #334155; }
    .chip-qty { font-weight: 700; color: #0F172A; margin-right: 4px; }
    .chip-spec { font-size: 11px; color: #64748B; margin-left: 4px; }

    .vendor-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .v-name { color: #0F172A; font-size: 12.5px; }
    .v-phone { font-size: 11px; color: #64748B; }
    .no-vendor-pill {
      font-size: 11px;
      font-weight: 600;
      background: #FEF3C7;
      color: #B45309;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .cost-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cost-amount {
      font-weight: 700;
      color: #0F172A;
    }
    .cost-badge {
      font-size: 10px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    .delivery-date {
      font-size: 12px;
      color: #334155;
    }
    .status-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .st-pending-po { background: #FEF3C7; color: #B45309; }
    .st-vendor { background: #EDE9FE; color: #6D28D9; }
    .st-inspected { background: #E0F2FE; color: #0369A1; }
    .st-completed { background: #DCFCE7; color: #15803D; }

    .btn-manage {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: #FAF5FF;
      color: #9333EA;
      border: 1px solid #E9D5FF;
      cursor: pointer;
    }
    .btn-manage:hover {
      background: #F3E8FF;
    }
    .text-right { text-align: right; }
    .text-muted { color: #94A3B8; }
    .loading-state, .empty-state {
      background: #fff;
      padding: 48px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      text-align: center;
      color: #64748B;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E2E8F0;
      border-top-color: #9333EA;
      border-radius: 50%;
      margin: 0 auto 12px auto;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-dialog {
      background: #fff;
      border-radius: 12px;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 18px 24px;
      border-bottom: 1px solid #E2E8F0;
    }
    .modal-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0; }
    .modal-subtitle { font-size: 12px; color: #64748B; margin: 2px 0 0 0; }
    .close-btn { background: transparent; border: none; font-size: 24px; color: #94A3B8; cursor: pointer; }
    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .notice-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      color: #15803D;
    }
    .fields-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-label { font-size: 12px; font-weight: 600; color: #334155; }
    .form-input, .form-select, .form-textarea {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12.5px;
      outline: none;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid #E2E8F0;
      background: #F8FAFC;
    }
    .btn-cancel {
      padding: 8px 16px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      background: #fff;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .btn-save {
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      background: #9333EA;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
    }

    /* Dark Mode Support */
    :host-context(.dark-mode),
    :host-context(body.dark-mode) {
      .page-header,
      .kpi-card,
      .toolbar-card,
      .table-container,
      .loading-state,
      .empty-state,
      .modal-dialog {
        background: #111827;
        border-color: #1f293d;
      }

      .title,
      .kpi-val,
      .modal-title {
        color: #f8fafc;
      }

      .subtitle,
      .breadcrumbs,
      .kpi-label,
      .modal-subtitle {
        color: #94a3b8;
      }

      .search-box {
        background: #172133;
        border-color: #2a374f;
        input {
          background: transparent;
          color: #f8fafc;
          &::placeholder { color: #64748b; }
        }
        svg { stroke: #94a3b8; }
      }

      .tab-btn {
        color: #94a3b8;
        &:hover {
          background: #172133;
          color: #f8fafc;
        }
        &.active {
          background: rgba(147, 51, 234, 0.15);
          color: #c084fc;
          border-color: rgba(147, 51, 234, 0.3);
        }
      }

      .data-table th {
        background: #0d1424;
        color: #94a3b8;
        border-color: #1f293d;
      }

      .data-table td {
        border-color: #1f293d;
        color: #e2e8f0;
      }

      .data-table tbody tr:hover td {
        background: #162032;
      }

      .job-code {
        color: #c084fc;
      }

      .job-date {
        color: #64748b;
      }

      .order-link {
        color: #38bdf8;
      }

      .cust-name {
        color: #cbd5e1;
      }

      .item-chip {
        color: #cbd5e1;
        .chip-qty {
          background: #1e293b;
          color: #38bdf8;
          border: 1px solid #2a374f;
        }
        .chip-name {
          color: #f8fafc;
        }
        .chip-spec {
          color: #94a3b8;
        }
      }

      .vendor-box {
        .v-name { color: #f8fafc; }
        .v-phone { color: #94a3b8; }
      }

      .no-vendor-pill {
        background: #2a1f0a;
        color: #fbbf24;
        border: 1px solid #78350f;
      }

      .cost-col {
        .cost-amount { color: #34d399; }
        .cost-badge { color: #64748b; }
      }

      .delivery-date {
        color: #f8fafc;
      }

      .status-quick-select {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;

        &.st-pending-po {
          background: #2a1f0a;
          color: #fbbf24;
          border-color: #78350f;
        }
        &.st-vendor {
          background: #2e1065;
          color: #c084fc;
          border-color: #581c87;
        }
        &.st-completed {
          background: #064e3b;
          color: #34d399;
          border-color: #059669;
        }
      }

      .btn-action.edit {
        background: #172133;
        border-color: #2a374f;
        color: #cbd5e1;
        &:hover {
          background: #1f293d;
          color: #ffffff;
        }
      }

      .btn-manage {
        background: #2e1065;
        color: #c084fc;
        border-color: #581c87;
        &:hover {
          background: #3b0764;
          color: #e9d5ff;
        }
      }

      .notice-box {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .modal-header,
      .modal-footer {
        border-color: #1f293d;
      }

      .modal-footer {
        background: #0f172a;
      }

      .form-label {
        color: #cbd5e1;
      }

      .form-input,
      .form-select,
      .form-textarea {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;
        &:focus {
          border-color: #9333ea;
        }
      }

      .btn-cancel {
        background: #172133;
        border-color: #2a374f;
        color: #cbd5e1;
        &:hover {
          background: #1f293d;
          color: #f8fafc;
        }
      }
    }
  `]
})
export class OutsourcedProductionComponent implements OnInit, OnDestroy {
  private productionService = inject(ProductionService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Reactive state signals
  jobs = signal<ProductionJob[]>([]);
  filteredJobs = signal<ProductionJob[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');

  private activeSub?: Subscription;
  private currentRequestId = 0;

  editModalOpen = false;
  selectedJob: ProductionJob | null = null;
  editForm = {
    status: 'Pending Vendor PO',
    priority: 'Normal',
    vendorName: '',
    vendorContact: '',
    vendorCost: 0,
    expectedDeliveryDate: '',
    internalNotes: ''
  };
  isSaving = false;

  // Delete Job State
  deleteModalOpen = false;
  jobToDelete: ProductionJob | null = null;
  isDeleting = false;

  ngOnInit() {
    this.loadJobs();
  }

  ngOnDestroy() {
    this.activeSub?.unsubscribe();
  }

  loadJobs() {
    this.activeSub?.unsubscribe();
    const requestId = ++this.currentRequestId;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.activeSub = this.productionService.getJobs('OUTSOURCED').pipe(
      finalize(() => {
        if (requestId === this.currentRequestId) {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }
      })
    ).subscribe({
      next: (data) => {
        if (requestId !== this.currentRequestId) return;
        this.jobs.set(data || []);
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (requestId !== this.currentRequestId) return;
        console.error('Failed to load outsourced production jobs', err);
        const msg = 'Unable to load production jobs. Please try again.';
        this.errorMessage.set(msg);
        this.toastService.error(msg);
        this.cdr.markForCheck();
      }
    });
  }

  getCount(status: string): number {
    return this.jobs().filter(j => j.status.toLowerCase() === status.toLowerCase()).length;
  }

  getTotalCost(): number {
    return this.jobs().reduce((sum, j) => sum + (j.vendorCost || 0), 0);
  }

  filterStatus(status: string) {
    this.selectedStatus.set(status);
    this.applyFilter();
  }

  onSearchChange(term: string) {
    this.searchQuery.set(term);
    this.applyFilter();
  }

  applyFilter() {
    let list = this.jobs();
    const status = this.selectedStatus();
    const query = this.searchQuery().trim().toLowerCase();

    if (status !== 'all') {
      list = list.filter(j => j.status.toLowerCase() === status.toLowerCase());
    }

    if (query) {
      list = list.filter(j =>
        j.jobNumber.toLowerCase().includes(query) ||
        j.orderNumber.toLowerCase().includes(query) ||
        j.customerName.toLowerCase().includes(query) ||
        (j.vendorName && j.vendorName.toLowerCase().includes(query))
      );
    }

    this.filteredJobs.set(list);
    this.cdr.markForCheck();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending Vendor PO': return 'st-pending-po';
      case 'Sent to Vendor':
      case 'In Production': return 'st-vendor';
      case 'Received & Inspected': return 'st-inspected';
      case 'Completed': return 'st-completed';
      default: return 'st-pending-po';
    }
  }

  openEditModal(job: ProductionJob) {
    this.selectedJob = job;
    let delDate = '';
    if (job.expectedDeliveryDate) {
      delDate = new Date(job.expectedDeliveryDate).toISOString().split('T')[0];
    }
    this.editForm = {
      status: job.status,
      priority: job.priority,
      vendorName: job.vendorName || '',
      vendorContact: job.vendorContact || '',
      vendorCost: job.vendorCost || 0,
      expectedDeliveryDate: delDate,
      internalNotes: job.internalNotes || ''
    };
    this.editModalOpen = true;
    this.cdr.markForCheck();
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.selectedJob = null;
    this.cdr.markForCheck();
  }

  saveJob() {
    if (!this.selectedJob) return;
    this.isSaving = true;

    this.productionService.updateJob(this.selectedJob.jobId, {
      status: this.editForm.status,
      priority: this.editForm.priority,
      vendorName: this.editForm.vendorName,
      vendorContact: this.editForm.vendorContact,
      vendorCost: Number(this.editForm.vendorCost) || 0,
      expectedDeliveryDate: this.editForm.expectedDeliveryDate ? new Date(this.editForm.expectedDeliveryDate).toISOString() : undefined,
      internalNotes: this.editForm.internalNotes
    }).subscribe({
      next: () => {
        this.toastService.success(`Outsourced Job ${this.selectedJob!.jobNumber} updated successfully`);
        this.isSaving = false;
        this.closeEditModal();
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to update outsourced job', err);
        this.toastService.error('Failed to update outsourced job');
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  acceptJob(job: ProductionJob) {
    this.productionService.updateStatus(job.jobId, 'In Progress').subscribe({
      next: () => {
        this.toastService.success(`Job ${job.jobNumber} accepted (In Progress)!`);
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to accept job', err);
        this.toastService.error('Failed to accept job');
      }
    });
  }

  completeJob(job: ProductionJob) {
    this.productionService.updateStatus(job.jobId, 'Completed').subscribe({
      next: () => {
        this.toastService.success(`Job ${job.jobNumber} marked as Completed!`);
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to complete job', err);
        this.toastService.error('Failed to complete job');
      }
    });
  }

  quickChangeStatus(job: ProductionJob, newStatus: string) {
    if (job.status === newStatus) return;
    this.productionService.updateStatus(job.jobId, newStatus).subscribe({
      next: () => {
        this.toastService.success(`Job ${job.jobNumber} status updated to: ${newStatus}`);
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.toastService.error('Failed to update status');
      }
    });
  }

  promptDeleteJob(job: ProductionJob) {
    this.jobToDelete = job;
    this.deleteModalOpen = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.jobToDelete = null;
    this.cdr.markForCheck();
  }

  executeDeleteJob() {
    if (!this.jobToDelete) return;
    this.isDeleting = true;

    this.productionService.deleteJob(this.jobToDelete.jobId).subscribe({
      next: () => {
        this.toastService.success(`Job ${this.jobToDelete!.jobNumber} deleted successfully`);
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to delete job', err);
        this.toastService.error('Failed to delete job');
        this.isDeleting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
