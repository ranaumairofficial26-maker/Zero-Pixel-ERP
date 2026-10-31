import { Routes } from '@angular/router';

export const QUOTATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/quotation-list/quotation-list.component').then(m => m.QuotationListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/quotation-create/quotation-create.component').then(m => m.QuotationCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/quotation-details/quotation-details.component').then(m => m.QuotationDetailsComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/quotation-edit/quotation-edit.component').then(m => m.QuotationEditComponent)
  },
  {
    path: ':id/preview',
    loadComponent: () => import('./pages/quotation-preview/quotation-preview.component').then(m => m.QuotationPreviewComponent)
  }
];

