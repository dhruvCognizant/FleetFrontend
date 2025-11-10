import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from './services/common-service';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { Router, RouterOutlet } from '@angular/router';
import { LandingHeader } from './LandingPage/landing-header/landing-header';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet, LandingHeader, HttpClientModule],
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

   get isRegisterPage(): boolean {
    return this.router.url === '/regForm';
  }
  
  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
