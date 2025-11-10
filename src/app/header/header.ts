import { CommonModule } from '@angular/common';
import { CommonService } from '../services/common-service';
import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  public role: 'admin' | 'technician' | null = null;
  menuOpen = false;

  constructor(private commonService: CommonService, private router: Router) {}

  ngOnInit() {
    this.role = this.commonService.getRole();
    console.log('Header role:', this.role);
  }

  get isLoggedIn(): boolean {
    return this.commonService.getRole() !== null;
  }

  logout(): void {
    this.commonService.logout();
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
