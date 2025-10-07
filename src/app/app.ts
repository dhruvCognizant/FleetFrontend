import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from './services/common-service';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { Router } from '@angular/router';
// import { TechnicianAssignmentComponent } from './TECHNICIANS/ADMIN_VIEW/technician-assignment/technician-assignment';
// import { TechnicianTasksComponent } from './TECHNICIANS/TECHNICIAN_VIEW/technician-tasks/technician-tasks';
// import { UserAssignmentsComponent } from './TECHNICIANS/USER_VIEW/user-assignments/user-assignments';
// import { LoginComponent } from './Login/login';
// import { Content } from './VEHICLE/content/content';
// import { ServiceSchedulingComponent } from './SCHEDULING/maintenance-scheduling/msadmin';
// import { UserAdmin } from './HISTORY/service-history/user-admin';
import { RouterOutlet } from '@angular/router';
import { LandingHeader } from './LandingPage/landing-header/landing-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet, LandingHeader],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  constructor(public commonService: CommonService, private router: Router) {}

  get role(): 'admin' | 'technician' | 'user' | null {
    return this.commonService.getRole();
  }
  get isLandingPage(): boolean {
    return this.router.url === '/';
  }
  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
