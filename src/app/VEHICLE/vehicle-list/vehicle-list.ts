import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import { SearchPipe } from '../../pipes/search-pipe';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { NewVehicle } from '../interface/IVehicle';
import { OdometerReading } from '../interface/IOdometer';
declare var bootstrap: any;

@Component({
  selector: 'app-vehicle-list',
  imports: [CommonModule, SearchPipe, FormsModule],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.css'],
})
export class VehicleList implements OnInit {
  constructor(private vehicleService: VehicleService) {}

  searchQuery = '';
  @Input() vehicles: NewVehicle[] = [];
  @ViewChild('historyModal') historyModal!: ElementRef;
  @Input() odometerReadings: OdometerReading[] = [];
  selectedVehicle: NewVehicle | null = null;
  mileageHistory: OdometerReading[] = [];

  ngOnInit(): void {
    if (!this.vehicles || this.vehicles.length === 0) {
      this.vehicleService.fetchVehiclesApi().subscribe({
        next: (fetched) => {
          if (fetched && fetched.length > 0) {
            this.vehicles = fetched;
          }
        },
        error: (err) => {
          console.warn('Unable to fetch vehicles on init:', err);
        },
      });
    }
  }

  openMileageHistory(vin: string): void {
    const vehicle = this.vehicles.find((v) => v.VIN === vin);
    if (vehicle) {
      this.selectedVehicle = { ...vehicle };

      this.vehicleService.fetchOdometerReadings(vin).subscribe({
        next: (apiReadings) => {
          if (apiReadings && apiReadings.length > 0) {
            this.mileageHistory = apiReadings.map((r) => ({ ...r }));
          } else {
            this.mileageHistory = this.vehicleService.getMileageHistory(vin);
          }

          const modalInstance = new bootstrap.Modal(this.historyModal.nativeElement);
          modalInstance.show();
        },
        error: (err) => {
          console.warn('Could not fetch odometer readings from API:', err);
          this.mileageHistory = this.vehicleService.getMileageHistory(vin);

          const modalInstance = new bootstrap.Modal(this.historyModal.nativeElement);
          modalInstance.show();
        },
      });
    }
  }

  getLatestMileage(vin: string): number | null {
    return this.vehicleService.getLatestMileage(vin);
  }
}
