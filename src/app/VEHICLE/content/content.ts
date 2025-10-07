import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { VehicleList } from '../vehicle-list/vehicle-list';
import { FormsModule, NgForm } from '@angular/forms';
import { NewVehicle } from '../interface/IVehicle';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { OdometerReading } from '../interface/IOdometer';
import { CommonService } from '../../services/common-service';
import { ServiceSchedulingComponent } from '../../SCHEDULING/maintenance-scheduling/msadmin';

declare var bootstrap: any;

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [VehicleList, FormsModule, CommonModule],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content implements OnInit {
  constructor(private vehicleService: VehicleService, private commonService: CommonService) {}

  @ViewChild('vehicleModal') vehicleModal!: ElementRef;
  @ViewChild('odometerModal') odometerModal!: ElementRef;
  @ViewChild(ServiceSchedulingComponent) serviceScheduler!: ServiceSchedulingComponent;

  currentUserRole: 'admin' | 'user' = 'user';
  registrationYears: number[] = [];
  today!: string;

  carBrands: string[] = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Hyundai',
    'Kia',
    'Volkswagen',
    'Nissan',
    'Tata',
    'Mahindra',
    'Suzuki',
    'Renault',
  ];

  vehicleTypes: string[] = ['Car', 'Truck'];

  newVehicle: NewVehicle = {
    vehicleId: '',
    type: '',
    Make: '',
    model: '',
    year: null,
    vin: '',
    lastService: '',
  };

  odometer: OdometerReading = {
    readingId: '',
    vehicleId: '',
    timestamp: new Date(),
    mileage: null,
  };

  ngOnInit() {
    const now = new Date();
    this.today = this.formatDate(now);
    const startYear = 1990;
    const currentYear = now.getFullYear();

    for (let year = currentYear; year >= startYear; year--) {
      this.registrationYears.push(year);
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }

  addVehicle(form: NgForm) {
    if (form.valid) {
      const newVeh = { ...this.newVehicle };
      newVeh.vehicleId = this.vehicleService.generateVehicleId();
      // Only set lastService to today if not provided by user
      if (!newVeh.lastService) {
        newVeh.lastService = this.formatDate(new Date());
      }
      this.commonService.addVehicle(newVeh);

      if (this.serviceScheduler) {
        console.log('if worked 1');
        this.serviceScheduler.refreshDropdowns();
      }
      form.resetForm();
      this.newVehicle = {
        vehicleId: '',
        type: '',
        Make: '',
        model: '',
        year: null,
        vin: '',
        lastService: '', // Let user set this, don't default to today
      };

      const modalInstance = bootstrap.Modal.getInstance(this.vehicleModal.nativeElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  submitOdometer(form: NgForm) {
    if (form.valid && this.odometer.vehicleId) {
      const readings = this.vehicleService
        .getOdometerReadings()
        .filter((r) => r.vehicleId === this.odometer.vehicleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const latestReading = readings[0];

      if (latestReading) {
        const newMileage = this.odometer.mileage ?? 0;
        const newTimestamp = new Date();

        if (newMileage < latestReading.mileage!) {
          alert('Mileage cannot be less than the last recorded value.');
          return;
        }

        if (newTimestamp.getTime() <= new Date(latestReading.timestamp).getTime()) {
          alert('Timestamp must be later than the last recorded reading.');
          return;
        }
      }

      this.odometer.timestamp = new Date();
      this.odometer.readingId = this.vehicleService.generateReadingId();
      const reading = { ...this.odometer };
      this.vehicleService.addOdometerReading(reading);
      console.log(reading);

      form.resetForm();
      this.odometer = {
        readingId: '',
        vehicleId: '',
        timestamp: new Date(),
        mileage: null,
      };

      const modalInstance = bootstrap.Modal.getInstance(this.odometerModal.nativeElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  selectVehicle(id: string) {
    this.odometer.vehicleId = id;
  }

  get newvehicles(): NewVehicle[] {
    return this.vehicleService.getVehicles();
  }

  get odometerReadings(): OdometerReading[] {
    return this.vehicleService.getOdometerReadings();
  }
}
