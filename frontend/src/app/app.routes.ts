import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/pages/customer-list/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/customers/pages/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'quotations',
        loadChildren: () => import('./features/quotations/quotations.routes').then(m => m.QUOTATION_ROUTES)
      },
      {
        path: 'production/in-house',
        loadComponent: () => import('./features/production/pages/in-house-production/in-house-production.component').then(m => m.InHouseProductionComponent)
      },
      {
        path: 'production/outsourced',
        loadComponent: () => import('./features/production/pages/outsourced-production/outsourced-production.component').then(m => m.OutsourcedProductionComponent)
      },
      {
        path: 'printing-intelligence/sheet-calculator',
        loadComponent: () => import('./features/printing-intelligence/pages/sheet-calculator/sheet-calculator.component').then(m => m.SheetCalculatorComponent)
      }
    ]
  },
  // Top-level aliases for direct navigation or refresh
  {
    path: 'quotations',
    redirectTo: 'admin/quotations'
  },
  {
    path: 'production',
    redirectTo: 'admin/production/in-house'
  },
  {
    path: 'printing-intelligence',
    redirectTo: 'admin/printing-intelligence/sheet-calculator'
  },
  {
    path: 'customers',
    redirectTo: 'admin/customers'
  },
  {
    path: 'dashboard',
    redirectTo: 'admin/dashboard'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
