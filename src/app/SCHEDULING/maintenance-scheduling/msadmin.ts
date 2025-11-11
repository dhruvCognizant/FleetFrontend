import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common-service';
import { NewVehicle } from '../../VEHICLE/interface/IVehicle';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-service-scheduling',
  standalone: true,
  templateUrl: './msadmin.html',
  styleUrls: ['./msadmin.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ServiceSchedulingComponent implements OnInit, DoCheck {
  scheduleForm!: FormGroup;
  availableVehicles: NewVehicle[] = [];
  techniciansForDropdown: {
    _id: string;
    name: string;
    expertise: string;
    availability: string;
    isSelectable: boolean;
  }[] = [];
  scheduledServicesList: any[] = [];

  technicians: any[] = [];
  techniciansAvailableToday: any[] = [];

  nextServiceKmDisplay: string = '';
  nextServiceDateDisplay: string = '';
  serviceFrequency: { [key: string]: { km: number; days: number } } = {
    Car: { km: 10000, days: 180 },
    Truck: { km: 20000, days: 365 },
  };

  minDate!: string;
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.scheduleForm = this.fb.group({
      vin: [null, Validators.required],
      technician: [null, Validators.required],
      serviceType: [{ value: '', disabled: true }, Validators.required],
      dueDate: ['', Validators.required],
    });

    this.refreshDropdowns();
    this.loadScheduledServices();
    this.scheduleForm.get('technician')?.valueChanges.subscribe((technicianName) => {
      const selectedTechnician = this.techniciansForDropdown.find(
        (tech) => tech.name === technicianName
      );
      const currentServiceType = this.scheduleForm.get('serviceType')?.value;

      if (!currentServiceType && selectedTechnician) {
        this.scheduleForm.patchValue({ serviceType: selectedTechnician.expertise });
      }
    });
  }

  ngDoCheck(): void {
    if (this.commonService.vehicleListChanged || this.commonService.technicianListChanged) {
      this.refreshDropdowns();
      this.commonService.vehicleListChanged = false;
      this.commonService.technicianListChanged = false;
    }
  }

  get availableTechniciansCount(): number {
    return this.techniciansAvailableToday.length;
  }

  get scheduledServices(): any[] {
    return this.scheduledServicesList;
  }

  loadScheduledServices(): void {
    this.commonService.getScheduledServices().subscribe({
      next: (services: any[]) => {
        this.scheduledServicesList = services;
      },
      error: (err) => {
        console.error('Failed to load scheduled services:', err);
      },
    });
  }

  refreshDropdowns(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('No auth token present');
      return;
    }

    this.commonService.fetchUnassignedServices().subscribe({
      next: (response: any) => {
        const services = response.unassigned_services || [];
        this.availableVehicles = services.map((s: any) => ({
          type: s.vehicleType || '',
          make: s.vehicleMake || '',
          model: s.vehicleModel || '',
          year: s.vehicleYear || null,
          VIN: s.vehicleVIN,
          lastServiceDate: s.lastServiceDate
            ? this.commonService.parseBackendDateToISO(s.lastServiceDate)
            : undefined,
          serviceType: s.serviceType || '',
          nextServiceMileage: null,
          hasOpenUnpaidService: false,
        }));
      },
      error: (err) => {
        console.error('Failed to load unassigned services:', err);
      },
    });

    this.commonService.fetchAvailableTechniciansForCard().subscribe({
      next: (res: any) => {
        this.techniciansAvailableToday = res.technician;
      },
      error: (err) => {
        console.error('Failed to load available technicians for card:', err);
        this.techniciansAvailableToday = [];
      },
    });
  }
  submitService(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const formValue = this.scheduleForm.getRawValue();
    const serviceType = formValue.serviceType;
    const technicianName = formValue.technician;

    if (!serviceType || !technicianName) {
      alert('Missing service type or technician.');
      return;
    }

    const technician = this.techniciansForDropdown.find((t) => t.name === technicianName);
    if (!technician || !technician._id) {
      alert('Selected technician not found or missing ID.');
      return;
    }

    const payload = {
      vehicleVIN: formValue.vin,
      serviceType,
      technicianId: technician._id,
      dueServiceDate: new Date(formValue.dueDate).toISOString(),
    };

    this.commonService.scheduleService(payload).subscribe({
      next: (res) => {
        alert(res.message || 'Service scheduled successfully');

        this.refreshDropdowns();

        const vin = formValue.vin;
        if (vin) this.vehicleChanged(vin);

        this.scheduleForm.reset();
        this.nextServiceKmDisplay = '';
        this.nextServiceDateDisplay = '';

        this.loadScheduledServices();
      },

      error: (err) => {
        alert(err.error?.error || 'Failed to schedule service');
      },
    });
    this.loadScheduledServices();
  }
  vehicleChanged(vin: string): void {
    const vehicle = this.availableVehicles.find((v) => v.VIN === vin);
    if (!vehicle) return;

    const serviceType = vehicle.serviceType || '';
    this.scheduleForm.patchValue({ serviceType });

    const freq = this.serviceFrequency[vehicle.type];
    if (!freq) return;

    const latestReading = this.vehicleService
      .getOdometerReadings()
      .filter((r) => r.vin === vin)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const lastMileage = latestReading?.mileage ?? 0;
    const nextMileage = lastMileage + freq.km;
    this.nextServiceKmDisplay = nextMileage.toString();

    const lastServiceDate = new Date(vehicle.lastServiceDate ?? '');
    const nextDate = new Date(lastServiceDate);
    nextDate.setDate(nextDate.getDate() + freq.days);
    this.nextServiceDateDisplay = nextDate.toISOString().split('T')[0];

    this.commonService.fetchAvailableTechnicians(serviceType).subscribe({
      next: (res: any) => {
        this.techniciansForDropdown = res.technician.map((tech: any) => ({
          name: tech.name,
          _id: tech._id,
          isSelectable: true,
        }));
      },
      error: (err: any) => {
        console.error('Failed to load technicians:', err);
        this.techniciansForDropdown = [];
      },
    });
  }
}
