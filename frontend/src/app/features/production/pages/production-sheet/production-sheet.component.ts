import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductionJobSheetService, ProductionJobSheet } from '../../services/production-job-sheet.service';

/**
 * Custom validator to ensure completion date is not earlier than start date
 */
function dateOrderValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('printingStartDate')?.value;
  const completion = group.get('printingCompletionDate')?.value;

  if (start && completion) {
    const startDate = new Date(start);
    const completionDate = new Date(completion);
    if (completionDate < startDate) {
      return { completionBeforeStart: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-production-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="production-sheet-wrapper">
      
      <!-- ====================================================================== -->
      <!-- SCREEN FORM (Visible on screen, hidden on print) -->
      <!-- ====================================================================== -->
      <div class="screen-view no-print">
        
        <!-- Top Breadcrumbs & Page Header -->
        <header class="page-header">
          <div class="header-left">
            <div class="breadcrumbs">
              <a routerLink="/admin/dashboard">Dashboard</a>
              <span class="sep">/</span>
              <span class="active-crumb">Production Job Sheet</span>
            </div>
            <h1 class="page-title">Production Job Sheet</h1>
            <p class="page-subtitle">Create, manage and store print production job sheets in database.</p>
            <p class="page-instruction">Enter the printing job specifications and production instructions.</p>
          </div>

          <div class="header-right-actions">
            <button 
              type="button" 
              class="btn btn-secondary btn-preview-toggle" 
              (click)="showLivePreview.set(!showLivePreview())"
              title="Toggle printable ticket preview on screen"
            >
              <span>{{ showLivePreview() ? '📝 Hide Sheet Preview' : '👁️ View Sheet Preview' }}</span>
            </button>

            <button 
              type="button" 
              class="btn btn-secondary btn-new" 
              (click)="startNewSheet()"
              title="Create a fresh empty job sheet"
            >
              <span class="btn-icon">➕</span>
              <span>New Job Sheet</span>
            </button>
          </div>
        </header>

        <!-- Saved Job Sheets Bar (Database Selector) -->
        <section class="saved-sheets-bar">
          <div class="saved-sheets-container">
            <div class="saved-field">
              <label for="savedSheetSelect" class="saved-label">
                <span class="label-icon">📂</span> Load Saved Sheet From Database:
              </label>
              <select 
                id="savedSheetSelect" 
                class="saved-dropdown"
                [value]="currentSheetId() ?? ''" 
                (change)="onSelectSavedSheet($event)"
              >
                <option value="">-- Create New (Unsaved Sheet) --</option>
                <option *ngFor="let s of savedSheets()" [value]="s.id">
                  {{ s.jobCardNumber }} - {{ s.customerName }} ({{ s.jobName }}) - [{{ formatDate(s.jobDate) }}]
                </option>
              </select>
            </div>

            <div class="saved-meta" *ngIf="currentSheetId()">
              <span class="db-badge">💾 Saved in DB (ID: #{{ currentSheetId() }})</span>
              <button type="button" class="btn-delete-saved" (click)="deleteCurrentSheet()" title="Delete from Database">
                🗑️ Delete
              </button>
            </div>
          </div>
        </section>

        <!-- Main Form Container -->
        <form [formGroup]="jobSheetForm" (ngSubmit)="onSaveAndPrint()" class="job-sheet-form" novalidate>
          
          <!-- STEP 3: Job Information Section -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">📋</div>
              <div>
                <h2 class="section-title">Job Information</h2>
                <p class="section-desc">Basic identification, client, and substrate specifications</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Job Card Number -->
              <div class="form-field">
                <label for="jobCardNumber" class="field-label required">Job Card Number</label>
                <input 
                  type="text" 
                  id="jobCardNumber" 
                  formControlName="jobCardNumber" 
                  class="form-control"
                  placeholder="Enter job card number (e.g. JOB-001)"
                  [class.is-invalid]="isFieldInvalid('jobCardNumber')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('jobCardNumber')">
                  Job card number is required.
                </div>
              </div>

              <!-- Job Date -->
              <div class="form-field">
                <label for="jobDate" class="field-label required">Job Date</label>
                <input 
                  type="date" 
                  id="jobDate" 
                  formControlName="jobDate" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('jobDate')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('jobDate')">
                  Valid job date is required.
                </div>
              </div>

              <!-- Customer Name -->
              <div class="form-field">
                <label for="customerName" class="field-label required">Customer Name</label>
                <input 
                  type="text" 
                  id="customerName" 
                  formControlName="customerName" 
                  class="form-control"
                  placeholder="Enter customer name"
                  [class.is-invalid]="isFieldInvalid('customerName')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('customerName')">
                  Customer name is required.
                </div>
              </div>

              <!-- Job Name / Description -->
              <div class="form-field">
                <label for="jobName" class="field-label required">Job Name / Description</label>
                <input 
                  type="text" 
                  id="jobName" 
                  formControlName="jobName" 
                  class="form-control"
                  placeholder="Enter printing job name (e.g. Business Cards Printing)"
                  [class.is-invalid]="isFieldInvalid('jobName')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('jobName')">
                  Job name or description is required.
                </div>
              </div>

              <!-- Quantity -->
              <div class="form-field">
                <label for="quantity" class="field-label required">Quantity</label>
                <input 
                  type="number" 
                  id="quantity" 
                  formControlName="quantity" 
                  class="form-control"
                  placeholder="Enter required quantity"
                  min="1"
                  [class.is-invalid]="isFieldInvalid('quantity')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('quantity')">
                  Quantity must be greater than zero.
                </div>
              </div>

              <!-- Paper / Card Size -->
              <div class="form-field">
                <label for="paperSize" class="field-label">Paper / Card Size</label>
                <input 
                  type="text" 
                  id="paperSize" 
                  formControlName="paperSize" 
                  class="form-control"
                  placeholder="Enter paper or card size (e.g. 23 × 36 inches)"
                />
              </div>

              <!-- Paper / Card Type -->
              <div class="form-field">
                <label for="paperType" class="field-label">Paper / Card Type</label>
                <input 
                  type="text" 
                  id="paperType" 
                  formControlName="paperType" 
                  class="form-control"
                  placeholder="Enter material name (e.g. Art Card)"
                />
              </div>

              <!-- GSM -->
              <div class="form-field">
                <label for="gsm" class="field-label">GSM</label>
                <input 
                  type="number" 
                  id="gsm" 
                  formControlName="gsm" 
                  class="form-control"
                  placeholder="Enter paper GSM (e.g. 300)"
                  min="1"
                  [class.is-invalid]="isFieldInvalid('gsm')"
                />
                <div class="invalid-feedback" *ngIf="isFieldInvalid('gsm')">
                  GSM must be a positive number.
                </div>
              </div>
            </div>
          </section>

          <!-- STEP 4: Printing Details Section -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">🖨️</div>
              <div>
                <h2 class="section-title">Printing Details</h2>
                <p class="section-desc">Press, machine, operator and production schedule</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Printing Sheet Size -->
              <div class="form-field">
                <label for="printingSheetSize" class="field-label">Printing Sheet Size</label>
                <input 
                  type="text" 
                  id="printingSheetSize" 
                  formControlName="printingSheetSize" 
                  class="form-control"
                  placeholder="Enter printing sheet size"
                />
              </div>

              <!-- Printing Colors Dropdown -->
              <div class="form-field">
                <label for="printingColors" class="field-label">Printing Colors</label>
                <select id="printingColors" formControlName="printingColors" class="form-select">
                  <option value="">-- Select Colors --</option>
                  <option *ngFor="let col of printingColorsOptions" [value]="col">
                    {{ col }}
                  </option>
                </select>
              </div>

              <!-- Printing Side Dropdown -->
              <div class="form-field">
                <label for="printingSide" class="field-label">Printing Side</label>
                <select id="printingSide" formControlName="printingSide" class="form-select">
                  <option value="">-- Select Printing Side --</option>
                  <option value="Single Side">Single Side</option>
                  <option value="Double Side">Double Side</option>
                </select>
              </div>

              <!-- Printing Method Dropdown -->
              <div class="form-field">
                <label for="printingMethod" class="field-label">Printing Method</label>
                <select id="printingMethod" formControlName="printingMethod" class="form-select">
                  <option value="">-- Select Printing Method --</option>
                  <option value="Offset Printing">Offset Printing</option>
                  <option value="Digital Printing">Digital Printing</option>
                  <option value="Screen Printing">Screen Printing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Conditional: Printing Method Other -->
              <div class="form-field" *ngIf="jobSheetForm.get('printingMethod')?.value === 'Other'">
                <label for="printingMethodOther" class="field-label required">Specify Other Printing Method</label>
                <input 
                  type="text" 
                  id="printingMethodOther" 
                  formControlName="printingMethodOther" 
                  class="form-control"
                  placeholder="Specify custom printing method"
                />
              </div>

              <!-- Printing Machine -->
              <div class="form-field">
                <label for="printingMachine" class="field-label">Printing Machine</label>
                <input 
                  type="text" 
                  id="printingMachine" 
                  formControlName="printingMachine" 
                  class="form-control"
                  placeholder="Enter machine name"
                />
              </div>

              <!-- Printing Operator -->
              <div class="form-field">
                <label for="printingOperator" class="field-label">Printing Operator</label>
                <input 
                  type="text" 
                  id="printingOperator" 
                  formControlName="printingOperator" 
                  class="form-control"
                  placeholder="Enter operator name"
                />
              </div>

              <!-- Printing Start Date -->
              <div class="form-field">
                <label for="printingStartDate" class="field-label">Printing Start Date</label>
                <input 
                  type="date" 
                  id="printingStartDate" 
                  formControlName="printingStartDate" 
                  class="form-control"
                />
              </div>

              <!-- Printing Completion Date -->
              <div class="form-field">
                <label for="printingCompletionDate" class="field-label">Printing Completion Date</label>
                <input 
                  type="date" 
                  id="printingCompletionDate" 
                  formControlName="printingCompletionDate" 
                  class="form-control"
                  [class.is-invalid]="hasDateOrderError()"
                />
                <div class="invalid-feedback" *ngIf="hasDateOrderError()">
                  Completion date cannot be earlier than start date.
                </div>
              </div>
            </div>
          </section>

          <!-- STEP 5: Finishing Details Section -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">✂️</div>
              <div>
                <h2 class="section-title">Finishing Details</h2>
                <p class="section-desc">Post-press treatments, binding, coating, and packaging</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Lamination -->
              <div class="form-field">
                <label for="lamination" class="field-label">Lamination</label>
                <select id="lamination" formControlName="lamination" class="form-select">
                  <option value="">-- Select Lamination --</option>
                  <option value="None">None</option>
                  <option value="Gloss">Gloss</option>
                  <option value="Matte">Matte</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Conditional: Lamination Other -->
              <div class="form-field" *ngIf="jobSheetForm.get('lamination')?.value === 'Other'">
                <label for="laminationOther" class="field-label required">Specify Lamination Type</label>
                <input 
                  type="text" 
                  id="laminationOther" 
                  formControlName="laminationOther" 
                  class="form-control"
                  placeholder="Specify custom lamination (e.g. Soft Touch, Velvet)"
                />
              </div>

              <!-- Die Cutting -->
              <div class="form-field">
                <label for="dieCutting" class="field-label">Die Cutting</label>
                <select id="dieCutting" formControlName="dieCutting" class="form-select">
                  <option value="">-- Select Die Cutting --</option>
                  <option value="Required">Required</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>

              <!-- Binding -->
              <div class="form-field">
                <label for="binding" class="field-label">Binding</label>
                <select id="binding" formControlName="binding" class="form-select">
                  <option value="">-- Select Binding --</option>
                  <option value="None">None</option>
                  <option value="Perfect Binding">Perfect Binding</option>
                  <option value="Saddle Stitch">Saddle Stitch</option>
                  <option value="Spiral Binding">Spiral Binding</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Conditional: Binding Other -->
              <div class="form-field" *ngIf="jobSheetForm.get('binding')?.value === 'Other'">
                <label for="bindingOther" class="field-label required">Specify Binding Type</label>
                <input 
                  type="text" 
                  id="bindingOther" 
                  formControlName="bindingOther" 
                  class="form-control"
                  placeholder="Specify custom binding (e.g. Hardcover, Wire-O)"
                />
              </div>

              <!-- UV Coating -->
              <div class="form-field">
                <label for="uvCoating" class="field-label">UV Coating</label>
                <select id="uvCoating" formControlName="uvCoating" class="form-select">
                  <option value="">-- Select UV Coating --</option>
                  <option value="Required">Required</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>

              <!-- Packing -->
              <div class="form-field">
                <label for="packing" class="field-label">Packing</label>
                <select id="packing" formControlName="packing" class="form-select">
                  <option value="">-- Select Packing --</option>
                  <option value="Required">Required</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>

              <!-- Packing Instructions (Full width) -->
              <div class="form-field full-width">
                <label for="packingInstructions" class="field-label">Packing Instructions</label>
                <textarea 
                  id="packingInstructions" 
                  formControlName="packingInstructions" 
                  class="form-control textarea"
                  rows="3"
                  placeholder="Enter packing instructions (e.g. 500 pcs per box, shrink-wrap bundles of 50)"
                ></textarea>
              </div>
            </div>
          </section>

          <!-- STEP 6: Special Instructions Section -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">📝</div>
              <div>
                <h2 class="section-title">Special Instructions</h2>
                <p class="section-desc">Additional remarks for quality control and delivery</p>
              </div>
            </div>

            <div class="fields-grid">
              <div class="form-field full-width">
                <label for="specialInstructions" class="field-label">Additional Production Instructions</label>
                <textarea 
                  id="specialInstructions" 
                  formControlName="specialInstructions" 
                  class="form-control textarea"
                  rows="4"
                  placeholder="Enter any special printing, finishing, quality control or delivery instructions."
                ></textarea>
              </div>
            </div>
          </section>

          <!-- STEP 7: Production Approval Section -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">✍️</div>
              <div>
                <h2 class="section-title">Production Approval</h2>
                <p class="section-desc">Verification, sign-off and floor authorization</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Production Supervisor -->
              <div class="form-field">
                <label for="productionSupervisor" class="field-label">Production Supervisor</label>
                <input 
                  type="text" 
                  id="productionSupervisor" 
                  formControlName="productionSupervisor" 
                  class="form-control"
                  placeholder="Enter supervisor name"
                />
              </div>

              <!-- Authorized By -->
              <div class="form-field">
                <label for="authorizedBy" class="field-label">Authorized By</label>
                <input 
                  type="text" 
                  id="authorizedBy" 
                  formControlName="authorizedBy" 
                  class="form-control"
                  placeholder="Enter authorized person's name"
                />
              </div>
            </div>
          </section>

          <!-- STEP 8: Form Action Buttons -->
          <footer class="form-actions-bar">
            <div class="actions-left">
              <button 
                type="button" 
                class="btn btn-secondary btn-reset" 
                (click)="onResetClick()"
                title="Clear all fields in this form"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>Reset Form</span>
              </button>
            </div>

            <div class="actions-right">
              <!-- Save to Database Button -->
              <button 
                type="button" 
                class="btn btn-save" 
                (click)="onSaveToDatabase()"
                [disabled]="isSaving()"
                title="Save current details into database"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>{{ isSaving() ? 'Saving...' : (currentSheetId() ? 'Update in Database' : 'Save to Database') }}</span>
              </button>

              <!-- Print / Save & Print Button -->
              <button 
                type="submit" 
                class="btn btn-primary btn-print"
                [disabled]="isSaving()"
                title="Print Job Sheet (Ctrl+P)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Print Job Sheet</span>
              </button>
            </div>
          </footer>

        </form>

        <!-- Live Sheet Preview (Optional Screen Preview before print) -->
        <section class="live-preview-section" *ngIf="showLivePreview()">
          <div class="preview-notice-bar">
            <span>📄 <strong>Live Print Sheet Preview:</strong> This is how your document prints on A4 white paper.</span>
            <button type="button" class="btn-print-direct" (click)="onSaveAndPrint()">🖨️ Print Now</button>
          </div>
          <ng-container *ngTemplateOutlet="ticketTemplate"></ng-container>
        </section>

      </div>

      <!-- ====================================================================== -->
      <!-- A4 PRINT DOCUMENT (ALWAYS PRINTS CLEANLY TO A4 PAPER / PDF) -->
      <!-- ====================================================================== -->
      <div class="print-only">
        <ng-container *ngTemplateOutlet="ticketTemplate"></ng-container>
      </div>

      <!-- Reusable Clean Job Ticket Template -->
      <ng-template #ticketTemplate>
        <article class="job-ticket-sheet" id="printable-job-sheet">
          
          <!-- Document Header with Official Logo -->
          <header class="sheet-doc-header">
            <div class="brand-block">
              <img src="zeropixel_logo.png" alt="Zero Pixel" class="sheet-logo-img" onerror="this.src='logo.png'" />
              <div class="brand-text-block">
                <div class="brand-sub">Packaging & Commercial Printing Press</div>
                <div class="brand-contacts">
                  <span>📍 Main Boulevard, Gulberg III, Lahore, Pakistan</span>
                  <span class="sep">•</span>
                  <span>📞 +92 300 1234567</span>
                  <span class="sep">•</span>
                  <span>✉️ info&#64;zeropixel.pk</span>
                </div>
              </div>
            </div>

            <div class="ticket-title-block">
              <div class="ticket-badge">PRODUCTION JOB TICKET</div>
              <div class="ticket-job-number">{{ formVal.jobCardNumber || 'JOB-001' }}</div>
              <div class="ticket-meta-print-date">Printed: {{ currentPrintTimestamp }}</div>
            </div>
          </header>

          <div class="divider-line"></div>

          <!-- Highlight Summary Grid (4 KPI Blocks with Brand Accents) -->
          <section class="ticket-summary-grid">
            <div class="summary-cell">
              <span class="cell-label">JOB CARD NUMBER</span>
              <span class="cell-val bold-order">{{ formVal.jobCardNumber || 'JOB-001' }}</span>
            </div>
            <div class="summary-cell">
              <span class="cell-label">JOB DATE</span>
              <span class="cell-val">{{ formatDate(formVal.jobDate) || currentDateFormatted }}</span>
            </div>
            <div class="summary-cell">
              <span class="cell-label">CUSTOMER NAME</span>
              <span class="cell-val">{{ formVal.customerName || '-' }}</span>
            </div>
            <div class="summary-cell">
              <span class="cell-label">TOTAL QUANTITY</span>
              <span class="cell-val highlight-qty">{{ formVal.quantity ? (formVal.quantity | number) : '-' }} <small>pcs</small></span>
            </div>
          </section>

          <!-- Two-Column Information Section -->
          <section class="info-columns-grid">
            <!-- Left: Customer & Substrate Details -->
            <div class="info-card">
              <div class="card-heading">
                <span class="heading-num">1</span>
                <span>CUSTOMER & SUBSTRATE SPECIFICATIONS</span>
              </div>
              <table class="info-table">
                <tr>
                  <td class="lbl">Customer Name:</td>
                  <td class="val bold-val">{{ formVal.customerName || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Job Description:</td>
                  <td class="val">{{ formVal.jobName || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Required Quantity:</td>
                  <td class="val bold-val highlight-cyan">{{ formVal.quantity ? (formVal.quantity | number) : '-' }} pcs</td>
                </tr>
                <tr>
                  <td class="lbl">Paper / Card Size:</td>
                  <td class="val">{{ formVal.paperSize || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Paper / Card Type:</td>
                  <td class="val">{{ formVal.paperType || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">GSM Weight:</td>
                  <td class="val bold-val">{{ formVal.gsm ? (formVal.gsm + ' GSM') : '-' }}</td>
                </tr>
              </table>
            </div>

            <!-- Right: Technical Printing Details -->
            <div class="info-card">
              <div class="card-heading">
                <span class="heading-num">2</span>
                <span>PRESS & PRINTING SPECIFICATIONS</span>
              </div>
              <table class="info-table">
                <tr>
                  <td class="lbl">Sheet Size:</td>
                  <td class="val">{{ formVal.printingSheetSize || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Printing Colors:</td>
                  <td class="val bold-val highlight-cyan">{{ formVal.printingColors || 'Standard CMYK' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Printing Side:</td>
                  <td class="val">{{ formVal.printingSide || 'Single Side' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Printing Method:</td>
                  <td class="val">
                    {{ formVal.printingMethod === 'Other' ? (formVal.printingMethodOther || 'Other') : (formVal.printingMethod || 'Offset Printing') }}
                  </td>
                </tr>
                <tr>
                  <td class="lbl">Machine Assigned:</td>
                  <td class="val bold-val">{{ formVal.printingMachine || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Press Operator:</td>
                  <td class="val bold-val">{{ formVal.printingOperator || '-' }}</td>
                </tr>
                <tr>
                  <td class="lbl">Production Dates:</td>
                  <td class="val">{{ formatDate(formVal.printingStartDate) || '-' }} ➔ {{ formatDate(formVal.printingCompletionDate) || '-' }}</td>
                </tr>
              </table>
            </div>
          </section>

          <!-- Section 3: Finishing & Post-Press Table -->
          <section class="specs-table-section">
            <div class="section-heading">
              <span class="heading-num">3</span>
              <span>FINISHING & POST-PRESS PROCESSES</span>
            </div>

            <table class="sheet-data-table">
              <thead>
                <tr>
                  <th>Lamination</th>
                  <th>Die Cutting</th>
                  <th>Binding</th>
                  <th>UV Coating</th>
                  <th>Packing Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="bold-cell">{{ formVal.lamination === 'Other' ? (formVal.laminationOther || 'Other') : (formVal.lamination || 'None') }}</td>
                  <td class="bold-cell">{{ formVal.dieCutting || 'Not Required' }}</td>
                  <td class="bold-cell">{{ formVal.binding === 'Other' ? (formVal.bindingOther || 'Other') : (formVal.binding || 'None') }}</td>
                  <td class="bold-cell">{{ formVal.uvCoating || 'Not Required' }}</td>
                  <td class="bold-cell">{{ formVal.packing || 'Standard Carton Packing' }}</td>
                </tr>
                <tr *ngIf="formVal.packingInstructions">
                  <td colspan="5" class="packing-inst-row">
                    <strong>Packing Instructions:</strong> {{ formVal.packingInstructions }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- Section 4: Special Instructions & Quality Checklist -->
          <section class="instructions-section">
            <div class="section-heading">
              <span class="heading-num">4</span>
              <span>SPECIAL FLOOR INSTRUCTIONS & QUALITY CONTROLS</span>
            </div>
            <div class="instructions-box">
              <div *ngIf="formVal.specialInstructions" class="custom-instruction">
                <strong>Special Remarks:</strong> {{ formVal.specialInstructions }}
              </div>
              <div class="standard-instructions">
                <strong>Standard Press & Finishing Checklist:</strong>
                <ol>
                  <li>Inspect CTP plate registration and color balance before full production run.</li>
                  <li>Check substrate caliper, GSM, and grain direction for accurate folding and creasing.</li>
                  <li>Allow sufficient ink curing/drying time before lamination or UV coating.</li>
                  <li>Verify count per packet/bundle and label carton securely with Job Card Number.</li>
                </ol>
              </div>
            </div>
          </section>

          <!-- Section 5: Four Physical Sign-Off Boxes (Floor Accountability) -->
          <footer class="sheet-signoff-section">
            <div class="signoff-box">
              <div class="signoff-title">1. Pre-Press & CTP</div>
              <div class="signoff-sub">Plates checked & approved</div>
              <div class="signoff-line"></div>
              <div class="signoff-meta">Sign & Date</div>
            </div>

            <div class="signoff-box">
              <div class="signoff-title">2. Press Operator</div>
              <div class="signoff-sub">Run sheets: ______ Waste: ______</div>
              <div class="signoff-line"></div>
              <div class="signoff-meta">{{ formVal.printingOperator || 'Operator Sign & Date' }}</div>
            </div>

            <div class="signoff-box">
              <div class="signoff-title">3. Post-Press & QC</div>
              <div class="signoff-sub">Finishing, cut & count verified</div>
              <div class="signoff-line"></div>
              <div class="signoff-meta">QC Inspector Sign</div>
            </div>

            <div class="signoff-box">
              <div class="signoff-title">4. Production Approval</div>
              <div class="signoff-sub">
                {{ formVal.productionSupervisor ? ('Sup: ' + formVal.productionSupervisor) : 'Supervisor' }} / 
                {{ formVal.authorizedBy ? ('Auth: ' + formVal.authorizedBy) : 'Authorized' }}
              </div>
              <div class="signoff-line"></div>
              <div class="signoff-meta">Final Authorizer Sign</div>
            </div>
          </footer>

          <!-- Bottom Footer -->
          <div class="sheet-bottom-bar">
            <span>Zero Pixel ERP • Production Routing & Press Operations System</span>
            <span>Confidential Internal Job Document • Not For Customer Handover</span>
          </div>
        </article>
      </ng-template>

    </div>
  `,
  styles: [`
    /* ==========================================================================
       HOST WRAPPER & SCREEN STYLES
       ========================================================================== */
    .production-sheet-wrapper {
      padding: 24px 32px 48px 32px;
      min-height: 100vh;
      background: #f8fafc;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .screen-view {
      max-width: 1080px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;

      a {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s;
        &:hover { color: #0284c7; }
      }

      .sep { color: #94a3b8; }
      .active-crumb {
        color: #0f172a;
        font-weight: 600;
      }
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.025em;
    }

    .page-subtitle {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
      margin: 0 0 2px 0;
    }

    .page-instruction {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .header-right-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn-preview-toggle {
      background: #e0f2fe;
      border: 1px solid #7dd3fc;
      color: #0369a1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: #bae6fd;
      }
    }

    .btn-new {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.15s;

      &:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
    }

    /* Saved Sheets Bar (Database Loader) */
    .saved-sheets-bar {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 22px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .saved-sheets-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .saved-field {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1 1 450px;
    }

    .saved-label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .saved-dropdown {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      color: #0f172a;
      font-size: 13.5px;
      font-weight: 500;
      outline: none;
      transition: border-color 0.15s;

      &:focus {
        border-color: #0284c7;
        background: #ffffff;
      }
    }

    .saved-meta {
      display: flex;
      align-items: center;
      gap: 10px;

      .db-badge {
        font-size: 12px;
        font-weight: 700;
        background: #dcfce7;
        color: #15803d;
        padding: 4px 10px;
        border-radius: 6px;
      }

      .btn-delete-saved {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        color: #b91c1c;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        &:hover {
          background: #ef4444;
          color: #ffffff;
        }
      }
    }

    /* Form Layout */
    .job-sheet-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Form Section Cards */
    .form-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px 28px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;

      .section-icon {
        font-size: 22px;
        line-height: 1;
      }

      .section-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 2px 0;
        letter-spacing: -0.01em;
      }

      .section-desc {
        font-size: 12.5px;
        color: #64748b;
        margin: 0;
      }
    }

    /* Two-Column Form Grid on Desktop */
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.full-width {
        grid-column: 1 / -1;
      }
    }

    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 4px;

      &.required::after {
        content: "*";
        color: #ef4444;
        font-weight: bold;
      }
    }

    .form-control,
    .form-select {
      height: 40px;
      padding: 8px 12px;
      font-size: 13.5px;
      font-family: inherit;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
      box-sizing: border-box;
      width: 100%;

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }

      &.is-invalid {
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
      }
    }

    .form-control.textarea {
      height: auto;
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .invalid-feedback {
      font-size: 11.5px;
      font-weight: 500;
      color: #ef4444;
      margin-top: 2px;
    }

    /* Form Actions Bar (Bottom) */
    .form-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      gap: 16px;
      flex-wrap: wrap;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 42px;
        padding: 0 20px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease-in-out;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-secondary {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #334155;

        &:hover:not(:disabled) {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #94a3b8;
        }
      }

      .btn-save {
        background: #10b981;
        color: #ffffff;
        border-color: #059669;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);

        &:hover:not(:disabled) {
          background: #059669;
        }
      }

      .btn-primary {
        background: #0284c7;
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);

        &:hover:not(:disabled) {
          background: #0369a1;
          box-shadow: 0 3px 6px rgba(2, 132, 199, 0.35);
        }
      }

      .actions-right {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    /* Live Preview Section on Screen */
    .live-preview-section {
      margin-top: 32px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .preview-notice-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        padding: 10px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 13.5px;
        color: #0369a1;

        .btn-print-direct {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12.5px;
          &:hover { background: #0369a1; }
        }
      }
    }

    /* Screen vs Print Viewports */
    .print-only {
      display: none;
    }

    /* ==========================================================================
       THE PHYSICAL JOB TICKET SHEET STYLING (BRANDED & HIGH-CONTRAST)
       ========================================================================== */
    .job-ticket-sheet {
      width: 100%;
      background: #ffffff !important;
      color: #0f172a !important;
      border: 2px solid #0099dd !important;
      border-radius: 8px;
      padding: 24px 28px;
      box-sizing: border-box;
      line-height: 1.4;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      * {
        color-scheme: light !important;
      }
    }

    /* Header & Brand Logo */
    .sheet-doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 10px;
    }

    .brand-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      .sheet-logo-img {
        width: 320px;
        max-width: 350px;
        height: auto;
        max-height: 90px;
        object-fit: contain;
        display: block;
      }

      .brand-text-block {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 3px;
      }

      .brand-sub {
        font-size: 13px;
        font-weight: 800;
        color: #1e293b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .brand-contacts {
        font-size: 11px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
        flex-wrap: wrap;

        .sep { color: #94a3b8; font-weight: bold; }
      }
    }

    .ticket-title-block {
      text-align: right;

      .ticket-badge {
        display: inline-block;
        background: #0099dd;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.2px;
        padding: 4px 10px;
        border-radius: 4px;
        text-transform: uppercase;
      }

      .ticket-job-number {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #0f172a;
        margin-top: 3px;
        font-family: "Courier New", Courier, monospace;
      }

      .ticket-meta-print-date {
        font-size: 10.5px;
        color: #64748b;
        margin-top: 2px;
      }
    }

    .divider-line {
      height: 3px;
      background: #0099dd;
      margin: 12px 0 16px 0;
      border-radius: 2px;
    }

    /* Summary Grid (4 KPI Blocks) */
    .ticket-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }

    .summary-cell {
      border: 1px solid #cbd5e1;
      border-top: 3px solid #0099dd;
      background: #f8fafc !important;
      padding: 8px 12px;
      border-radius: 4px;

      .cell-label {
        display: block;
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #64748b;
        margin-bottom: 3px;
        text-transform: uppercase;
      }

      .cell-val {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }

      .bold-order {
        font-family: "Courier New", Courier, monospace;
        font-size: 15px;
      }

      .highlight-qty {
        color: #0284c7;
      }
    }

    /* Two-Column Info Cards */
    .info-columns-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }

    .info-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff !important;

      .card-heading {
        background: #f0f9ff !important;
        border-bottom: 1px solid #bae6fd;
        padding: 7px 12px;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #0284c7;
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;

        .heading-num {
          background: #0284c7;
          color: #ffffff;
          width: 17px;
          height: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 10.5px;
          font-weight: bold;
        }
      }
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      background: #ffffff !important;

      tr {
        background: #ffffff !important;
      }

      td {
        padding: 6px 12px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: top;
        background: #ffffff !important;
        color: #0f172a !important;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .lbl {
        width: 145px;
        color: #334155 !important;
        font-weight: 700;
        background: #f8fafc !important;
        border-right: 1px solid #f1f5f9;
      }

      .val {
        color: #0f172a !important;
        font-weight: 600;
        background: #ffffff !important;
      }

      .bold-val {
        font-weight: 800;
      }

      .highlight-cyan {
        color: #0284c7 !important;
      }
    }

    /* Specs Table */
    .specs-table-section {
      margin-bottom: 16px;

      .section-heading {
        background: #f0f9ff !important;
        border: 1px solid #cbd5e1;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        padding: 7px 12px;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #0284c7;
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;

        .heading-num {
          background: #0284c7;
          color: #ffffff;
          width: 17px;
          height: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 10.5px;
          font-weight: bold;
        }
      }
    }

    .sheet-data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      background: #ffffff !important;

      thead {
        background: #0284c7 !important;
        color: #ffffff !important;

        th {
          padding: 7px 12px;
          font-size: 11px;
          font-weight: 800;
          text-align: left;
          letter-spacing: 0.5px;
          border-right: 1px solid #38bdf8;
          color: #ffffff !important;
          background: #0284c7 !important;

          &:last-child {
            border-right: none;
          }
        }
      }

      tbody {
        background: #ffffff !important;

        tr {
          background: #ffffff !important;
        }

        td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          background: #ffffff !important;
          color: #0f172a !important;
          font-weight: 600;

          &:last-child {
            border-right: none;
          }
        }

        .bold-cell {
          font-weight: 700;
        }

        .packing-inst-row {
          background: #f8fafc !important;
          color: #334155 !important;
          padding: 8px 12px;
          border-bottom: none;
        }
      }
    }

    /* Instructions Section */
    .instructions-section {
      margin-bottom: 16px;

      .section-heading {
        background: #f0f9ff !important;
        border: 1px solid #cbd5e1;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        padding: 7px 12px;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #0284c7;
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;

        .heading-num {
          background: #0284c7;
          color: #ffffff;
          width: 17px;
          height: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 10.5px;
          font-weight: bold;
        }
      }
    }

    .instructions-box {
      border: 1px solid #cbd5e1;
      border-radius: 0 0 4px 4px;
      padding: 10px 14px;
      background: #f8fafc !important;
      font-size: 11.5px;

      .custom-instruction {
        padding: 8px 12px;
        background: #fef3c7 !important;
        border-left: 4px solid #f59e0b;
        color: #92400e !important;
        font-weight: 700;
        margin-bottom: 8px;
        border-radius: 2px;
      }

      .standard-instructions {
        color: #475569 !important;
        ol {
          margin: 4px 0 0 16px;
          padding: 0;
          li { margin-bottom: 2px; }
        }
      }
    }

    /* Sign-off Boxes */
    .sheet-signoff-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 2px dashed #94a3b8;
    }

    .signoff-box {
      border: 1px solid #94a3b8;
      border-radius: 4px;
      padding: 8px 10px;
      background: #ffffff !important;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .signoff-title {
        font-size: 10.5px;
        font-weight: 800;
        color: #0f172a !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .signoff-sub {
        font-size: 9px;
        color: #64748b !important;
        margin-top: 2px;
      }

      .signoff-line {
        border-bottom: 1px dotted #94a3b8;
        margin-top: 22px;
      }

      .signoff-meta {
        font-size: 9px;
        color: #475569 !important;
        text-align: right;
        margin-top: 2px;
        font-weight: 600;
      }
    }

    .sheet-bottom-bar {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }

    /* ==========================================================================
       DARK MODE OVERRIDES (SCREEN ONLY - NEVER AFFECTS PRINT)
       ========================================================================== */
        /* ==========================================================================
       A4 PRINT MEDIA STYLES (EXACT INDUSTRIAL SHEET TICKET)
       ========================================================================== */
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 8mm 10mm;
      }

      /* Hide screen-only content */
      .no-print,
      .screen-view,
      nav,
      aside,
      header.app-header,
      .sidebar-wrapper,
      .topbar-wrapper {
        display: none !important;
      }

      /* Reset body & wrapper */
      body, html {
        background: #ffffff !important;
        color: #000000 !important;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        font-size: 10pt !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      .production-sheet-wrapper {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
        margin: 0 !important;
        min-height: auto !important;
      }

      /* Show print document */
      .print-only {
        display: block !important;
      }

      .job-ticket-sheet {
        width: 100% !important;
        max-width: 100% !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        border: 2px solid #0099dd !important;
        padding: 14px 18px !important;
        box-sizing: border-box !important;
        page-break-inside: avoid !important;
        box-shadow: none !important;
      }

      .sheet-logo-img {
        width: 300px !important;
        max-width: 340px !important;
        height: auto !important;
        max-height: 85px !important;
        object-fit: contain !important;
        display: block !important;
        margin-bottom: 4px !important;
      }

      .summary-cell {
        background: #f8fafc !important;
        background-color: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-top: 3px solid #0099dd !important;
      }

      .info-card {
        background: #ffffff !important;
        background-color: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }

      .info-card .card-heading {
        background: #f0f9ff !important;
        background-color: #f0f9ff !important;
        color: #0284c7 !important;
        border-bottom: 1px solid #bae6fd !important;
      }

      .info-table {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .info-table tr {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .info-table td {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-bottom: 1px solid #f1f5f9 !important;
      }

      .info-table td.lbl {
        color: #334155 !important;
        background: #f8fafc !important;
        background-color: #f8fafc !important;
        font-weight: 700 !important;
      }

      .info-table td.val {
        color: #0f172a !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .sheet-data-table {
        background: #ffffff !important;
        background-color: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }

      .sheet-data-table thead th {
        background: #0284c7 !important;
        background-color: #0284c7 !important;
        color: #ffffff !important;
      }

      .sheet-data-table tbody tr {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .sheet-data-table tbody td {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-bottom: 1px solid #cbd5e1 !important;
        border-right: 1px solid #cbd5e1 !important;
      }

      .instructions-box {
        background: #f8fafc !important;
        background-color: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
      }

      .signoff-box {
        background: #ffffff !important;
        background-color: #ffffff !important;
        border: 1px solid #94a3b8 !important;
      }

      /* Force exact printer color output */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `]
})
export class ProductionSheetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private sheetService = inject(ProductionJobSheetService);

  // Printing colors 1 to 10
  printingColorsOptions: string[] = [
    '1 Color',
    '2 Colors',
    '3 Colors',
    '4 Colors',
    '5 Colors',
    '6 Colors',
    '7 Colors',
    '8 Colors',
    '9 Colors',
    '10 Colors'
  ];

  // Database saved sheets
  savedSheets = signal<ProductionJobSheet[]>([]);
  currentSheetId = signal<number | null>(null);
  isSaving = signal<boolean>(false);
  showLivePreview = signal<boolean>(false);

  // Formatted dates
  currentDateFormatted: string = '';
  currentPrintTimestamp: string = '';

  // Angular Reactive Form Group
  jobSheetForm!: FormGroup;

  ngOnInit(): void {
    const today = new Date();
    const isoDate = today.toISOString().substring(0, 10); // YYYY-MM-DD
    this.currentDateFormatted = isoDate;
    this.updatePrintTimestamp();

    // Initialize Form with default values & validators
    this.jobSheetForm = this.fb.group({
      // Step 3: Job Information
      jobCardNumber: ['', [Validators.required, Validators.maxLength(50)]],
      jobDate: [isoDate, [Validators.required]],
      customerName: ['', [Validators.required, Validators.maxLength(100)]],
      jobName: ['', [Validators.required, Validators.maxLength(150)]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      paperSize: [''],
      paperType: [''],
      gsm: [null, [Validators.min(1)]],

      // Step 4: Printing Details
      printingSheetSize: [''],
      printingColors: [''],
      printingSide: [''],
      printingMethod: [''],
      printingMethodOther: [''],
      printingMachine: [''],
      printingOperator: [''],
      printingStartDate: [''],
      printingCompletionDate: [''],

      // Step 5: Finishing Details
      lamination: [''],
      laminationOther: [''],
      dieCutting: [''],
      binding: [''],
      bindingOther: [''],
      uvCoating: [''],
      packing: [''],
      packingInstructions: [''],

      // Step 6: Special Instructions
      specialInstructions: [''],

      // Step 7: Production Approval
      productionSupervisor: [''],
      authorizedBy: ['']
    }, {
      validators: [dateOrderValidator]
    });

    // Load saved sheets from database
    this.loadSavedSheets();
  }

  get formVal() {
    return this.jobSheetForm.value;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.jobSheetForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasDateOrderError(): boolean {
    return !!(this.jobSheetForm.errors?.['completionBeforeStart'] && 
             (this.jobSheetForm.get('printingCompletionDate')?.touched || this.jobSheetForm.get('printingStartDate')?.touched));
  }

  updatePrintTimestamp(): void {
    const now = new Date();
    this.currentPrintTimestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Load all saved sheets from PostgreSQL database
   */
  loadSavedSheets(): void {
    this.sheetService.getAll().subscribe({
      next: (list) => {
        this.savedSheets.set(list || []);
      },
      error: (err) => {
        console.error('Failed to load saved job sheets from database:', err);
      }
    });
  }

  /**
   * User picks a saved sheet from the dropdown
   */
  onSelectSavedSheet(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value ? Number(select.value) : null;

    if (!id) {
      this.startNewSheet();
      return;
    }

    const sheet = this.savedSheets().find(s => s.id === id);
    if (sheet) {
      this.populateFormWithSheet(sheet);
    }
  }

  populateFormWithSheet(s: ProductionJobSheet): void {
    this.currentSheetId.set(s.id ?? null);

    const toIsoDate = (d?: string | null) => d ? new Date(d).toISOString().substring(0, 10) : '';

    this.jobSheetForm.patchValue({
      jobCardNumber: s.jobCardNumber,
      jobDate: toIsoDate(s.jobDate) || this.currentDateFormatted,
      customerName: s.customerName,
      jobName: s.jobName,
      quantity: s.quantity,
      paperSize: s.paperSize || '',
      paperType: s.paperType || '',
      gsm: s.gsm ?? null,

      printingSheetSize: s.printingSheetSize || '',
      printingColors: s.printingColors || '',
      printingSide: s.printingSide || '',
      printingMethod: s.printingMethod || '',
      printingMethodOther: s.printingMethodOther || '',
      printingMachine: s.printingMachine || '',
      printingOperator: s.printingOperator || '',
      printingStartDate: toIsoDate(s.printingStartDate),
      printingCompletionDate: toIsoDate(s.printingCompletionDate),

      lamination: s.lamination || '',
      laminationOther: s.laminationOther || '',
      dieCutting: s.dieCutting || '',
      binding: s.binding || '',
      bindingOther: s.bindingOther || '',
      uvCoating: s.uvCoating || '',
      packing: s.packing || '',
      packingInstructions: s.packingInstructions || '',

      specialInstructions: s.specialInstructions || '',
      productionSupervisor: s.productionSupervisor || '',
      authorizedBy: s.authorizedBy || ''
    });

    this.toast.info(`Loaded sheet #${s.jobCardNumber} from database`);
  }

  /**
   * Start fresh empty job sheet
   */
  startNewSheet(): void {
    this.currentSheetId.set(null);
    this.jobSheetForm.reset({
      jobDate: this.currentDateFormatted
    });
    this.toast.info('New Job Sheet started');
  }

  /**
   * Delete current saved sheet from database
   */
  deleteCurrentSheet(): void {
    const id = this.currentSheetId();
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this job sheet from the database?')) {
      return;
    }

    this.sheetService.delete(id).subscribe({
      next: () => {
        this.toast.success('Job Sheet deleted from database');
        this.startNewSheet();
        this.loadSavedSheets();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.toast.error('Failed to delete job sheet');
      }
    });
  }

  /**
   * Save button handler: saves or updates in database
   */
  onSaveToDatabase(onSuccess?: () => void): void {
    if (this.jobSheetForm.invalid) {
      this.jobSheetForm.markAllAsTouched();
      const firstInvalidEl = document.querySelector('.is-invalid');
      if (firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.toast.error('Please fill all required fields correctly before saving.');
      return;
    }

    this.isSaving.set(true);
    const formValue = this.jobSheetForm.value;
    const currentId = this.currentSheetId() ?? undefined;

    this.sheetService.save(formValue, currentId).subscribe({
      next: (saved) => {
        this.isSaving.set(false);
        this.currentSheetId.set(saved.id ?? null);
        this.toast.success(`Job Sheet #${saved.jobCardNumber} saved successfully to database!`);
        this.loadSavedSheets();
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Failed to save job sheet to database:', err);
        this.toast.error(err.error?.message || 'Failed to save job sheet to database.');
      }
    });
  }

  /**
   * Print button handler: validates, auto-saves to database, and triggers print dialog
   */
  onSaveAndPrint(): void {
    if (this.jobSheetForm.invalid) {
      this.jobSheetForm.markAllAsTouched();
      const firstInvalidEl = document.querySelector('.is-invalid');
      if (firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Auto-save to database, then trigger print
    this.onSaveToDatabase(() => {
      this.updatePrintTimestamp();
      window.print();
    });
  }

  /**
   * Reset Form button handler
   */
  onResetClick(): void {
    const hasData = Object.values(this.jobSheetForm.value).some(val => {
      if (val === null || val === undefined || val === '') return false;
      if (val === this.currentDateFormatted) return false;
      return true;
    });

    if (hasData) {
      const confirmed = window.confirm('Are you sure you want to reset this form? All entered data will be cleared.');
      if (!confirmed) {
        return;
      }
    }

    this.startNewSheet();
  }
}
