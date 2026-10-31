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
export class SidebarComponent implements OnInit {
  private router = inject(Router);

  salesExpanded = signal<boolean>(true);

  ngOnInit(): void {
    if (this.isSalesRouteActive()) {
      this.salesExpanded.set(true);
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isSalesRouteActive()) {
        this.salesExpanded.set(true);
      }
    });
  }

  toggleSales(): void {
    this.salesExpanded.update(v => !v);
  }

  isSalesRouteActive(): boolean {
    return this.router.url.startsWith('/admin/customers') || this.router.url.startsWith('/admin/quotations');
  }

  isRouteActive(routePath: string): boolean {
    return this.router.url.startsWith(routePath);
  }
}
