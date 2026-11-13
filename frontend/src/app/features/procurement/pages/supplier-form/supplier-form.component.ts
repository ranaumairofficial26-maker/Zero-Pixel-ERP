import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreateSupplierRequest } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  supplierForm!: FormGroup;
  isEditMode: boolean = false;
  supplierId: number | null = null;
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string | null = null;

  readonly servicePlaceholders = [
    'e.g. Paper Supply',
    'e.g. Printing Plates',
    'e.g. Printing Services',
    'e.g. Lamination Services'
  ];

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.supplierId = Number(idParam);
      this.loadSupplierForEdit(this.supplierId);
    }
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({
      supplierName: ['', [Validators.required, Validators.maxLength(200)]],
      contactPerson: ['', [Validators.maxLength(150)]],
      phoneNumber: ['', [Validators.maxLength(30)]],
      email: ['', [Validators.maxLength(200), Validators.email]],
      address: [''],
      leadTimeWorkingDays: [null, [Validators.min(0)]],
      status: ['Active', [Validators.required]],
      services: this.fb.array([]),
      bankName: ['', [Validators.maxLength(150)]],
      accountName: ['', [Validators.maxLength(200)]],
      accountNumberOrIban: ['', [Validators.maxLength(100)]]
    });
  }

  get services(): FormArray {
    return this.supplierForm.get('services') as FormArray;
  }

  addService(value: string = ''): void {
    this.services.push(this.fb.control(value, [Validators.maxLength(250)]));
  }

  removeService(index: number): void {
    this.services.removeAt(index);
  }

  getServicePlaceholder(index: number): string {
    return this.servicePlaceholders[index % this.servicePlaceholders.length];
  }

  private loadSupplierForEdit(id: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.supplierService.getSupplierById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (sup) => {
        this.supplierForm.patchValue({
          supplierName: sup.supplierName || '',
          contactPerson: sup.contactPerson || '',
          phoneNumber: sup.phoneNumber || '',
          email: sup.email || '',
          address: sup.address || '',
          leadTimeWorkingDays: sup.leadTimeWorkingDays ?? null,
          status: sup.status === 'Inactive' ? 'Inactive' : 'Active',
          bankName: sup.bankName || '',
          accountName: sup.accountName || '',
          accountNumberOrIban: sup.accountNumberOrIban || ''
        });

        this.services.clear();
        if (sup.services && sup.services.length > 0) {
          sup.services.forEach(s => this.addService(s));
        }
      },
      error: (err) => {
        console.error('Failed to load supplier:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load supplier details.';
      }
    });
  }

  onSubmit(): void {
    if (this.saving) return;

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      this.toastService.warning('Please correct the highlighted validation errors.', 'Invalid Form');
      return;
    }

    const v = this.supplierForm.value;
    const rawLead = v.leadTimeWorkingDays;
    const leadTime = rawLead !== null && rawLead !== '' && rawLead !== undefined
      ? Number(rawLead)
      : null;

    const payload: CreateSupplierRequest = {
      supplierName: (v.supplierName || '').trim(),
      contactPerson: v.contactPerson ? v.contactPerson.trim() : null,
      phoneNumber: v.phoneNumber ? v.phoneNumber.trim() : null,
      email: v.email ? v.email.trim() : null,
      address: v.address ? v.address.trim() : null,
      leadTimeWorkingDays: leadTime,
      status: v.status === 'Inactive' ? 'Inactive' : 'Active',
      services: (v.services || [])
        .map((s: string) => (s || '').trim())
        .filter((s: string) => s.length > 0),
      bankName: v.bankName ? v.bankName.trim() : null,
      accountName: v.accountName ? v.accountName.trim() : null,
      accountNumberOrIban: v.accountNumberOrIban ? v.accountNumberOrIban.trim() : null
    };

    this.saving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    const req$ = (this.isEditMode && this.supplierId)
      ? this.supplierService.updateSupplier(this.supplierId, payload)
      : this.supplierService.createSupplier(payload);

    req$.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (saved) => {
        this.toastService.success(
          this.isEditMode
            ? `Supplier "${saved.supplierName}" updated successfully.`
            : `Supplier "${saved.supplierName}" saved successfully.`,
          this.isEditMode ? 'Supplier Updated' : 'Supplier Saved'
        );
        this.router.navigate(['/admin/procurement/suppliers-directory']);
      },
      error: (err) => {
        console.error('Failed to save supplier:', err);
        const msg = err?.error?.detail || err?.error?.title || 'Failed to save supplier. Please check your inputs.';
        this.errorMessage = msg;
        this.toastService.error(msg, 'Save Failed');
      }
    });
  }
}

