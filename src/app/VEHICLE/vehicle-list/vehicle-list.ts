import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
  styleUrl: './vehicle-list.css',
})
export class VehicleList {
  constructor(private vehicleService: VehicleService) {}
  searchQuery = '';
  @Input() vehicles: NewVehicle[] = [];
  @ViewChild('historyModal') historyModal!: ElementRef;
  @Input() odometerReadings: OdometerReading[] = [];
  selectedVehicle: NewVehicle | null = null;
  mileageHistory: OdometerReading[] = [];

  openMileageHistory(vehicleId: string) {
    const vehicle = this.vehicles.find((v) => v.vehicleId === vehicleId);
    if (vehicle) {
      this.selectedVehicle = { ...vehicle };
      this.mileageHistory = this.vehicleService.getMileageHistory(vehicleId);

      const modalInstance = new bootstrap.Modal(this.historyModal.nativeElement);
      modalInstance.show();
    }
  }

  getLatestMileage(vehicleId: string): number | null {
    return this.vehicleService.getLatestMileage(vehicleId);
  }
}
