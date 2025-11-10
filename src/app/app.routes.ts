import { LandingPageComponent } from './LandingPage/landing-page/landing-page';
import { LoginComponent } from './Login/login';
import { Routes } from '@angular/router';
import { Regbody } from './Register/regbody';
import { isLoggedInGuard, hasRole } from './guards/auth.guard';
import { TechnicianTasksComponent } from './TECHNICIANS/TECHNICIAN_VIEW/technician-tasks/technician-tasks';
export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'regForm', component: Regbody },
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [isLoggedInGuard, hasRole('admin')]
  },
  {
    path: 'technician',
    loadChildren: () => import('./technician.routes').then(m => m.TECHNICIAN_ROUTES),
    canActivate: [isLoggedInGuard, hasRole('technician')]
  },
  {
  path: 'technician/myTasks',
  component: TechnicianTasksComponent,
  canActivate: [isLoggedInGuard, hasRole('technician')] // optional, if protected
}

];
