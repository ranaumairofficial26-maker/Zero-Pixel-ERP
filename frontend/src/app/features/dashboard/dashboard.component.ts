import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CustomerService } from '../customers/services/customer.service';
import { QuotationService } from '../quotations/services/quotation.service';
import { ProductionService } from '../production/services/production.service';
import { ProductionJob } from '../production/models/production.model';
import { InvoiceService } from '../invoices/services/invoice.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private quotationService = inject(QuotationService);
  private productionService = inject(ProductionService);
  private invoiceService = inject(InvoiceService);

  totalActive = signal<number>(0);
  totalQuotations = signal<number>(0);
  totalInHouseJobs = signal<number>(0);
  inHouseInProgress = signal<number>(0);
  totalOutsourcedJobs = signal<number>(0);
  outsourcedInProgress = signal<number>(0);
  totalInvoices = signal<number>(0);
  invoiceClients = signal<{ customerName: string; count: number; invoiceNumbers: string[] }[]>([]);
  
  // Live Queue & Recent Jobs
  recentJobs = signal<ProductionJob[]>([]);
  isLoading = signal<boolean>(true);
  currentDate = new Date();

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  get adminDisplayName(): string {
    const name = this.authService.currentUser()?.fullName || 'Naveed Ahmad';
    return name.toLowerCase().includes('admin') ? name : `Admin ${name}`;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);

    forkJoin({
      customers: this.customerService.getCustomers(undefined, 'active', 1, 1).pipe(
        catchError(() => of({ totalCount: 0, items: [], page: 1, pageSize: 1, totalPages: 0 }))
      ),
      quotations: this.quotationService.getSummary().pipe(
        catchError(() => of({ totalQuotations: 0, pendingApproval: 0, approved: 0, sent: 0, totalRevenue: 0 }))
      ),
      inHouse: this.productionService.getJobs('IN_HOUSE').pipe(
        catchError(() => of([]))
      ),
      outsourced: this.productionService.getJobs('OUTSOURCED').pipe(
        catchError(() => of([]))
      ),
      invoices: this.invoiceService.getInvoices(undefined, 1, 100).pipe(
        catchError(() => of({ totalCount: 0, items: [], page: 1, pageSize: 100, totalPages: 0 }))
      )
    }).subscribe({
      next: ({ customers, quotations, inHouse, outsourced, invoices }) => {
        this.totalActive.set(customers.totalCount || 0);
        this.totalQuotations.set((quotations as any)?.totalQuotations || 0);
        this.totalInHouseJobs.set(inHouse.length || 0);
        this.inHouseInProgress.set(inHouse.filter(j => j.status === 'In Progress' || j.status === 'Printing').length);
        this.totalOutsourcedJobs.set(outsourced.length || 0);
        this.outsourcedInProgress.set(outsourced.filter(j => j.status === 'In Progress' || j.status === 'Pending Vendor PO').length);

        this.totalInvoices.set(invoices.totalCount || 0);
        const clientMap = new Map<string, { customerName: string; count: number; invoiceNumbers: string[] }>();
        for (const inv of invoices.items || []) {
          const name = (inv.customerName || 'Unknown Client').trim();
          const existing = clientMap.get(name);
          if (existing) {
            existing.count += 1;
            if (inv.invoiceNumber) existing.invoiceNumbers.push(inv.invoiceNumber);
          } else {
            clientMap.set(name, {
              customerName: name,
              count: 1,
              invoiceNumbers: inv.invoiceNumber ? [inv.invoiceNumber] : []
            });
          }
        }
        this.invoiceClients.set(Array.from(clientMap.values()).sort((a, b) => b.count - a.count));
        
        // Combine and sort top 5 recent production jobs
        const allJobs = [...inHouse, ...outsourced].sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        this.recentJobs.set(allJobs.slice(0, 5));
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'In Progress':
      case 'Printing':
        return 'badge-progress';
      case 'Completed':
        return 'badge-completed';
      case 'Queued':
      case 'Pending Vendor PO':
        return 'badge-queued';
      case 'On Hold':
        return 'badge-hold';
      default:
        return 'badge-default';
    }
  }
}
