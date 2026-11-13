import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  @Output() menuToggle = new EventEmitter<void>();

  get currentModule(): string {
    const url = this.router.url;
    if (url.includes('/admin/dashboard')) {
      return 'Dashboard';
    }
    if (url.includes('/admin/customers')) {
      return 'Sales / Customers';
    }
    if (url.includes('/admin/quotations')) {
      return 'Sales / Quotations';
    }
    if (url.includes('/admin/invoices')) {
      return 'Invoices';
    }
    if (url.includes('/admin/procurement/suppliers-directory')) {
      return 'Procurement / Suppliers Directory';
    }
    if (url.includes('/admin/procurement/supplier-quotes')) {
      return 'Procurement / Supplier Quotes';
    }
    if (url.includes('/admin/procurement/purchase-orders')) {
      return 'Procurement / Purchase Orders';
    }
    if (url.includes('/admin/procurement/supplier-bills')) {
      return 'Procurement / Supplier Bills';
    }
    if (url.includes('/admin/procurement/supplier-payments')) {
      return 'Procurement / Supplier Payments';
    }
    if (url.includes('/admin/procurement')) {
      return 'Procurement';
    }
    if (url.includes('/admin/production')) {
      return 'Production';
    }
    if (url.includes('/admin/printing-intelligence')) {
      return 'Printing Intelligence';
    }
    if (url.includes('/admin/settings')) {
      return 'Settings';
    }
    return 'Console';
  }

  onLogout(): void {
    if (confirm('Are you sure you want to sign out of the Admin Panel?')) {
      this.authService.logout();
    }
  }
}
