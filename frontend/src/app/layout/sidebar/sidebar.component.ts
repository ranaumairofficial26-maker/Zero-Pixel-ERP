import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private router = inject(Router);

  salesExpanded = signal<boolean>(false);
  productionExpanded = signal<boolean>(false);
  intelligenceExpanded = signal<boolean>(false);

  toggleSales(): void {
    this.salesExpanded.update(v => !v);
  }

  toggleProduction(): void {
    this.productionExpanded.update(v => !v);
  }

  toggleIntelligence(): void {
    this.intelligenceExpanded.update(v => !v);
  }

  isSalesRouteActive(): boolean {
    return this.router.url.startsWith('/admin/customers') || 
           this.router.url.startsWith('/admin/quotations');
  }

  isProductionRouteActive(): boolean {
    return this.router.url.startsWith('/admin/production');
  }

  isIntelligenceRouteActive(): boolean {
    return this.router.url.startsWith('/admin/printing-intelligence');
  }

  isRouteActive(routePath: string): boolean {
    return this.router.url.startsWith(routePath);
  }
}
