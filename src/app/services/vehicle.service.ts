import { Injectable } from '@angular/core';
import { NewVehicle } from '../VEHICLE/interface/IVehicle';
import { OdometerReading } from '../VEHICLE/interface/IOdometer';
import { CommonService } from './common-service';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private odometerReadings: OdometerReading[] = [];
  constructor(private commonService: CommonService) {}
  getVehicles(): NewVehicle[] {
    return this.commonService.getRegisteredVehicles();
  }
  addVehicle(vehicle: NewVehicle): void {
    this.commonService.addVehicle(vehicle);
  }
  generateVehicleId(): string {
    return 'V00' + (this.commonService.getRegisteredVehicles().length + 1);
  }
  getOdometerReadings(): OdometerReading[] {
    return this.odometerReadings;
  }
  addOdometerReading(reading: OdometerReading): void {
    this.odometerReadings.push(reading);
  }
  getLatestMileage(vehicleId: string): number | null {
    const readings = this.odometerReadings
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return readings.length ? readings[0].mileage : null;
  }
  getMileageHistory(vehicleId: string): OdometerReading[] {
    return this.odometerReadings
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  generateReadingId(): string {
    return 'r00' + (this.odometerReadings.length + 1);
  }
}
