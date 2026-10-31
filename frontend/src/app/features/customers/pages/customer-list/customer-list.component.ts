import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer, PaginatedCustomerResponse } from '../../models/customer.model';
import { CustomerFormComponent } from '../../components/customer-form/customer-form.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomerFormComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  // Data & Pagination Signals
  customers = signal<Customer[]>([]);
  totalCount = signal<number>(0);
  totalPages = signal<number>(1);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  isLoading = signal<boolean>(false);

  // Filters
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('active'); // 'active' | 'inactive' | 'archived' | 'all'

  // Modal State
  showFormModal = signal<boolean>(false);
  customerToEdit = signal<Customer | null>(null);

  // Confirm Archive / Restore / Delete Modal State
  showConfirmModal = signal<boolean>(false);
  targetCustomer = signal<Customer | null>(null);
  confirmAction = signal<'archive' | 'restore' | 'delete'>('archive');
  isProcessingAction = signal<boolean>(false);

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);

    this.customerService.getCustomers(
      this.searchQuery(),
      this.selectedStatus(),
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (res: PaginatedCustomerResponse) => {
        this.customers.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages || 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail || err.error?.message || 'Failed to load customers from server.';
        this.toastService.error(detail, 'Data Load Error');
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCustomers();
    }, 350);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(Number(newSize));
    this.currentPage.set(1);
    this.loadCustomers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadCustomers();
    }
  }

  // Add / Edit Modal Handlers
  openAddModal(): void {
    this.customerToEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(customer: Customer, event?: Event): void {
    event?.stopPropagation();
    this.customerToEdit.set(customer);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.customerToEdit.set(null);
  }

  onCustomerSaved(customer: Customer): void {
    this.closeFormModal();
    this.loadCustomers();
  }

  // Toggle Status (Active / Inactive)
  toggleStatus(customer: Customer, event: Event): void {
    event.stopPropagation();
    const newStatus = !customer.isActive;
    this.customerService.updateCustomerStatus(customer.clientId, newStatus).subscribe({
      next: (updated) => {
        this.toastService.success(
          `Customer "${customer.companyName}" marked as ${newStatus ? 'Active' : 'Inactive'}.`,
          'Status Updated'
        );
        this.loadCustomers();
      },
      error: (err) => {
        this.toastService.error('Failed to change customer status.', 'Error');
      }
    });
  }

  // Archive / Restore Handlers
  promptArchive(customer: Customer, event?: Event): void {
    event?.stopPropagation();
    this.targetCustomer.set(customer);
    this.confirmAction.set('archive');
    this.showConfirmModal.set(true);
  }

  promptRestore(customer: Customer, event?: Event): void {
    event?.stopPropagation();
    this.targetCustomer.set(customer);
    this.confirmAction.set('restore');
    this.showConfirmModal.set(true);
  }

  promptDelete(customer: Customer, event?: Event): void {
    event?.stopPropagation();
    this.targetCustomer.set(customer);
    this.confirmAction.set('delete');
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.targetCustomer.set(null);
  }

  executeConfirmAction(): void {
    const customer = this.targetCustomer();
    if (!customer) return;

    this.isProcessingAction.set(true);

    if (this.confirmAction() === 'delete') {
      this.customerService.deleteCustomerPermanently(customer.clientId).subscribe({
        next: (res) => {
          this.isProcessingAction.set(false);
          this.closeConfirmModal();
          this.toastService.success(res.message || `Customer "${customer.companyName}" deleted permanently.`, 'Deleted');
          this.loadCustomers();
        },
        error: (err) => {
          this.isProcessingAction.set(false);
          this.toastService.error(err.error?.detail || 'Failed to delete customer.', 'Delete Error');
        }
      });
    } else if (this.confirmAction() === 'archive') {
      this.customerService.archiveCustomer(customer.clientId).subscribe({
        next: () => {
          this.isProcessingAction.set(false);
          this.closeConfirmModal();
          this.toastService.success(`Customer "${customer.companyName}" archived successfully.`, 'Archived');
          this.loadCustomers();
        },
        error: (err) => {
          this.isProcessingAction.set(false);
          this.toastService.error('Failed to archive customer.', 'Error');
        }
      });
    } else {
      this.customerService.restoreCustomer(customer.clientId).subscribe({
        next: () => {
          this.isProcessingAction.set(false);
          this.closeConfirmModal();
          this.toastService.success(`Customer "${customer.companyName}" restored successfully!`, 'Restored');
          this.loadCustomers();
        },
        error: (err) => {
          this.isProcessingAction.set(false);
          this.toastService.error('Failed to restore customer.', 'Error');
        }
      });
    }
  }
}

