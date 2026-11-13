import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { SupplierListItem } from '../../models/supplier.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-suppliers-directory',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './suppliers-directory.component.html',
  styleUrls: ['./suppliers-directory.component.scss']
})
export class SuppliersDirectoryComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  suppliers: SupplierListItem[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  supplierToDeactivate: SupplierListItem | null = null;
  isDeactivating: boolean = false;
  private searchTimer?: any;

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.supplierService.getSuppliers(this.searchTerm, this.currentPage, this.pageSize).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.suppliers = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.totalPages = res.totalPages || 0;
      },
      error: (err) => {
        console.error('Failed to load suppliers:', err);
        this.errorMessage = err?.error?.detail || 'Failed to load suppliers from database.';
      }
    });
  }

  onSearch(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadSuppliers();
    }, 250);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSuppliers();
    }
  }

  openDeactivateModal(sup: SupplierListItem): void {
    this.supplierToDeactivate = sup;
    this.isDeactivating = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeDeactivateModal(): void {
    if (this.isDeactivating) return;
    this.supplierToDeactivate = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmDeactivateSupplier(): void {
    if (!this.supplierToDeactivate || this.isDeactivating) return;

    const target = this.supplierToDeactivate;
    this.isDeactivating = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.supplierService.deactivateSupplier(target.id).pipe(
      finalize(() => {
        this.isDeactivating = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.supplierToDeactivate = null;
        this.suppliers = this.suppliers.map(s =>
          s.id === target.id ? { ...s, status: 'Inactive' } : s
        );
        this.toastService.success(`Supplier "${target.supplierName}" has been deactivated.`, 'Supplier Deactivated');
      },
      error: (err) => {
        console.error('Failed to deactivate supplier:', err);
        this.toastService.error('Failed to deactivate supplier. Please try again.', 'Action Failed');
      }
    });
  }
}
