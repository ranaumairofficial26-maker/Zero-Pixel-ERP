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
     ///{
     ///  path: 'setting',
     ///  loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
     ///},
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
        path: 'production-sheet',
        loadComponent: () => import('./features/production/pages/production-sheet/production-sheet.component').then(m => m.ProductionSheetComponent)
      },
      {
        path: 'production/production-sheet',
        redirectTo: 'production-sheet'
      },
      {
        path: 'printing-intelligence/printing-calculator',
        loadComponent: () => import('./features/printing-intelligence/pages/printing-calculator/printing-calculator.component').then(m => m.PrintingCalculatorComponent)
      },
      {
        path: 'printing-intelligence',
        redirectTo: 'printing-intelligence/printing-calculator',
        pathMatch: 'full'
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/invoices/pages/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
      },
      {
        path: 'invoices/create',
        loadComponent: () => import('./features/invoices/pages/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
      },
      {
        path: 'invoices/edit/:id',
        loadComponent: () => import('./features/invoices/pages/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
      },
      {
        path: 'invoices/view/:id',
        loadComponent: () => import('./features/invoices/pages/invoice-view/invoice-view.component').then(m => m.InvoiceViewComponent)
      },
      {
        path: 'procurement/suppliers-directory',
        loadComponent: () => import('./features/procurement/pages/suppliers-directory/suppliers-directory.component').then(m => m.SuppliersDirectoryComponent)
      },
      {
        path: 'procurement/suppliers-directory/create',
        loadComponent: () => import('./features/procurement/pages/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent)
      },
      {
        path: 'procurement/suppliers-directory/edit/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent)
      },
      {
        path: 'procurement/suppliers-directory/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-profile/supplier-profile.component').then(m => m.SupplierProfileComponent)
      },
      {
        path: 'procurement/supplier-quotes',
        loadComponent: () => import('./features/procurement/pages/supplier-quotes/supplier-quotes.component').then(m => m.SupplierQuotesComponent)
      },
      {
        path: 'procurement/supplier-quotes/create',
        loadComponent: () => import('./features/procurement/pages/supplier-quote-form/supplier-quote-form.component').then(m => m.SupplierQuoteFormComponent)
      },
      {
        path: 'procurement/supplier-quotes/edit/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-quote-form/supplier-quote-form.component').then(m => m.SupplierQuoteFormComponent)
      },
      {
        path: 'procurement/supplier-quotes/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-quote-view/supplier-quote-view.component').then(m => m.SupplierQuoteViewComponent)
      },
      {
        path: 'procurement/purchase-orders',
        loadComponent: () => import('./features/procurement/pages/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent)
      },
      {
        path: 'procurement/purchase-orders/create',
        loadComponent: () => import('./features/procurement/pages/purchase-order-form/purchase-order-form.component').then(m => m.PurchaseOrderFormComponent)
      },
      {
        path: 'procurement/purchase-orders/edit/:id',
        loadComponent: () => import('./features/procurement/pages/purchase-order-form/purchase-order-form.component').then(m => m.PurchaseOrderFormComponent)
      },
      {
        path: 'procurement/purchase-orders/:id',
        loadComponent: () => import('./features/procurement/pages/purchase-order-view/purchase-order-view.component').then(m => m.PurchaseOrderViewComponent)
      },
      {
        path: 'procurement/supplier-bills',
        loadComponent: () => import('./features/procurement/pages/supplier-bills/supplier-bills.component').then(m => m.SupplierBillsComponent)
      },
      {
        path: 'procurement/supplier-bills/create',
        loadComponent: () => import('./features/procurement/pages/supplier-bill-form/supplier-bill-form.component').then(m => m.SupplierBillFormComponent)
      },
      {
        path: 'procurement/supplier-bills/edit/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-bill-form/supplier-bill-form.component').then(m => m.SupplierBillFormComponent)
      },
      {
        path: 'procurement/supplier-bills/aging-report',
        loadComponent: () => import('./features/procurement/pages/supplier-bill-aging/supplier-bill-aging.component').then(m => m.SupplierBillAgingComponent)
      },
      {
        path: 'procurement/supplier-bills/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-bill-view/supplier-bill-view.component').then(m => m.SupplierBillViewComponent)
      },
      {
        path: 'procurement/supplier-payments',
        loadComponent: () => import('./features/procurement/pages/supplier-payments/supplier-payments.component').then(m => m.SupplierPaymentsComponent)
      },
      {
        path: 'procurement/supplier-payments/create',
        loadComponent: () => import('./features/procurement/pages/supplier-payment-form/supplier-payment-form.component').then(m => m.SupplierPaymentFormComponent)
      },
      {
        path: 'procurement/supplier-payments/:id',
        loadComponent: () => import('./features/procurement/pages/supplier-payment-view/supplier-payment-view.component').then(m => m.SupplierPaymentViewComponent)
      },
      {
        path: 'procurement',
        redirectTo: 'procurement/suppliers-directory',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  },
  // Top-level aliases for direct navigation or refresh
  {
    path: 'settings',
    redirectTo: 'admin/settings'
  },
  {
    path: 'printing-intelligence',
    redirectTo: 'admin/printing-intelligence/printing-calculator'
  },
  {
    path: 'printing-calculator',
    redirectTo: 'admin/printing-intelligence/printing-calculator'
  },
  {
    path: 'invoices',
    redirectTo: 'admin/invoices'
  },
  {
    path: 'procurement',
    redirectTo: 'admin/procurement/suppliers-directory'
  },
  {
    path: 'quotations',
    redirectTo: 'admin/quotations'
  },
  {
    path: 'production',
    redirectTo: 'admin/production/in-house'
  },
  {
    path: 'production-sheet',
    redirectTo: 'admin/production/production-sheet'
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
