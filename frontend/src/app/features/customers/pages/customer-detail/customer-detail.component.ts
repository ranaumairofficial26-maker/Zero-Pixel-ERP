import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { CustomerFormComponent } from '../../components/customer-form/customer-form.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerFormComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  customer = signal<Customer | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  showEditModal = signal<boolean>(false);
  showConfirmArchiveModal = signal<boolean>(false);
  isProcessing = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const clientId = Number(idParam);
        this.loadCustomer(clientId);
      }
    });
  }

  loadCustomer(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.customerService.getCustomerById(id).subscribe({
      next: (client) => {
        this.customer.set(client);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail || err.error?.message || `Customer #${id} not found.`;
        this.errorMessage.set(detail);
      }
    });
  }

  openEditModal(): void {
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onCustomerUpdated(updated: Customer): void {
    this.customer.set(updated);
    this.closeEditModal();
  }

  toggleActiveStatus(): void {
    const c = this.customer();
    if (!c) return;

    const newStatus = !c.isActive;
    this.isProcessing.set(true);

    this.customerService.updateCustomerStatus(c.clientId, newStatus).subscribe({
      next: (updated) => {
        this.customer.set(updated);
        this.isProcessing.set(false);
        this.toastService.success(
          `Customer marked as ${newStatus ? 'Active' : 'Inactive'}.`,
          'Status Changed'
        );
      },
      error: () => {
        this.isProcessing.set(false);
        this.toastService.error('Failed to change customer status.', 'Error');
      }
    });
  }

  confirmArchive(): void {
    this.showConfirmArchiveModal.set(true);
  }

  closeArchiveModal(): void {
    this.showConfirmArchiveModal.set(false);
  }

  executeArchive(): void {
    const c = this.customer();
    if (!c) return;

    this.isProcessing.set(true);
    this.customerService.archiveCustomer(c.clientId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.closeArchiveModal();
        this.toastService.success(`Customer "${c.companyName}" archived successfully.`, 'Archived');
        this.loadCustomer(c.clientId);
      },
      error: () => {
        this.isProcessing.set(false);
        this.toastService.error('Failed to archive customer.', 'Error');
      }
    });
  }

  executeRestore(): void {
    const c = this.customer();
    if (!c) return;

    this.isProcessing.set(true);
    this.customerService.restoreCustomer(c.clientId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.toastService.success(`Customer "${c.companyName}" restored successfully!`, 'Restored');
        this.loadCustomer(c.clientId);
      },
      error: () => {
        this.isProcessing.set(false);
        this.toastService.error('Failed to restore customer.', 'Error');
      }
    });
  }
}

