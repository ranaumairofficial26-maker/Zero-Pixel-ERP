import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    '[class.dark-sidebar]': 'themeService.isDarkMode()',
    '[class.mobile-open]': 'isOpen'
  }
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  public themeService = inject(ThemeService);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();

  salesExpanded = signal<boolean>(false);
  productionExpanded = signal<boolean>(false);
  printingIntelligenceExpanded = signal<boolean>(false);
  procurementExpanded = signal<boolean>(false);

  ngOnInit(): void {
    this.syncActiveDropdowns();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncActiveDropdowns();
    });
  }

  private syncActiveDropdowns(): void {
    if (this.isSalesRouteActive()) {
      this.salesExpanded.set(true);
    }
    if (this.isProductionRouteActive()) {
      this.productionExpanded.set(true);
    }
    if (this.isPrintingIntelligenceRouteActive()) {
      this.printingIntelligenceExpanded.set(true);
    }
    if (this.isProcurementRouteActive()) {
      this.procurementExpanded.set(true);
    }
  }

  toggleSales(): void {
    this.salesExpanded.update(v => !v);
  }

  toggleProduction(): void {
    this.productionExpanded.update(v => !v);
  }

  togglePrintingIntelligence(): void {
    this.printingIntelligenceExpanded.update(v => !v);
  }

  toggleProcurement(): void {
    this.procurementExpanded.update(v => !v);
  }

  isSalesRouteActive(): boolean {
    return this.router.url.startsWith('/admin/customers') || 
           this.router.url.startsWith('/admin/quotations');
  }

  isProductionRouteActive(): boolean {
    return this.router.url.startsWith('/admin/production/in-house') || 
           this.router.url.startsWith('/admin/production/outsourced');
  }

  isPrintingIntelligenceRouteActive(): boolean {
    return this.router.url.startsWith('/admin/printing-intelligence');
  }

  isProcurementRouteActive(): boolean {
    return this.router.url.startsWith('/admin/procurement');
  }

  isRouteActive(routePath: string): boolean {
    return this.router.url.startsWith(routePath);
  }
}
