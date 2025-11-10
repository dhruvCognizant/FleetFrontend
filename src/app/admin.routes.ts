import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./DASHBOARD/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./SCHEDULING/maintenance-scheduling/msadmin').then(m => m.ServiceSchedulingComponent)
  },
  {
    path: 'technician',
    loadComponent: () => import('./TECHNICIANS/ADMIN_VIEW/technician-assignment/technician-assignment').then(m => m.TechnicianAssignmentComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./HISTORY/service-history/user-admin').then(m => m.UserAdmin)
  },
  {
    path: 'vehicle',
    loadComponent: () => import('./VEHICLE/content/content').then(m => m.Content)
  },
  {
    path: '', 
    loadComponent: () => import('./DASHBOARD/dashboard').then(m => m.Dashboard),
    pathMatch: 'full'
  },
];