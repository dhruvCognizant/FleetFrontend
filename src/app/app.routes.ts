import { LandingPageComponent } from './LandingPage/landing-page/landing-page';
import { LoginComponent } from './Login/login';
import { ServiceSchedulingComponent } from './SCHEDULING/maintenance-scheduling/msadmin';
import { TechnicianAssignmentComponent } from './TECHNICIANS/ADMIN_VIEW/technician-assignment/technician-assignment';
import { UserAdmin } from './HISTORY/service-history/user-admin';
import { TechnicianTasksComponent } from './TECHNICIANS/TECHNICIAN_VIEW/technician-tasks/technician-tasks';
import { Content } from './VEHICLE/content/content';
import { Routes } from '@angular/router';
import { Dashboard } from './DASHBOARD/dashboard';
import { Regbody } from './Register/regbody';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'regForm', component: Regbody },
  {
    path: 'login/admin',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'Schedule', component: ServiceSchedulingComponent },
      { path: 'Technicians', component: TechnicianAssignmentComponent },
      { path: 'History', component: UserAdmin },
      { path: 'Content', component: Content },
      { path: '', component: Dashboard, pathMatch: 'full' },
    ],
  },
  {
    path: 'login/technician',
    children: [
      { path: 'Technician', component: TechnicianTasksComponent },
      { path: '', component: Dashboard, pathMatch: 'full' },
    ],
  },
];
