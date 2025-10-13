import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regbody',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regbody.html',
  styleUrls: ['./regbody.css'],
})
export class Regbody {
  constructor(private commonService: CommonService, private router: Router) {}
  formData = {
    fname: '',
    lname: '',
    email: '',
    password: '',
    cpassword: '',
  };

  onSubmit(form: any) {
    if (form.invalid) {
      alert('Please correct the errors in the form.');
      return;
    }

    const credential = {
      email: this.formData.email,
      password: this.formData.password,
    };

    if (this.formData.email.endsWith('@admin.com')) {
      this.commonService.addAdmin(credential);
      alert('Welcome Admin');
    } else if (this.formData.email.endsWith('@fleet.com')) {
      this.commonService.addTechnician(credential);
      alert('Welcome Technician');
    } else {
      alert('Invalid email domain for registration. Please use @fleet.com.');
      return;
    }
    this.router.navigate(['/login']);
  }
}
