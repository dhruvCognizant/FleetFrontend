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



  serviceFrequency: { [key: string]: { km: number; days: number } } = {
    Car: { km: 10000, days: 180 }, // 6 months
    Truck: { km: 20000, days: 365 }, // 1 year
  };

  vehicleTypes: string[] = ['Car', 'Truck'];

vehicleData: {
  [type: string]: {
    [make: string]: string[];
  };
} = {
  Car: {
    Toyota: ['Corolla', 'Camry', 'Yaris', 'Prius', 'Fortuner'],
    Honda: ['Civic', 'Accord', 'City', 'Jazz', 'CR-V'],
    Ford: ['Focus', 'Fusion', 'Mustang', 'EcoSport', 'Fiesta'],
    Chevrolet: ['Cruze', 'Malibu', 'Spark', 'Aveo', 'Impala'],
    BMW: ['3 Series', '5 Series', 'X1', 'X3', 'X5'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLA', 'GLC', 'S-Class'],
    Audi: ['A3', 'A4', 'Q3', 'Q5', 'Q7'],
    Hyundai: ['i20', 'Verna', 'Elantra', 'Creta', 'Venue'],
    Kia: ['Seltos', 'Carnival', 'Sonet', 'Sportage', 'EV6'],
    Volkswagen: ['Polo', 'Vento', 'Passat', 'Tiguan', 'Taigun'],
    Nissan: ['Micra', 'Sunny', 'Kicks', 'Magnite', 'Terrano'],
    Tata: ['Altroz', 'Tiago', 'Tigor', 'Nexon', 'Harrier'],
    Mahindra: ['Bolero', 'Scorpio', 'XUV300', 'XUV500', 'Thar'],
    Suzuki: ['Swift', 'Dzire', 'Baleno', 'Ciaz', 'Vitara'],
    Renault: ['Kwid', 'Triber', 'Kiger', 'Duster', 'Captur'],
  },
  Truck: {
    Tata: ['Ace', 'Intra', 'Ultra', 'Prima', 'Signa'],
    Mahindra: ['Jeeto', 'Bolero Pickup', 'Furio', 'Blazo', 'Supro'],
    AshokLeyland: ['Ecomet', 'Boss', 'Captain', 'Dost', 'Partner'],
    Eicher: ['Pro 2049', 'Pro 3015', 'Pro 6025', 'Pro 1110XPT', 'Pro 2095XP'],
    BharatBenz: ['1217C', '1617R', '2823C', '3528C', '4023T'],
  },
};


  newVehicle: NewVehicle = {
    type: '',
    make: '',
    model: '',
    year: null,
    VIN: '',
    lastServiceDate: '',
  };

  odometer: OdometerReading = {
    readingId: '',
    vin: '',
    timestamp: new Date(),
    mileage: null,
    serviceType: '',
  };

  ngOnInit(): void {
    const now = new Date();
    this.today = this.formatDate(now);
    const startYear = 1990;
    const currentYear = now.getFullYear();

    for (let year = currentYear; year >= startYear; year--) {
      this.registrationYears.push(year);
    }

    // If admin is logged in, fetch authoritative vehicle list from backend
    if (this.commonService.getRole() === 'admin') {
      this.vehicleService.fetchVehiclesApi().subscribe({
        next: (vehicles) => {
          if (vehicles && vehicles.length > 0) {
            // assign to your local list if needed
            // e.g. this.vehicles = vehicles;
          }
        },
        error: (err) => {
          console.warn('Could not fetch vehicles from backend on init:', err);
        }
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }
  getMakesForType(type: string): string[] {
  return type && this.vehicleData[type]
    ? Object.keys(this.vehicleData[type])
    : [];
}

getModelsForMake(type: string, make: string): string[] {
  return type && make && this.vehicleData[type]?.[make]
    ? this.vehicleData[type][make]
    : [];
}

  addVehicle(form: NgForm): void {
    if (!form.valid) return;

    const newVeh = { ...this.newVehicle };

    if (!newVeh.lastServiceDate) {
      newVeh.lastServiceDate = this.formatDate(new Date());
    }

    const freq = this.serviceFrequency[newVeh.type];
    if (freq) {
      (newVeh as any).serviceKm = freq.km;
      (newVeh as any).serviceDays = freq.days;
    }

    if (this.commonService.getRole() === 'admin') {
      this.vehicleService.addVehicleApi(newVeh).subscribe({
        next: () => {
          // refresh frontend list from backend
          this.vehicleService.fetchVehiclesApi().subscribe({
            error: (err) => console.warn('Could not refresh vehicles after add:', err)
          });
        },
        error: (err) => {
          console.error('Add vehicle API failed', err);
          const msg = err?.error?.message || err?.message || 'Failed to add vehicle';
          alert(msg);

          // optional: local add if you still want offline support
          // this.vehicleService.addVehicle(newVeh);
        }
      });
    } else {
      // local-only add (non-admin)
      this.vehicleService.addVehicle(newVeh);
    }

    if (this.serviceScheduler) {
      this.serviceScheduler.refreshDropdowns();
    }

    form.resetForm();
    this.newVehicle = {
      type: '',
      make: '',
      model: '',
      year: null,
      VIN: '',
      lastServiceDate: '',
    };

    const modalInstance = bootstrap.Modal.getInstance(this.vehicleModal.nativeElement);
    if (modalInstance) modalInstance.hide();
  }


submitOdometer(form: NgForm): void {
  if (!form.valid || !this.odometer.vin) return;

  const mileageValue = Number(this.odometer.mileage ?? 0);
  if (isNaN(mileageValue)) {
    alert('Please enter a valid mileage.');
    return;
  }

  // Fetch vehicle from in-memory list to decide client-side behavior
  const vehicles = this.vehicleService.getRegisteredVehicles();
  const vehicle = vehicles.find(
    v => (v.VIN || '').toLowerCase() === (this.odometer.vin || '').toLowerCase()
  );
  const nextServiceMileage = vehicle ? vehicle.nextServiceMileage : null;
  const hasOpenUnpaidService = vehicle ? vehicle.hasOpenUnpaidService : false;

  if (hasOpenUnpaidService) {
    alert('There is an existing unpaid service for this vehicle. Please settle it before adding a new odometer reading.');
    return;
  }

  if (!nextServiceMileage || nextServiceMileage === 0) {
    if (!this.odometer.serviceType?.trim()) {
      alert('serviceType is required for the first odometer entry.');
      return;
    }
  } else {
    if (mileageValue < nextServiceMileage) {
      alert('Mileage is less than nextServiceMileage; reading not added until due.');
      return;
    }
    if (!this.odometer.serviceType?.trim()) {
      alert('serviceType is required when vehicle is due for service.');
      return;
    }
  }

  // Build payload
  const payload: any = { mileage: mileageValue };
  if (this.odometer.serviceType) payload.serviceType = this.odometer.serviceType;

  // Call backend API (Observable)
  this.vehicleService.addOdometerApi(this.odometer.vin, payload).subscribe({
    next: (resp) => {
      const created = resp.reading || {};
      const readingObj: OdometerReading = {
        readingId: created.readingId || created.readingID || this.vehicleService.generateReadingId(),
        vin: this.odometer.vin,
        timestamp: created.date ? new Date(created.date) : new Date(),
        mileage: typeof created.mileage === 'number' ? created.mileage : mileageValue,
        serviceType: this.odometer.serviceType || created.serviceType || '',
      };

      // Update local store so UI reflects new reading
      this.vehicleService.addOdometerReading(readingObj);

      // Refresh vehicles so nextServiceMileage updates
      this.vehicleService.fetchVehiclesApi().subscribe();

      // Inform user
      if (resp.serviceId) {
        alert(`Odometer saved. Service created (id: ${resp.serviceId}).`);
      } else if (resp.nextServiceMileage) {
        alert(`Odometer saved. Next service mileage set to ${resp.nextServiceMileage}.`);
      } else {
        console.log('Odometer saved via API', resp);
      }

      // Reset form and hide modal
      form.resetForm();
      this.odometer = { readingId: '', vin: '', timestamp: new Date(), mileage: null, serviceType: '' };
      const modalInstance = bootstrap.Modal.getInstance(this.odometerModal.nativeElement);
      if (modalInstance) modalInstance.hide();
    },
    error: (err) => {
      const message = err?.error?.message || err?.message || 'Failed to save odometer reading via API';
      alert(message);
    }
  });
}


  selectVehicle(id: string) {
    this.odometer.vin = id;
  }

  get newvehicles(): NewVehicle[] {
    return this.vehicleService.getVehicles();
  }

  get odometerReadings(): OdometerReading[] {
    return this.vehicleService.getOdometerReadings();
  }
}
