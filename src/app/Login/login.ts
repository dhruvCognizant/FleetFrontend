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
  constructor(private commonService: CommonService, private router: Router) {}
  onSubmit(form: NgForm) {
    if (form.valid) {
      const { email, password } = form.value;
      const success = this.commonService.login(email, password);
      const parts = email.split('@');
      const emailParts = {
        name: parts[0],
        domain: parts[1],
      };
      if (success) {
        const role = this.commonService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/login/admin']);
        } else if (role === 'technician') {
          this.router.navigate(['/login/technician']);
        } else {
          this.router.navigate(['/login/user']);
        }
      } else {
        alert('Invalid credentials. Please try again.');
      }
    }
  }
}
