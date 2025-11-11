import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  ngOnInit(): void {
  
  }

  showPassword = false;

  constructor(private commonService: CommonService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      const { email, password } = form.value;
      let success = false;
      if ((this.commonService as any).apiLogin) {
        success = await this.commonService.apiLogin(email, password);
      }

      if (!success) {
        success = await this.commonService.apiLogin(email, password);
      }

      if (success) {
        const role = this.commonService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'technician') {
          this.router.navigate(['/technician']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        alert('Invalid credentials. Please try again.');
      }
    }
  }
}
