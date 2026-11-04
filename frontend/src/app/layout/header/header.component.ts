import { Component, inject } from '@angular/core';
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

  get currentModule(): string {
    const url = this.router.url;
    if (url.includes('/admin/dashboard')) {
      return 'Dashboard';
    }
    if (url.includes('/admin/customers')) {
      return 'Sales / Customers';
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
