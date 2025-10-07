import { CommonModule } from '@angular/common';
import { CommonService } from '../services/common-service';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  public role: 'admin' | 'technician' | 'user' | null = null;

  constructor(private commonService: CommonService) {}

  ngOnInit() {
    this.role = this.commonService.getRole();
    console.log('Header role:', this.role);
  }
  get isLoggedIn(): boolean {
    return this.commonService.getRole() !== null;
  }
}
