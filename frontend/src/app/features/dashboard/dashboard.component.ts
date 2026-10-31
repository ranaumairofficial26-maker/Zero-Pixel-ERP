import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../customers/services/customer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private customerService = inject(CustomerService);

  totalActive = signal<number>(0);
  totalInactive = signal<number>(0);
  totalArchived = signal<number>(0);
  totalCustomers = signal<number>(0);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);

    forkJoin({
      active: this.customerService.getCustomers(undefined, 'active', 1, 10),
      inactive: this.customerService.getCustomers(undefined, 'inactive', 1, 10),
      archived: this.customerService.getCustomers(undefined, 'archived', 1, 10)
    }).subscribe({
      next: ({ active, inactive, archived }) => {
        this.totalActive.set(active.totalCount);
        this.totalInactive.set(inactive.totalCount);
        this.totalArchived.set(archived.totalCount);
        this.totalCustomers.set(active.totalCount + inactive.totalCount + archived.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
