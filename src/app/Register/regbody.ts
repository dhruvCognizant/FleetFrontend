import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
    firstName: '',
    lastName: '',
    skill: [] as string[],
    availability: [] as string[],
    email: '',
    password: '',
    confirmPassword: '',
  };

  showPassword = false;
  showConfirmPassword = false;

  skills = ['Oil Change', 'Brake Repair', 'Battery Test'];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updateSelection(value: string, field: 'skill' | 'availability', isChecked: boolean): void {
    const list = this.formData[field];
    if (isChecked) {
      if (!list.includes(value)) list.push(value);
    } else {
      const index = list.indexOf(value);
      if (index > -1) list.splice(index, 1);
    }
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      alert('Please correct the errors in the form.');
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    const technicianId = this.commonService.generateTechnicianId();
    const fullName = `${this.formData.firstName} ${this.formData.lastName}`;

    // Prepare payloads for backend registration
    const techPayload = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      skill: this.formData.skill.join(', '),
      availability: this.formData.availability.join(', '),
      email: this.formData.email,
      password: this.formData.password,
    };

    try {
      // Try backend API registration first
      if ((this.commonService as any).registerTechnicianApi) {
        await this.commonService.registerTechnicianApi(techPayload);
      } else {
        // fallback to local additions
        this.commonService.RegisterTechnicians({
          technicianId: technicianId,
          name: fullName,
          expertise: this.formData.skill.join(', '),
          availability: this.formData.availability.join(', '),
        });

        this.commonService.addTechnician({
          email: this.formData.email,
          password: this.formData.password,
        });
      }
    } catch (err) {
      // If API fails, still write locally
      console.error('Register API failed, falling back to local storage', err);
      this.commonService.RegisterTechnicians({
        technicianId: technicianId,
        name: fullName,
        expertise: this.formData.skill.join(', '),
        availability: this.formData.availability.join(', '),
      });

      this.commonService.addTechnician({
        email: this.formData.email,
        password: this.formData.password,
      });
    }

    alert(`Technician registered successfully! Your Technician ID is: ${technicianId}`);
    this.router.navigate(['/login']);
  }
}
