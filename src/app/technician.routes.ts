import { Routes } from '@angular/router';

export const TECHNICIAN_ROUTES: Routes = [
  {
    path: 'myTasks',
    loadComponent: () => import('./TECHNICIANS/TECHNICIAN_VIEW/technician-tasks/technician-tasks').then(m => m.TechnicianTasksComponent)
  },
  {
    path: '',
    loadComponent: () => import('./DASHBOARD/dashboard').then(m => m.Dashboard),
    pathMatch: 'full'
  },
];