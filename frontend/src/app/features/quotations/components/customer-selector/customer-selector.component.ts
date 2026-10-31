import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  selector: 'app-customer-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="customer-selector-container">
      @if (selectedCustomer) {
        <div class="selected-customer-card">
          <div class="card-left">
            <div class="customer-avatar">
              {{ getInitials(selectedCustomer.name) }}
            </div>
            <div class="customer-info">
              <div class="customer-name-row">
                <span class="customer-name">{{ selectedCustomer.name }}</span>
                @if (selectedCustomer.companyName) {
                  <span class="company-badge">{{ selectedCustomer.companyName }}</span>
                }
                <span class="linked-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Client Linked
                </span>
              </div>
              <div class="customer-meta-row">
                <span class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {{ selectedCustomer.phone }}
                </span>
                @if (selectedCustomer.email) {
                  <span class="meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    {{ selectedCustomer.email }}
                  </span>
                }
              </div>
            </div>
          </div>
          <button type="button" class="btn-change" (click)="clearSelection()" title="Change selected customer">
            Change
          </button>
        </div>
      } @else {
        <div class="search-box-wrapper">
          <div class="input-with-icon">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              [formControl]="searchControl"
              class="form-input search-input"
              placeholder="Search existing customer by company, name, or phone..."
              (focus)="showDropdown = true"
            />
            @if (isLoading) {
              <div class="spinner-small"></div>
            }
          </div>

          <!-- Dropdown Results -->
          @if (showDropdown && searchResults.length > 0) {
            <div class="results-dropdown">
              @for (cust of searchResults; track cust.clientId) {
                <div class="dropdown-item" (click)="selectCustomer(cust)">
                  <div class="item-main">
                    <span class="item-name">{{ cust.companyName }}</span>
                    @if (cust.contactPerson) {
                      <span class="item-company">({{ cust.contactPerson }})</span>
                    }
                  </div>
                  <div class="item-sub">
                    <span>{{ cust.phone }}</span>
                    @if (cust.email) {
                      <span> • {{ cust.email }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          } @else if (showDropdown && searchControl.value && !isLoading && searchResults.length === 0) {
            <div class="results-dropdown no-results">
              No matching customers found. You can enter customer details manually below.
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .customer-selector-container {
      position: relative;
      width: 100%;
    }
    .selected-customer-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F0F9FF;
      border: 1px solid #BAE6FD;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .card-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .customer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0099DD;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .customer-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .customer-name {
      font-size: 14px;
      font-weight: 600;
      color: #0F172A;
    }
    .company-badge {
      font-size: 11px;
      background: #E2E8F0;
      color: #334155;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    .linked-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      background: #DCFCE7;
      color: #15803D;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 600;
    }
    .customer-meta-row {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 12px;
      color: #64748B;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-change {
      background: #fff;
      border: 1px solid #CBD5E1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-change:hover {
      background: #F1F5F9;
      color: #0F172A;
      border-color: #94A3B8;
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: #94A3B8;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 9px 36px 9px 36px;
      font-size: 13px;
      border: 1px solid #CBD5E1;
      border-radius: 7px;
      outline: none;
      transition: border-color 0.15s;
      background: #fff;
    }
    .search-input:focus {
      border-color: #0099DD;
      box-shadow: 0 0 0 3px rgba(0, 153, 221, 0.12);
    }
    .spinner-small {
      position: absolute;
      right: 12px;
      width: 16px;
      height: 16px;
      border: 2px solid #E2E8F0;
      border-top-color: #0099DD;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .results-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      z-index: 50;
      max-height: 240px;
      overflow-y: auto;
    }
    .dropdown-item {
      padding: 9px 12px;
      cursor: pointer;
      border-bottom: 1px solid #F1F5F9;
      transition: background 0.12s;
    }
    .dropdown-item:last-child {
      border-bottom: none;
    }
    .dropdown-item:hover {
      background: #F8FAFC;
    }
    .item-main {
      font-size: 13px;
      font-weight: 600;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .item-company {
      font-weight: 400;
      color: #64748B;
      font-size: 12px;
    }
    .item-sub {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
    }
    .no-results {
      padding: 12px;
      font-size: 12px;
      color: #64748B;
      text-align: center;
    }
  `]
})
export class CustomerSelectorComponent implements OnInit {
  private customerService = inject(CustomerService);

  @Input() initialCustomer: { id?: number; name: string; phone: string; email?: string; companyName?: string } | null = null;
  @Output() customerSelected = new EventEmitter<Customer | null>();

  searchControl = new FormControl('');
  searchResults: Customer[] = [];
  selectedCustomer: { id?: number; name: string; phone: string; email?: string; companyName?: string } | null = null;
  isLoading = false;
  showDropdown = false;

  ngOnInit() {
    if (this.initialCustomer) {
      this.selectedCustomer = this.initialCustomer;
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.searchResults = [];
          this.isLoading = false;
          return of(null);
        }
        this.isLoading = true;
        return this.customerService.getCustomers(query.trim(), 'active', 1, 8).pipe(
          catchError(() => {
            this.isLoading = false;
            return of(null);
          })
        );
      })
    ).subscribe(res => {
      this.isLoading = false;
      if (res && res.items) {
        this.searchResults = res.items;
      } else {
        this.searchResults = [];
      }
    });
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomer = {
      id: customer.clientId,
      name: customer.companyName,
      phone: customer.phone,
      email: customer.email || undefined,
      companyName: customer.contactPerson || undefined
    };
    this.showDropdown = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.customerSelected.emit(customer);
  }

  clearSelection() {
    this.selectedCustomer = null;
    this.customerSelected.emit(null);
  }

  getInitials(name: string): string {
    if (!name) return 'ZP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
