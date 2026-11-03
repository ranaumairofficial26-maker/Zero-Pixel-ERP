import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CustomerSelectorComponent } from '../../components/customer-selector/customer-selector.component';
import { Customer } from '../../../customers/models/customer.model';
import { QuotationDetails } from '../../models/quotation.models';

@Component({
  selector: 'app-quotation-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CustomerSelectorComponent
  ],
  template: `
    <div class="quotation-form-page">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading quotation details...</span>
        </div>
      } @else if (quotation) {
        <!-- Locked Banner if Finalized -->
        @if (quotation.activeRevision.status !== 'Draft') {
          <div class="locked-banner">
            <div class="banner-left">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div>
                <h4>Revision {{ quotation.activeRevision.revisionNumber }} is Finalized (Locked)</h4>
                <p>Finalized revisions cannot be edited directly to preserve historical audit records. Create a new revision to make changes.</p>
              </div>
            </div>
            <button type="button" class="btn-create-rev" [disabled]="isSubmitting" (click)="createNewRevision()">
              Create Revision {{ quotation.activeRevision.revisionNumber + 1 }}
            </button>
          </div>
        }

        <!-- Form Header -->
        <header class="form-header">
          <div class="header-titles">
            <div class="breadcrumbs">
              <a routerLink="/admin/quotations">Smart Quotations</a>
              <span>/</span>
              <a [routerLink]="['/admin/quotations', quotation.quotationId]">{{ quotation.quotationNumber }}</a>
              <span>/</span>
              <span>Edit (Rev {{ quotation.activeRevision.revisionNumber }})</span>
            </div>
            <h1 class="page-title">Edit Quotation: {{ quotation.quotationNumber }}</h1>
          </div>

          <div class="header-actions">
            <a [routerLink]="['/admin/quotations', quotation.quotationId]" class="btn-cancel">Cancel</a>
            @if (quotation.activeRevision.status === 'Draft') {
              <button type="button" class="btn-save-draft" [disabled]="isSubmitting || form.invalid" (click)="save(false)">
                @if (isSubmitting && !isFinalizing) { Saving... } @else { Save Draft }
              </button>
              <button type="button" class="btn-finalize" [disabled]="isSubmitting || form.invalid" (click)="save(true)">
                @if (isSubmitting && isFinalizing) { Finalizing... } @else { Finalize Revision }
              </button>
            }
          </div>
        </header>

        <!-- Compact Sleek Top Mode Selector -->
        <div class="top-mode-selector-bar">
          <button 
            type="button" 
            class="mode-btn" 
            [class.active]="form.get('quotationType')?.value === 'Printing'"
            [disabled]="quotation.activeRevision.status !== 'Draft'"
            (click)="switchQuotationType('Printing')"
          >
            <span class="mode-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            </span>
            <span class="mode-label">Printing</span>
            @if (form.get('quotationType')?.value === 'Printing') {
              <span class="mode-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            }
          </button>

          <button 
            type="button" 
            class="mode-btn" 
            [class.active]="form.get('quotationType')?.value === 'Digital Marketing'"
            [disabled]="quotation.activeRevision.status !== 'Draft'"
            (click)="switchQuotationType('Digital Marketing')"
          >
            <span class="mode-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </span>
            <span class="mode-label">Digital Marketing</span>
            @if (form.get('quotationType')?.value === 'Digital Marketing') {
              <span class="mode-check dm">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            }
          </button>
        </div>

        <form [formGroup]="form" class="quotation-form-grid">
          <!-- Left Column: Customer & Items -->
          <div class="form-main-col">
            <!-- Section 1: Customer Selection -->
            <div class="form-card">
              <div class="card-heading">
                <span class="step-num">1</span>
                <h3>Customer Information</h3>
              </div>

              <div class="customer-picker-area">
                <app-customer-selector
                  [initialCustomer]="{ id: quotation.clientId, name: quotation.customerName, phone: quotation.customerPhone, email: quotation.customerEmail || '', companyName: quotation.contactPerson || '' }"
                  (customerSelected)="onCustomerSelected($event)"
                ></app-customer-selector>
              </div>

              <div class="fields-grid-3">
                <div class="field-item">
                  <label class="field-label">Customer Name <span class="required">*</span></label>
                  <input type="text" formControlName="customerName" class="form-input" />
                </div>

                <div class="field-item">
                  <label class="field-label">Contact Person</label>
                  <input type="text" formControlName="contactPerson" class="form-input" />
                </div>

                <div class="field-item">
                  <label class="field-label">Customer Phone <span class="required">*</span></label>
                  <input type="text" formControlName="customerPhone" class="form-input" />
                </div>

                <div class="field-item">
                  <label class="field-label">Customer Email</label>
                  <input type="email" formControlName="customerEmail" class="form-input" />
                </div>

                <div class="field-item span-2">
                  <label class="field-label">Customer Address</label>
                  <input type="text" formControlName="customerAddress" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Section 2: Items & Specifications -->
            <div class="form-card">
              <div class="card-heading-split">
                <div class="heading-left">
                  <span class="step-num">2</span>
                  <div>
                    <h3>Quotation Items & Specifications</h3>
                    <p class="section-sub">
                      Quotation Type: <strong>{{ form.get('quotationType')?.value }}</strong>
                      @if (isDigitalMarketing) {
                        <span class="badge-dm">Digital Marketing Mode</span>
                      } @else {
                        <span class="badge-print">Printing Mode</span>
                      }
                    </p>
                  </div>
                </div>
                @if (quotation.activeRevision.status === 'Draft') {
                  <button type="button" class="btn-add-item" (click)="addItem()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add {{ isDigitalMarketing ? 'Service' : 'Product' }}
                  </button>
                }
              </div>

                <div class="production-type-card">
                  <div class="prod-type-info">
                    <span class="prod-icon">🏭</span>
                    <div>
                      <label class="prod-label">Production Type <span class="required">*</span></label>
                      <p class="prod-desc">Select whether this {{ isDigitalMarketing ? 'digital marketing' : 'printing' }} quotation will be produced In-House or Outsourced to a vendor.</p>
                    </div>
                  </div>
                  <div class="prod-type-dropdown-wrapper">
                    <select formControlName="productionType" class="prod-type-select-main" (change)="onQuotationProductionTypeChange()">
                      <option value="IN_HOUSE">🏢 In-House Production</option>
                      <option value="OUTSOURCED">🚚 Outsourced Production</option>
                    </select>
                  </div>
                </div>

              <div formArrayName="items" class="items-list">
                @for (itemForm of itemsArray.controls; track $index) {
                  <div [formGroupName]="$index" class="item-block">
                    <div class="item-block-header">
                      <div class="item-header-meta">
                        <span class="item-index-badge">#{{ $index + 1 }}</span>
                        <span class="item-title-preview">{{ itemForm.get('productName')?.value || (isDigitalMarketing ? itemForm.get('serviceCategory')?.value : 'New Item') }}</span>
                        @if (isDigitalMarketing) {
                          <span class="service-chip">{{ itemForm.get('serviceCategory')?.value }}</span>
                        }
                      </div>

                      @if (quotation.activeRevision.status === 'Draft') {
                        <div class="item-controls">
                          @if ($index > 0) {
                            <button type="button" class="btn-ctrl" (click)="moveItem($index, -1)" title="Move Up">↑</button>
                          }
                          @if ($index < itemsArray.length - 1) {
                            <button type="button" class="btn-ctrl" (click)="moveItem($index, 1)" title="Move Down">↓</button>
                          }
                          <button type="button" class="btn-ctrl" (click)="duplicateItem($index)" title="Duplicate Item">📋</button>
                          @if (itemsArray.length > 1) {
                            <button type="button" class="btn-ctrl delete" (click)="removeItem($index)" title="Remove Item">&times;</button>
                          }
                        </div>
                      }
                    </div>

                    <div class="item-block-body">
                      <!-- Base Item Info Row -->
                      <div class="fields-grid-4">
                        @if (isDigitalMarketing) {
                          <div class="field-item">
                            <label class="field-label">Service Category <span class="required">*</span></label>
                            <select formControlName="serviceCategory" class="form-select highlight-select" (change)="onServiceCategoryChanged($index)">
                              @for (cat of digitalMarketingServices; track cat) {
                                <option [value]="cat">{{ cat }}</option>
                              }
                            </select>
                          </div>
                        }

                        <div [class]="isDigitalMarketing ? 'field-item' : 'field-item span-2'">
                          <label class="field-label">{{ isDigitalMarketing ? 'Service Title' : 'Product Name' }} <span class="required">*</span></label>
                          <input type="text" formControlName="productName" class="form-input" />
                        </div>

                        <div class="field-item">
                          <label class="field-label">Production Route</label>
                          <select formControlName="productionType" class="form-select">
                            <option value="IN_HOUSE">🏢 In-House</option>
                            <option value="OUTSOURCED">🚚 Outsourced</option>
                          </select>
                        </div>

                        <div class="field-item">
                          <label class="field-label">Unit</label>
                          <input type="text" formControlName="unit" class="form-input" />
                        </div>
                      </div>

                      <!-- CONDITIONAL: WEBSITE FIELDS -->
                      @if (isDigitalMarketing && itemForm.get('serviceCategory')?.value === 'Website') {
                        <div class="service-specific-box">
                          <div class="fields-grid-2">
                            <div class="field-item">
                              <label class="field-label">Number of Pages <span class="required">*</span></label>
                              <input type="number" formControlName="pagesCount" min="1" class="form-input num" placeholder="e.g. 5" />
                            </div>
                            <div class="field-item">
                              <label class="field-label">Website Scope & Features</label>
                              <input type="text" formControlName="description" class="form-input" placeholder="e.g. Responsive website with contact form & WhatsApp" />
                            </div>
                          </div>
                        </div>
                      }

                      <!-- CONDITIONAL: MARKETING FIELDS -->
                      @if (isDigitalMarketing && itemForm.get('serviceCategory')?.value === 'Marketing') {
                        <div class="service-specific-box">
                          <div class="fields-grid-2">
                            <div class="field-item">
                              <label class="field-label">No. of Posts</label>
                              <input type="number" formControlName="postsCount" min="0" class="form-input num" placeholder="e.g. 12" />
                            </div>
                            <div class="field-item">
                              <label class="field-label">No. of Videos / Reels</label>
                              <input type="number" formControlName="videoCount" min="0" class="form-input num" placeholder="e.g. 4" />
                            </div>
                          </div>
                        </div>
                      }

                      <!-- Printing Specifications (Only for Printing) -->
                      @if (!isDigitalMarketing) {
                        <div class="field-item">
                          <label class="field-label">Item Description / Notes</label>
                          <input type="text" formControlName="description" class="form-input" />
                        </div>

                        <div class="specs-grid">
                          <div class="field-item">
                            <label class="field-label">Size / Dimensions</label>
                            <input type="text" formControlName="sizeDimensions" class="form-input" />
                          </div>

                          <div class="field-item">
                            <label class="field-label">Paper / Material</label>
                            <input type="text" formControlName="material" class="form-input" />
                          </div>

                          <div class="field-item">
                            <label class="field-label">GSM</label>
                            <input type="text" formControlName="gsm" class="form-input" />
                          </div>

                          <div class="field-item">
                            <label class="field-label">Color Specs</label>
                            <input type="text" formControlName="printingColor" class="form-input" />
                          </div>

                          <div class="field-item span-2">
                            <label class="field-label">Finishing Details</label>
                            <input type="text" formControlName="finishing" class="form-input" />
                          </div>
                        </div>
                      }

                      <!-- Pricing & Calculations Row -->
                      <div class="pricing-row">
                        <div class="field-item">
                          <label class="field-label">Quantity <span class="required">*</span></label>
                          <input type="number" formControlName="quantity" min="1" class="form-input num" (input)="recalculateTotals()" />
                        </div>

                        <div class="field-item">
                          <label class="field-label">Total Price / Rate (PKR) <span class="required">*</span></label>
                          <input type="number" formControlName="unitPrice" min="0" step="0.5" class="form-input num" (input)="recalculateTotals()" />
                        </div>

                        <div class="line-total-box">
                          <span class="total-label">Item Total:</span>
                          <span class="total-value">
                            PKR {{ calculateItemTotal(itemForm) | number:'1.2-2' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Section 3: Notes & Terms -->
            <div class="form-card">
              <div class="card-heading">
                <span class="step-num">3</span>
                <h3>Notes & Terms</h3>
              </div>

              <div class="fields-grid-2">
                <div class="field-item">
                  <label class="field-label">Internal Admin Notes (Private)</label>
                  <textarea formControlName="internalNotes" rows="3" class="form-textarea"></textarea>
                </div>

                <div class="field-item">
                  <label class="field-label">Customer-Facing Notes</label>
                  <textarea formControlName="customerNotes" rows="3" class="form-textarea"></textarea>
                </div>

                <div class="field-item span-2">
                  <label class="field-label">Terms & Conditions</label>
                  <textarea formControlName="termsAndConditions" rows="3" class="form-textarea"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Quotation Settings & Summary -->
          <div class="form-side-col">
            <!-- Quotation Settings Card -->
            <div class="form-card">
              <h3>Quotation Details</h3>

              <div class="side-fields">
                <div class="field-item">
                  <label class="field-label">Quotation Number</label>
                  <input type="text" [value]="quotation.quotationNumber" disabled class="form-input disabled" />
                </div>

                <div class="field-item">
                  <label class="field-label">Quotation Type</label>
                  <div class="type-pill-box" [class.dm]="isDigitalMarketing">
                    @if (isDigitalMarketing) {
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                      <span>Digital Marketing</span>
                    } @else {
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                      <span>Printing</span>
                    }
                  </div>
                </div>

                <div class="field-item">
                  <label class="field-label">Quotation Date</label>
                  <input type="date" formControlName="quotationDate" class="form-input" />
                </div>

                <div class="field-item">
                  <label class="field-label">Valid Until</label>
                  <input type="date" formControlName="validUntil" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Pricing & Totals Card -->
            <div class="form-card totals-card">
              <h3>Pricing Summary</h3>

              <div class="totals-breakdown">
                <div class="breakdown-row">
                  <span>Subtotal:</span>
                  <span class="val">PKR {{ subtotal | number:'1.2-2' }}</span>
                </div>

                <!-- Discount Group -->
                <div class="discount-config">
                  <label class="field-label">Discount</label>
                  <div class="discount-inputs">
                    <select formControlName="discountType" class="form-select sm" (change)="recalculateTotals()">
                      <option value="None">No Discount</option>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount</option>
                    </select>
                    @if (form.get('discountType')?.value !== 'None') {
                      <input type="number" formControlName="discountValue" min="0" class="form-input sm num" (input)="recalculateTotals()" />
                    }
                  </div>
                </div>

                @if (discountAmount > 0) {
                  <div class="breakdown-row discount-row">
                    <span>Discount Applied:</span>
                    <span class="val">- PKR {{ discountAmount | number:'1.2-2' }}</span>
                  </div>
                }

                <!-- Tax Group -->
                <div class="tax-config">
                  <label class="field-label">Tax Rate (%)</label>
                  <div class="tax-inputs">
                    <input type="number" formControlName="taxRate" min="0" max="100" class="form-input sm num" (input)="recalculateTotals()" />
                    <span class="tax-preview">+ PKR {{ taxAmount | number:'1.2-2' }}</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="grand-total-row">
                  <span class="grand-label">Grand Total:</span>
                  <span class="grand-val">PKR {{ grandTotal | number:'1.2-2' }}</span>
                </div>
              </div>

              @if (quotation.activeRevision.status === 'Draft') {
                <div class="card-submit-group">
                  <button type="button" class="btn-save-draft full" [disabled]="isSubmitting || form.invalid" (click)="save(false)">
                    Save as Draft
                  </button>
                  <button type="button" class="btn-finalize full" [disabled]="isSubmitting || form.invalid" (click)="save(true)">
                    Finalize Revision
                  </button>
                </div>
              }
            </div>
          </div>
        </form>
      } @else {
        <div class="empty-state-card" style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:40px;text-align:center;">
          <h3 style="margin-top:0;">Quotation Not Available</h3>
          <p style="color:#64748B;">The quotation could not be loaded or was not found.</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
            <button type="button" class="btn-save-draft" (click)="loadQuotation()">Retry</button>
            <a routerLink="/admin/quotations" class="btn-cancel">Back to Quotations</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .production-type-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      gap: 12px;
    }
    .prod-type-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .prod-icon {
      font-size: 22px;
    }
    .prod-label {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      display: block;
    }
    .prod-desc {
      font-size: 11.5px;
      color: #15803D;
      margin: 2px 0 0 0;
    }
    .prod-type-select-main {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #86EFAC;
      background: #fff;
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      outline: none;
      cursor: pointer;
    }
    .quotation-form-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
      zoom: 0.97;
    }
    .loading-state {
      background: #fff;
      padding: 40px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748B;
      font-size: 14px;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #E2E8F0;
      border-top-color: #0099DD;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .locked-banner {
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .banner-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .locked-banner h4 {
      margin: 0 0 4px 0;
      color: #92400E;
      font-size: 14px;
      font-weight: 700;
    }
    .locked-banner p {
      margin: 0;
      color: #B45309;
      font-size: 12.5px;
    }
    .btn-create-rev {
      background: #D97706;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #64748B;
      margin-bottom: 4px;
    }
    .breadcrumbs a {
      color: #0099DD;
      text-decoration: none;
    }
    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .btn-cancel {
      background: #fff;
      color: #64748B;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .btn-save-draft {
      background: #0099DD;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-finalize {
      background: #0F172A;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .top-mode-selector-bar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F1F5F9;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      width: fit-content;
      margin-bottom: 6px;
    }
    .mode-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 6px 14px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: #64748B;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.18s ease-in-out;
    }
    .mode-btn:hover:not(.active):not(:disabled) {
      background: rgba(255, 255, 255, 0.7);
      color: #0F172A;
    }
    .mode-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .mode-btn.active {
      background: #FFFFFF;
      color: #0099DD;
      border-color: #BAE6FD;
      font-weight: 700;
      box-shadow: 0 1px 4px rgba(0, 153, 221, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .mode-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }
    .mode-label {
      letter-spacing: 0.1px;
    }
    .mode-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #E0F2FE;
      color: #0099DD;
      margin-left: 2px;
    }
    .mode-check.dm {
      background: #EEF2FF;
      color: #4F46E5;
    }
    .type-pill-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 700;
      background: #F0FDF4;
      color: #16A34A;
      border: 1px solid #BBF7D0;
      width: fit-content;
    }
    .type-pill-box.dm {
      background: #EEF2FF;
      color: #4F46E5;
      border-color: #C7D2FE;
    }
    .quotation-form-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
      align-items: flex-start;
    }
    .form-main-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-side-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 20px;
    }
    .form-card h3 {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 14px 0;
    }
    .card-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .card-heading h3 {
      margin: 0;
    }
    .card-heading-split {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .heading-left {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .heading-left h3 {
      margin: 0;
    }
    .section-sub {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-dm {
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #C7D2FE;
    }
    .badge-print {
      background: #F0FDF4;
      color: #16A34A;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #BBF7D0;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #0099DD;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .customer-picker-area {
      margin-bottom: 16px;
    }
    .fields-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .fields-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .fields-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .span-2 {
      grid-column: span 2;
    }
    .field-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field-label {
      font-size: 11.5px;
      font-weight: 600;
      color: #334155;
    }
    .required {
      color: #EF4444;
    }
    .form-input, .form-select, .form-textarea {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12.5px;
      outline: none;
      background: #fff;
    }
    .form-input.disabled {
      background: #F1F5F9;
      color: #94A3B8;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #0099DD;
    }
    .form-input.num {
      text-align: right;
    }
    .type-selector {
      font-weight: 700;
      background: #F8FAFC;
      border-color: #0099DD;
      color: #0F172A;
    }
    .highlight-select {
      background: #F0FDF4;
      font-weight: 600;
      border-color: #22C55E;
    }
    .btn-add-item {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0099DD;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .item-block {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      background: #FAFAFA;
      overflow: hidden;
    }
    .item-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F1F5F9;
      padding: 8px 14px;
      border-bottom: 1px solid #E2E8F0;
    }
    .item-header-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .item-index-badge {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      background: #E2E8F0;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .item-title-preview {
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
    }
    .service-chip {
      font-size: 11px;
      font-weight: 600;
      background: #E0E7FF;
      color: #4338CA;
      padding: 2px 7px;
      border-radius: 10px;
    }
    .item-controls {
      display: flex;
      gap: 4px;
    }
    .btn-ctrl {
      background: #fff;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 3px 7px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-ctrl.delete {
      color: #EF4444;
      font-size: 14px;
      font-weight: bold;
    }
    .item-block-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .service-specific-box {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 6px;
      padding: 12px;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #fff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }
    .pricing-row {
      display: grid;
      grid-template-columns: 1fr 1.5fr 1.5fr;
      gap: 12px;
      align-items: flex-end;
      background: #fff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }
    .line-total-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 12px;
      border-radius: 6px;
      height: 38px;
    }
    .total-label {
      font-size: 10.5px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    .total-value {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
    }
    .side-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .totals-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #475569;
    }
    .breakdown-row.discount-row {
      color: #DC2626;
      font-weight: 500;
    }
    .discount-config, .tax-config {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .discount-inputs, .tax-inputs {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .form-select.sm, .form-input.sm {
      padding: 6px 8px;
      font-size: 12px;
    }
    .tax-preview {
      font-size: 12px;
      color: #0284C7;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: #E2E8F0;
      margin: 4px 0;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F0F9FF;
      border: 1px solid #BAE6FD;
      padding: 10px 12px;
      border-radius: 8px;
    }
    .grand-label {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
    }
    .grand-val {
      font-size: 17px;
      font-weight: 800;
      color: #0099DD;
    }
    .card-submit-group {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .full {
      width: 100%;
      text-align: center;
      padding: 10px;
    }
  `]
})
export class QuotationEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  readonly digitalMarketingServices = [
    'Marketing',
    'Website'
  ];

  quotationId!: number;
  quotation: QuotationDetails | null = null;
  form!: FormGroup;

  isLoading = true;
  isSubmitting = false;
  isFinalizing = false;

  subtotal = 0;
  discountAmount = 0;
  taxAmount = 0;
  grandTotal = 0;

  get isDigitalMarketing(): boolean {
    return this.form?.get('quotationType')?.value === 'Digital Marketing';
  }

  ngOnInit() {
    this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
    this.initEmptyForm();
    this.loadQuotation();
  }

  initEmptyForm() {
    this.form = this.fb.group({
      clientId: [null],
      customerName: ['', [Validators.required]],
      contactPerson: [''],
      customerPhone: ['', [Validators.required]],
      customerEmail: [''],
      customerAddress: [''],
      quotationType: ['Printing', [Validators.required]],
      productionType: ['IN_HOUSE', [Validators.required]],
      currency: ['PKR'],
      quotationDate: ['', [Validators.required]],
      validUntil: ['', [Validators.required]],
      discountType: ['None'],
      discountValue: [0],
      taxRate: [0],
      internalNotes: [''],
      customerNotes: [''],
      termsAndConditions: [''],
      items: this.fb.array([])
    });
  }

  loadQuotation() {
    this.isLoading = true;
    this.quotationService.getQuotationById(this.quotationId).subscribe({
      next: (q) => {
        this.quotation = q;
        this.populateForm(q);
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

  populateForm(q: QuotationDetails) {
    const rev = q.activeRevision;
    const qDate = rev.quotationDate ? new Date(rev.quotationDate).toISOString().split('T')[0] : '';
    const vUntil = rev.validUntil ? new Date(rev.validUntil).toISOString().split('T')[0] : '';

    this.form.patchValue({
      clientId: q.clientId,
      customerName: q.customerName,
      contactPerson: q.contactPerson || '',
      customerPhone: q.customerPhone,
      customerEmail: q.customerEmail || '',
      customerAddress: q.customerAddress || '',
      quotationType: q.quotationType || 'Printing',
      productionType: rev.productionType || 'IN_HOUSE',
      currency: q.currency,
      quotationDate: qDate,
      validUntil: vUntil,
      discountType: rev.discountType,
      discountValue: rev.discountValue,
      taxRate: rev.taxRate,
      internalNotes: rev.internalNotes || '',
      customerNotes: rev.customerNotes || '',
      termsAndConditions: rev.termsAndConditions || ''
    });

    this.itemsArray.clear();
    for (const item of rev.items) {
      let pagesCount = 5;
      let postsCount = 12;
      let videoCount = 4;
      let adsDetails = 'Meta & Google Ads Campaign';
      let seoDetails = 'On-Page & Technical SEO';

      // Parse JSON serviceDetails if present
      if (item.serviceDetails) {
        try {
          const parsed = typeof item.serviceDetails === 'string' ? JSON.parse(item.serviceDetails) : item.serviceDetails;
          if (parsed) {
            if (parsed.pagesCount != null) pagesCount = parsed.pagesCount;
            if (parsed.postsCount != null) postsCount = parsed.postsCount;
            if (parsed.videoCount != null) videoCount = parsed.videoCount;
            if (parsed.ads != null) adsDetails = parsed.ads;
            if (parsed.adsDetails != null) adsDetails = parsed.adsDetails;
            if (parsed.seo != null) seoDetails = parsed.seo;
            if (parsed.seoDetails != null) seoDetails = parsed.seoDetails;
          }
        } catch {}
      }

      // Normalize serviceCategory to 'Website' or 'Marketing'
      let normalizedCategory = item.serviceCategory || '';
      if (this.isDigitalMarketing) {
        if (!normalizedCategory || normalizedCategory.toLowerCase().includes('web')) {
          normalizedCategory = 'Website';
        } else {
          normalizedCategory = 'Marketing';
        }
      }

      const itemGroup = this.fb.group({
        sortOrder: [item.sortOrder],
        productName: [item.productName, [Validators.required]],
        itemType: [item.itemType || (this.isDigitalMarketing ? 'Service' : 'Printing')],
        productionType: [item.productionType || rev.productionType || 'IN_HOUSE'],
        serviceCategory: [normalizedCategory],
        description: [item.description || ''],
        sizeDimensions: [item.sizeDimensions || ''],
        material: [item.material || ''],
        gsm: [item.gsm || ''],
        printingColor: [item.printingColor || ''],
        finishing: [item.finishing || ''],
        pagesCount: [pagesCount],
        postsCount: [postsCount],
        videoCount: [videoCount],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        unit: [item.unit || (this.isDigitalMarketing ? 'project' : 'pcs')],
        unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
        notes: [item.notes || '']
      });

      this.itemsArray.push(itemGroup);
    }

    if (rev.status !== 'Draft') {
      this.form.disable();
    }

    this.recalculateTotals();
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    const isDm = this.isDigitalMarketing;
    return this.fb.group({
      sortOrder: [this.itemsArray ? this.itemsArray.length + 1 : 1],
      productName: [isDm ? 'Digital Marketing Campaign' : '', [Validators.required]],
      itemType: [isDm ? 'Service' : 'Printing'],
      productionType: [this.form?.get('productionType')?.value || 'IN_HOUSE'],
      serviceCategory: [isDm ? 'Marketing' : ''],
      description: [''],
      sizeDimensions: [''],
      material: [''],
      gsm: [''],
      printingColor: [''],
      finishing: [''],
      pagesCount: [5],
      postsCount: [12],
      videoCount: [4],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: [isDm ? 'month' : 'pcs'],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  addItem() {
    this.itemsArray.push(this.createItemFormGroup());
    this.recalculateTotals();
  }

  onQuotationProductionTypeChange() {
    const selectedType = this.form.get('productionType')?.value || 'IN_HOUSE';
    for (let i = 0; i < this.itemsArray.length; i++) {
      this.itemsArray.at(i).patchValue({ productionType: selectedType });
    }
  }

  removeItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.recalculateTotals();
    }
  }

  moveItem(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= this.itemsArray.length) return;
    const current = this.itemsArray.at(index);
    this.itemsArray.removeAt(index);
    this.itemsArray.insert(target, current);
  }

  duplicateItem(index: number) {
    const itemVal = this.itemsArray.at(index).value;
    const copy = this.fb.group({
      ...itemVal,
      sortOrder: this.itemsArray.length + 1,
      productName: `${itemVal.productName} (Copy)`
    });
    this.itemsArray.insert(index + 1, copy);
    this.recalculateTotals();
  }

  switchQuotationType(type: 'Printing' | 'Digital Marketing') {
    if (this.form.get('quotationType')?.value === type) return;
    this.form.patchValue({ quotationType: type });
    this.onQuotationTypeChange();
  }

  onQuotationTypeChange() {
    const isDm = this.isDigitalMarketing;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const item = this.itemsArray.at(i);
      if (isDm) {
        item.patchValue({
          itemType: 'Service',
          serviceCategory: item.get('serviceCategory')?.value || 'Marketing',
          productName: item.get('productName')?.value || 'Digital Marketing Campaign',
          unit: 'month'
        });
      } else {
        item.patchValue({
          itemType: 'Printing',
          unit: 'pcs'
        });
      }
    }
    this.recalculateTotals();
  }

  onServiceCategoryChanged(index: number) {
    const item = this.itemsArray.at(index);
    const cat = item.get('serviceCategory')?.value;
    if (cat === 'Website') {
      item.patchValue({
        productName: 'Website Development',
        unit: 'project'
      });
    } else if (cat === 'Marketing') {
      item.patchValue({
        productName: 'Digital Marketing Campaign',
        unit: 'month'
      });
    }
    this.recalculateTotals();
  }

  onCustomerSelected(cust: Customer | null) {
    if (cust) {
      this.form.patchValue({
        clientId: cust.clientId,
        customerName: cust.companyName,
        contactPerson: cust.contactPerson || '',
        customerPhone: cust.phone,
        customerEmail: cust.email || '',
        customerAddress: cust.address || ''
      });
    }
  }

  calculateItemTotal(itemForm: any): number {
    const qty = Number(itemForm.get('quantity')?.value) || 0;
    const price = Number(itemForm.get('unitPrice')?.value) || 0;
    return Math.round(qty * price * 100) / 100;
  }

  recalculateTotals() {
    let sub = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const item = this.itemsArray.at(i);
      sub += this.calculateItemTotal(item);
    }

    this.subtotal = Math.round(sub * 100) / 100;

    const discountType = this.form.get('discountType')?.value;
    const discountValue = Number(this.form.get('discountValue')?.value) || 0;

    let disc = 0;
    if (discountType === 'Percentage' && discountValue > 0) {
      disc = Math.round(this.subtotal * (discountValue / 100) * 100) / 100;
    } else if (discountType === 'Fixed') {
      disc = Math.min(this.subtotal, discountValue);
    }
    this.discountAmount = disc;

    const taxable = Math.max(0, this.subtotal - this.discountAmount);
    const taxRate = Number(this.form.get('taxRate')?.value) || 0;
    this.taxAmount = taxRate > 0 ? Math.round(taxable * (taxRate / 100) * 100) / 100 : 0;

    this.grandTotal = Math.round((taxable + this.taxAmount) * 100) / 100;
  }

  createNewRevision() {
    if (!this.quotation) return;
    this.isSubmitting = true;

    this.quotationService.createRevision(this.quotation.quotationId).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        this.toastService.success(`Created Revision ${updated.activeRevision.revisionNumber}!`);
        this.loadQuotation();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to create revision');
      }
    });
  }

  save(finalize: boolean) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Please complete all required fields.');
      return;
    }

    this.isSubmitting = true;
    this.isFinalizing = finalize;

    const formRaw = this.form.value;
    const isDm = formRaw.quotationType === 'Digital Marketing';

    const itemsPayload = formRaw.items.map((item: any, idx: number) => {
      let serviceDetailsJson: string | null = null;
      if (isDm) {
        if (item.serviceCategory === 'Website') {
          serviceDetailsJson = JSON.stringify({
            pagesCount: item.pagesCount || 1
          });
        } else if (item.serviceCategory === 'Marketing') {
          serviceDetailsJson = JSON.stringify({
            postsCount: item.postsCount || 0,
            videoCount: item.videoCount || 0
          });
        }
      }

      return {
        sortOrder: idx + 1,
        itemType: isDm ? 'Service' : (item.itemType || 'Printing'),
        productionType: item.productionType || formRaw.productionType || 'IN_HOUSE',
        productName: item.productName,
        description: item.description,
        sizeDimensions: isDm ? null : item.sizeDimensions,
        material: isDm ? null : item.material,
        gsm: isDm ? null : item.gsm,
        printingColor: isDm ? null : item.printingColor,
        finishing: isDm ? null : item.finishing,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        serviceCategory: isDm ? item.serviceCategory : null,
        serviceDetails: serviceDetailsJson,
        notes: item.notes
      };
    });

    const payload = {
      clientId: formRaw.clientId,
      customerName: formRaw.customerName,
      contactPerson: formRaw.contactPerson,
      customerPhone: formRaw.customerPhone,
      customerEmail: formRaw.customerEmail,
      customerAddress: formRaw.customerAddress,
      quotationType: formRaw.quotationType,
      productionType: formRaw.productionType || 'IN_HOUSE',
      currency: formRaw.currency,
      quotationDate: formRaw.quotationDate,
      validUntil: formRaw.validUntil,
      discountType: formRaw.discountType,
      discountValue: formRaw.discountValue,
      taxRate: formRaw.taxRate,
      internalNotes: formRaw.internalNotes,
      customerNotes: formRaw.customerNotes,
      termsAndConditions: formRaw.termsAndConditions,
      items: itemsPayload
    };

    this.quotationService.updateDraft(this.quotationId, payload).subscribe({
      next: (updated) => {
        if (finalize) {
          this.quotationService.finalizeQuotation(this.quotationId).subscribe({
            next: (finalized) => {
              this.isSubmitting = false;
              this.toastService.success(`Quotation ${finalized.quotationNumber} finalized successfully!`);
              this.router.navigate(['/admin/quotations', this.quotationId, 'preview']);
            },
            error: () => {
              this.isSubmitting = false;
              this.toastService.warning('Draft updated, but could not finalize.');
              this.router.navigate(['/admin/quotations', this.quotationId]);
            }
          });
        } else {
          this.isSubmitting = false;
          this.toastService.success(`Quotation ${updated.quotationNumber} draft updated.`);
          this.router.navigate(['/admin/quotations', this.quotationId]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to update quotation');
      }
    });
  }
}
