import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { ProductionService } from '../../services/production.service';
import { ProductionJob } from '../../models/production.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-in-house-production',
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
            <span>In-House Production</span>
          </div>
          <h1 class="title">In-House Production Management</h1>
          <p class="subtitle">Job workflow tracking, live progress monitoring, and production dispatch.</p>
        </div>
        <div class="header-actions">
          <button 
            type="button" 
            class="btn-clear-data" 
            (click)="confirmClearAllData()" 
            [disabled]="isClearing || jobs().length === 0"
            title="Delete all in-house production jobs"
          >
            🗑️ Clear In-House Data
          </button>
        </div>
      </header>

      <!-- KPI Metrics Bar -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total In-House Jobs</span>
          <span class="kpi-val">{{ jobs().length }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">In Progress</span>
          <span class="kpi-val in-progress">{{ getCount('In Progress') + getCount('Printing') }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Completed</span>
          <span class="kpi-val completed">{{ getCount('Completed') }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Queued / Ready</span>
          <span class="kpi-val queued">{{ getCount('Queued') }}</span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-card">
        <div class="status-tabs">
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'all'" (click)="filterStatus('all')">
            All Jobs ({{ jobs().length }})
          </button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'In Progress'" (click)="filterStatus('In Progress')">
            🚀 In Progress  
          </button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'Completed'" (click)="filterStatus('Completed')">
            ✅ Completed
          </button>
          <button type="button" class="tab-btn" [class.active]="selectedStatus() === 'Queued'" (click)="filterStatus('Queued')">
            ⏳ Queued
          </button>
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
            placeholder="Search by Job #, Order #, or Customer..." 
          />
        </div>
      </div>

      <!-- Jobs List -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading in-house production jobs...</p>
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
          <button type="button" class="btn-save" style="margin-top: 14px;" (click)="loadJobs()">
            Retry
          </button>
        </div>
      } @else if (filteredJobs().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          </div>
          <h3>No in-house production jobs found.</h3>
          <p>Create or confirm quotations with In-House Production selected to view active floor jobs here.</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Order Ref & Customer</th>
                <th>Assigned Items</th>
                <th>Deadline</th>
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
                    @if (job.dueDate) {
                      <div class="deadline-col">
                        <span class="deadline-date">📅 {{ job.dueDate | date:'mediumDate' }}</span>
                        @if (isOverdue(job.dueDate, job.status)) {
                          <span class="deadline-tag overdue">Overdue</span>
                        } @else {
                          <span class="deadline-tag on-track">On Track</span>
                        }
                      </div>
                    } @else {
                      <span class="text-muted text-xs">No Deadline Set</span>
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
                        <option value="Queued">⏳ Queued</option>
                        <option value="In Progress">🚀 In Progress</option>
                        <option value="Completed">✅ Completed</option>
                        <option value="On Hold">⏸️ On Hold</option>
                      </select>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons-group">
                      @if (job.status !== 'In Progress' && job.status !== 'Completed') {
                        <button type="button" class="btn-action accept" (click)="acceptJob(job)" title="Accept Job">
                          Accept
                        </button>
                      } @else if (job.status === 'In Progress') {
                        <button type="button" class="btn-action complete" (click)="completeJob(job)" title="Mark Completed">
                          Complete
                        </button>
                      }

                      <button type="button" class="btn-action edit" (click)="openEditModal(job)" title="Edit Job Details">
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

      <!-- Edit Job Modal -->
      @if (editModalOpen && selectedJob) {
        <div class="modal-backdrop" (click)="closeEditModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">Edit In-House Job: {{ selectedJob.jobNumber }}</h3>
                <p class="modal-subtitle">Order: {{ selectedJob.orderNumber }} &bull; Customer: {{ selectedJob.customerName }}</p>
              </div>
              <button type="button" class="close-btn" (click)="closeEditModal()">&times;</button>
            </div>

            <div class="modal-body">
              <div class="fields-grid-2">
                <div class="form-group">
                  <label class="form-label">Production Status <span class="required">*</span></label>
                  <select [(ngModel)]="editForm.status" class="form-select">
                    <option value="In Progress">🚀 In Progress</option>
                    <option value="Completed">✅ Completed</option>
                    <option value="Queued">⏳ Queued (Ready for Print)</option>
                    <option value="On Hold">⏸️ On Hold</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Production Deadline</label>
                  <input type="date" [(ngModel)]="editForm.dueDate" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Floor / Production Notes</label>
                <textarea [(ngModel)]="editForm.internalNotes" rows="3" class="form-textarea" placeholder="Add technical notes, batch numbers, or instructions..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeEditModal()">Cancel</button>
              <button type="button" class="btn-save" [disabled]="isSaving" (click)="saveJob()">
                @if (isSaving) { Saving... } @else { Save Changes }
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
              <h3 class="modal-title">Delete In-House Job</h3>
              <button type="button" class="close-btn" (click)="closeDeleteModal()">&times;</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete In-House Job <strong>{{ jobToDelete.jobNumber }}</strong> for Order <strong>{{ jobToDelete.orderNumber }}</strong>?</p>
              <p class="text-muted text-xs">This will permanently remove this production job record.</p>
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

      <!-- Clear All Confirmation Modal -->
      @if (clearAllModalOpen) {
        <div class="modal-backdrop" (click)="closeClearAllModal()">
          <div class="modal-dialog delete-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Clear All In-House Data</h3>
              <button type="button" class="close-btn" (click)="closeClearAllModal()">&times;</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete all <strong>{{ jobs().length }}</strong> In-House production jobs from the database?</p>
              <p class="text-muted text-xs">This will completely clear in-house jobs so you can start fresh.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeClearAllModal()">Cancel</button>
              <button type="button" class="btn-action delete" style="padding: 8px 16px;" [disabled]="isClearing" (click)="executeClearAllData()">
                @if (isClearing) { Clearing... } @else { Yes, Clear All }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .production-page {
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
      flex-wrap: wrap;
      gap: 12px;
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
    .btn-clear-data {
      padding: 7px 14px;
      border-radius: 6px;
      border: 1px solid #FECACA;
      background: #FFF1F2;
      color: #E11D48;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-clear-data:hover:not(:disabled) {
      background: #FFE4E6;
      color: #BE123C;
    }
    .btn-clear-data:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
    .kpi-val.queued { color: #D97706; }
    .kpi-val.in-progress { color: #0284C7; }
    .kpi-val.completed { color: #16A34A; }

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
      flex-wrap: wrap;
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
    .tab-btn:hover {
      background: #F1F5F9;
      color: #0F172A;
    }
    .tab-btn.active {
      background: #F0FDF4;
      color: #16A34A;
      border-color: #BBF7D0;
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
      color: #16A34A;
    }
    .job-date {
      font-size: 11px;
      color: #94A3B8;
    }
    .order-link {
      color: #0F172A;
    }
    .cust-name {
      font-size: 11.5px;
      color: #64748B;
    }
    .items-summary {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    .chip-qty {
      font-weight: 700;
      color: #0F172A;
      background: #F1F5F9;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 11px;
    }
    .chip-name {
      color: #334155;
    }
    .chip-spec {
      font-size: 11px;
      color: #64748B;
    }
    .deadline-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .deadline-date {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
    .deadline-tag {
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    .deadline-tag.overdue {
      color: #dc2626;
      background: #fee2e2;
    }
    .deadline-tag.on-track {
      color: #166534;
      background: #dcfce7;
    }

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
    .status-quick-select.st-queued {
      background: #FEF3C7;
      color: #B45309;
      border-color: #FDE68A;
    }
    .status-quick-select.st-printing {
      background: #E0F2FE;
      color: #0369A1;
      border-color: #BAE6FD;
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

    .text-right { text-align: right; }
    .text-muted { color: #94A3B8; }
    .text-xs { font-size: 12px; }

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
      border-top-color: #16A34A;
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
      max-width: 580px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .modal-dialog.delete-dialog {
      max-width: 440px;
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
      background: #16A34A;
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
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.3);
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
        color: #4ade80;
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

      .deadline-date {
        color: #f8fafc;
      }

      .deadline-tag.on-track {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .deadline-tag.overdue {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.35);
      }

      .status-quick-select {
        background: #172133;
        border-color: #2a374f;
        color: #f8fafc;

        &.st-queued {
          background: #2a1f0a;
          color: #fbbf24;
          border-color: #78350f;
        }
        &.st-printing {
          background: #082f49;
          color: #38bdf8;
          border-color: #0369a1;
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
          border-color: #0284c7;
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
export class InHouseProductionComponent implements OnInit, OnDestroy {
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

  // Edit Job State
  editModalOpen = false;
  selectedJob: ProductionJob | null = null;
  editForm = {
    status: 'In Progress',
    dueDate: '',
    internalNotes: ''
  };
  isSaving = false;

  // Delete Job State
  deleteModalOpen = false;
  jobToDelete: ProductionJob | null = null;
  isDeleting = false;

  // Clear All Data State
  clearAllModalOpen = false;
  isClearing = false;

  ngOnInit() {
    this.loadJobs();
  }

  ngOnDestroy() {
    this.activeSub?.unsubscribe();
  }

  loadJobs() {
    const requestId = ++this.currentRequestId;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.activeSub?.unsubscribe();

    this.activeSub = this.productionService.getJobs('IN_HOUSE')
      .pipe(
        finalize(() => {
          if (requestId === this.currentRequestId) {
            this.isLoading.set(false);
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (data) => {
          if (requestId === this.currentRequestId) {
            this.jobs.set(data || []);
            this.applyFilter();
          }
        },
        error: (err) => {
          if (requestId === this.currentRequestId) {
            console.error('Failed to load in-house production jobs', err);
            this.errorMessage.set('Unable to load in-house production jobs. Please check network or retry.');
            this.toastService.error('Failed to load in-house production jobs');
          }
        }
      });
  }

  getCount(status: string): number {
    return this.jobs().filter(j => j.status.toLowerCase() === status.toLowerCase()).length;
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
      if (status === 'In Progress') {
        list = list.filter(j => j.status.toLowerCase() === 'in progress' || j.status.toLowerCase() === 'printing');
      } else {
        list = list.filter(j => j.status.toLowerCase() === status.toLowerCase());
      }
    }

    if (query) {
      list = list.filter(j =>
        j.jobNumber.toLowerCase().includes(query) ||
        j.orderNumber.toLowerCase().includes(query) ||
        j.customerName.toLowerCase().includes(query)
      );
    }

    this.filteredJobs.set(list);
    this.cdr.markForCheck();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'p-urgent';
      case 'High': return 'p-high';
      default: return 'p-normal';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Queued': return 'st-queued';
      case 'Printing':
      case 'In Progress': return 'st-printing';
      case 'Completed': return 'st-completed';
      default: return 'st-queued';
    }
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

  isOverdue(dueDate?: string, status?: string): boolean {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  openEditModal(job: ProductionJob) {
    this.selectedJob = job;
    const dateStr = job.dueDate ? job.dueDate.split('T')[0] : '';
    this.editForm = {
      status: job.status,
      dueDate: dateStr,
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
      dueDate: this.editForm.dueDate ? new Date(this.editForm.dueDate).toISOString() : undefined,
      notes: this.editForm.internalNotes
    }).subscribe({
      next: () => {
        this.toastService.success(`Job ${this.selectedJob!.jobNumber} updated successfully`);
        this.isSaving = false;
        this.closeEditModal();
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to update job', err);
        this.toastService.error('Failed to update job');
        this.isSaving = false;
        this.cdr.markForCheck();
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

  confirmClearAllData() {
    this.clearAllModalOpen = true;
    this.cdr.markForCheck();
  }

  closeClearAllModal() {
    this.clearAllModalOpen = false;
    this.cdr.markForCheck();
  }

  executeClearAllData() {
    this.isClearing = true;

    this.productionService.clearInHouseJobs().subscribe({
      next: (res) => {
        this.toastService.success(res?.message || 'All In-House data cleared successfully!');
        this.isClearing = false;
        this.closeClearAllModal();
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to clear in-house jobs', err);
        this.toastService.error('Failed to clear in-house data');
        this.isClearing = false;
        this.cdr.markForCheck();
      }
    });
  }
}
