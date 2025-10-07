import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common-service';
import { NewVehicle } from '../../VEHICLE/interface/IVehicle';

@Component({
  selector: 'app-service-scheduling',
  standalone: true,
  templateUrl: './msadmin.html',
  styleUrls: ['./msadmin.css'],
  imports: [CommonModule, ReactiveFormsModule],
})

export class ServiceSchedulingComponent implements OnInit, DoCheck {
  scheduleForm!: FormGroup;
  showOtherInput = false;
  availableVehicles: NewVehicle[] = [];
  availableTechnicians: { name: string }[] = [];
  serviceTypes = ['Oil Change', 'Brake Check', 'Battery Test'];

  minDate!: string;
  constructor(private fb: FormBuilder, private commonService: CommonService) {}
  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    this.scheduleForm = this.fb.group({
      vehicleId: ['', Validators.required],
      technician: ['', Validators.required],
      serviceType: ['', Validators.required],
      customServiceType: [''],
      dueDate: ['', Validators.required],
    });

    // Always refresh on init
    this.refreshDropdowns();
  }

  // Checks if vehicle or technician lists have changed
  ngDoCheck(): void {
    if (this.commonService.vehicleListChanged || this.commonService.technicianListChanged) {
      this.refreshDropdowns();
      this.commonService.vehicleListChanged = false;
      this.commonService.technicianListChanged = false;
    }
  }

  get scheduledServices(): any[] {
    return this.commonService.getScheduledServices();
  }

  refreshDropdowns(): void {
    this.availableVehicles = this.commonService.getAvailableVehicles();
    this.availableTechnicians = this.commonService.getRegisteredTechnicians();
    console.log('Technician list changed:', this.commonService.technicianListChanged);
    console.log('Available technicians:', this.availableTechnicians);
  }

  checkOther(event: any): void {
    this.showOtherInput = event.target.value === 'Others';
    if (!this.showOtherInput) {
      this.scheduleForm.patchValue({ customServiceType: '' });
    }
  }

  submitService(): void {
    if (this.scheduleForm.invalid) return;

    const formValue = this.scheduleForm.value;
    const serviceType =
      formValue.serviceType === 'Others' ? formValue.customServiceType : formValue.serviceType;

    const serviceId = this.commonService.generateServiceId(serviceType);

    const newService = {
      serviceId,
      vehicleId: formValue.vehicleId,
      technician: formValue.technician,
      serviceType,
      dueDate: formValue.dueDate,
    };

    this.commonService.addScheduledService(newService);
    this.refreshDropdowns();
    this.scheduleForm.reset();
    this.showOtherInput = false;
  }
}
