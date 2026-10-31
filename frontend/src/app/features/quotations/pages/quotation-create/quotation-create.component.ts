import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CustomerSelectorComponent } from '../../components/customer-selector/customer-selector.component';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  selector: 'app-quotation-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CustomerSelectorComponent
  ],
  template: `
    <div class="quotation-form-page">
      <!-- Form Header -->
      <header class="form-header">
        <div class="header-titles">
          <div class="breadcrumbs">
            <a routerLink="/admin/quotations">Smart Quotations</a>
            <span>/</span>
            <span>New Quotation</span>
          </div>
          <h1 class="page-title">Create Smart Quotation</h1>
        </div>

        <div class="header-actions">
          <a routerLink="/admin/quotations" class="btn-cancel">Cancel</a>
          <button type="button" class="btn-save-draft" [disabled]="isSubmitting || form.invalid" (click)="save(false)">
            @if (isSubmitting && !isFinalizing) { Saving... } @else { Save Draft }
          </button>
          <button type="button" class="btn-finalize" [disabled]="isSubmitting || form.invalid" (click)="save(true)">
            @if (isSubmitting && isFinalizing) { Finalizing... } @else { Save & Finalize }
          </button>
        </div>
      </header>

      <!-- Compact Sleek Top Mode Selector -->
      <div class="top-mode-selector-bar">
        <button 
          type="button" 
          class="mode-btn" 
          [class.active]="form.get('quotationType')?.value === 'Printing'"
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
              <app-customer-selector (customerSelected)="onCustomerSelected($event)"></app-customer-selector>
            </div>

            <div class="fields-grid-3">
              <div class="field-item">
                <label class="field-label">Customer Name <span class="required">*</span></label>
                <input type="text" formControlName="customerName" class="form-input" placeholder="Client or business name" />
                @if (form.get('customerName')?.touched && form.get('customerName')?.invalid) {
                  <span class="field-error">Customer name is required</span>
                }
              </div>

              <div class="field-item">
                <label class="field-label">Contact Person</label>
                <input type="text" formControlName="contactPerson" class="form-input" placeholder="e.g. Mr. Tariq" />
              </div>

              <div class="field-item">
                <label class="field-label">Customer Phone <span class="required">*</span></label>
                <input type="text" formControlName="customerPhone" class="form-input" placeholder="0300-1234567" />
                @if (form.get('customerPhone')?.touched && form.get('customerPhone')?.invalid) {
                  <span class="field-error">Valid phone is required</span>
                }
              </div>

              <div class="field-item">
                <label class="field-label">Customer Email</label>
                <input type="email" formControlName="customerEmail" class="form-input" placeholder="client@company.com" />
              </div>

              <div class="field-item span-2">
                <label class="field-label">Customer Address</label>
                <input type="text" formControlName="customerAddress" class="form-input" placeholder="Street address, city" />
              </div>
            </div>
          </div>

          <!-- Section 2: Products & Specifications -->
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
              <button type="button" class="btn-add-item" (click)="addItem()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add {{ isDigitalMarketing ? 'Service' : 'Product' }}
              </button>
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

                      <div [class]="isDigitalMarketing ? 'field-item span-2' : 'field-item span-2'">
                        <label class="field-label">{{ isDigitalMarketing ? 'Service Title' : 'Product Name' }} <span class="required">*</span></label>
                        <input type="text" formControlName="productName" class="form-input" [placeholder]="isDigitalMarketing ? 'e.g. Website Development, Marketing Campaign' : 'e.g. Brochure, Business Cards, Flyers'" />
                      </div>

                      @if (!isDigitalMarketing) {
                        <div class="field-item">
                          <label class="field-label">Item Type</label>
                          <select formControlName="itemType" class="form-select">
                            <option value="Printing">Printing Product</option>
                          </select>
                        </div>
                      }

                      <div class="field-item">
                        <label class="field-label">Unit</label>
                        <input type="text" formControlName="unit" class="form-input" placeholder="pcs / project / month" />
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
                            <input type="text" formControlName="description" class="form-input" placeholder="e.g. 5-page responsive website with contact form & WhatsApp" />
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
                      <div class="specs-grid">
                        <div class="field-item">
                          <label class="field-label">Size / Dimensions</label>
                          <input type="text" formControlName="sizeDimensions" class="form-input" placeholder="e.g. A4, 3.5 x 2 in" />
                        </div>

                        <div class="field-item">
                          <label class="field-label">Paper / Material</label>
                          <input type="text" formControlName="material" class="form-input" placeholder="e.g. Art Card, Offset" />
                        </div>

                        <div class="field-item">
                          <label class="field-label">GSM</label>
                          <input type="text" formControlName="gsm" class="form-input" placeholder="e.g. 300 GSM" />
                        </div>

                        <div class="field-item">
                          <label class="field-label">Color Specs</label>
                          <input type="text" formControlName="printingColor" class="form-input" placeholder="e.g. 4/4 Full Color" />
                        </div>

                        <div class="field-item span-2">
                          <label class="field-label">Finishing Details</label>
                          <input type="text" formControlName="finishing" class="form-input" placeholder="e.g. Matte Lam, Spot UV, Gold Foil" />
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
                <textarea formControlName="internalNotes" rows="3" class="form-textarea" placeholder="Supplier / developer cost, internal notes..."></textarea>
              </div>

              <div class="field-item">
                <label class="field-label">Customer-Facing Notes</label>
                <textarea formControlName="customerNotes" rows="3" class="form-textarea" placeholder="Special delivery instructions or thank you note..."></textarea>
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
                <input type="text" [value]="'Auto-generated by system'" disabled class="form-input disabled" />
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

            <div class="card-submit-group">
              <button type="button" class="btn-save-draft full" [disabled]="isSubmitting || form.invalid" (click)="save(false)">
                Save as Draft
              </button>
              <button type="button" class="btn-finalize full" [disabled]="isSubmitting || form.invalid" (click)="save(true)">
                Finalize Quotation
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .quotation-form-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
      zoom: 0.97;
    }
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 16px 24px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #64748B;
      margin-bottom: 2px;
    }
    .breadcrumbs a {
      color: #0099DD;
      text-decoration: none;
    }
    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-cancel {
      padding: 8px 16px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
    }
    .btn-save-draft {
      padding: 8px 16px;
      border: 1px solid #0099DD;
      border-radius: 6px;
      background: #F0F9FF;
      color: #0099DD;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-finalize {
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      background: #0099DD;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save-draft:disabled, .btn-finalize:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    .mode-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.7);
      color: #0F172A;
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
      gap: 18px;
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
    .field-error {
      font-size: 11px;
      color: #EF4444;
    }
    .type-selector {
      font-weight: 700;
      background: #F8FAFC;
      border-color: #0099DD;
      color: #0F172A;
    }
    .highlight-select {
      background: #F0FDF4;
      font-weight: 700;
      border-color: #22C55E;
      color: #15803D;
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
export class QuotationCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private quotationService = inject(QuotationService);
  private toastService = inject(ToastService);

  readonly digitalMarketingServices = [
    'Marketing',
    'Website'
  ];

  form!: FormGroup;
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
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const queryType = this.route.snapshot.queryParamMap.get('type');
    const storedType = sessionStorage.getItem('zp_create_quotation_type');
    const initialType = (queryType === 'Digital Marketing' || storedType === 'Digital Marketing')
      ? 'Digital Marketing'
      : 'Printing';

    this.form = this.fb.group({
      clientId: [null],
      customerName: ['', [Validators.required]],
      contactPerson: [''],
      customerPhone: ['', [Validators.required]],
      customerEmail: [''],
      customerAddress: [''],
      quotationType: [initialType, [Validators.required]],
      currency: ['PKR'],
      quotationDate: [today, [Validators.required]],
      validUntil: [expiry, [Validators.required]],
      discountType: ['None'],
      discountValue: [0],
      taxRate: [0],
      internalNotes: [''],
      customerNotes: [''],
      termsAndConditions: [
        '1. 50% advance payment required upon order confirmation.\n2. Delivery timeline starts after sample / artwork approval.\n3. Quotation is valid for 15 days from issue date.'
      ],
      items: this.fb.array([])
    });

    this.addItem();

    if (initialType === 'Digital Marketing') {
      sessionStorage.setItem('zp_create_quotation_type', 'Digital Marketing');
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { type: 'Digital Marketing' },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
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
    const currentType = this.form.get('quotationType')?.value || 'Printing';
    sessionStorage.setItem('zp_create_quotation_type', currentType);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: currentType },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

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
    } else {
      this.form.patchValue({ clientId: null });
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

    this.quotationService.createDraft(payload).subscribe({
      next: (created) => {
        sessionStorage.removeItem('zp_create_quotation_type');
        if (finalize) {
          this.quotationService.finalizeQuotation(created.quotationId).subscribe({
            next: (finalized) => {
              this.isSubmitting = false;
              this.toastService.success(`Quotation ${finalized.quotationNumber} created and finalized!`);
              this.router.navigate(['/admin/quotations', finalized.quotationId, 'preview']);
            },
            error: () => {
              this.isSubmitting = false;
              this.toastService.warning('Saved as draft, but could not finalize automatically.');
              this.router.navigate(['/admin/quotations', created.quotationId]);
            }
          });
        } else {
          this.isSubmitting = false;
          this.toastService.success(`Quotation ${created.quotationNumber} saved as draft.`);
          this.router.navigate(['/admin/quotations', created.quotationId]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to create quotation');
      }
    });
  }
}
