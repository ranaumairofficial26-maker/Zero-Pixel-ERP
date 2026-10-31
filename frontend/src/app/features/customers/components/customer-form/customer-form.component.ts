import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer, DuplicateWarningResponse } from '../../models/customer.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  @Input() customerToEdit?: Customer | null;
  @Output() saved = new EventEmitter<Customer>();
  @Output() cancelled = new EventEmitter<void>();

  customerForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  duplicateWarning = signal<DuplicateWarningResponse | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      companyName: [
        this.customerToEdit?.companyName || '',
        [Validators.required, Validators.maxLength(200)]
      ],
      contactPerson: [
        this.customerToEdit?.contactPerson || '',
        [Validators.maxLength(150)]
      ],
      phone: [
        this.customerToEdit?.phone || '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,5}\)?[-.\s]?)?[\d-.\s]{6,20}$/)
        ]
      ],
      email: [
        this.customerToEdit?.email || '',
        [Validators.maxLength(200), Validators.email]
      ],
      address: [
        this.customerToEdit?.address || '',
        [Validators.maxLength(1000)]
      ],
      isActive: [
        this.customerToEdit ? this.customerToEdit.isActive : true
      ]
    });
  }

  onSubmit(force: boolean = false): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.toastService.warning('Please correct the validation errors on the form.', 'Invalid Form');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.customerForm.value;

    const requestPayload = {
      companyName: formValue.companyName.trim(),
      contactPerson: formValue.contactPerson ? formValue.contactPerson.trim() : null,
      phone: formValue.phone.trim(),
      email: formValue.email ? formValue.email.trim() : null,
      address: formValue.address ? formValue.address.trim() : null,
      isActive: formValue.isActive
    };

    if (this.customerToEdit) {
      // Update
      this.customerService.updateCustomer(this.customerToEdit.clientId, requestPayload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.toastService.success(`Customer "${updated.companyName}" updated successfully!`, 'Customer Updated');
          this.saved.emit(updated);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail = err.error?.detail || err.error?.message || 'Failed to update customer.';
          this.toastService.error(detail, 'Update Failed');
        }
      });
    } else {
      // Create with duplicate check
      this.customerService.createCustomer(requestPayload, force).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.duplicateWarning.set(null);
          this.toastService.success(`Customer "${created.companyName}" created successfully!`, 'Customer Created');
          this.saved.emit(created);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 409 && err.error?.isDuplicate) {
            // Duplicate detected by phone
            this.duplicateWarning.set(err.error);
            this.toastService.warning(err.error.message || 'Duplicate phone number detected.', 'Duplicate Warning');
          } else {
            const detail = err.error?.detail || err.error?.message || 'Failed to create customer.';
            this.toastService.error(detail, 'Creation Failed');
          }
        }
      });
    }
  }

  openExistingCustomer(): void {
    const warning = this.duplicateWarning();
    if (warning && warning.existingClient) {
      this.cancelled.emit();
      this.router.navigate(['/admin/customers', warning.existingClient.clientId]);
    }
  }

  saveAnyway(): void {
    this.onSubmit(true);
  }

  clearDuplicateWarning(): void {
    this.duplicateWarning.set(null);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

