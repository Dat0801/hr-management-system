import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'leave-request',
    loadComponent: () =>
      import('./leave-request/leave-request.page').then((m) => m.LeaveRequestPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'payroll',
    loadComponent: () =>
      import('./payroll/payroll.page').then((m) => m.PayrollPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'performance-reviews',
    loadComponent: () =>
      import('./performance-reviews/performance-reviews.page').then((m) => m.PerformanceReviewsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./goals/goals.page').then((m) => m.GoalsPage),
    canActivate: [AuthGuard],
  },
];
