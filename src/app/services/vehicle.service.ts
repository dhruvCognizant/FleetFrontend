import { Injectable } from '@angular/core';
import { NewVehicle } from '../VEHICLE/interface/IVehicle';
import { OdometerReading } from '../VEHICLE/interface/IOdometer';
import { CommonService } from './common-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private registeredVehicles: NewVehicle[] = [];
  private API_BASE = environment.apiBaseUrl;
  private odometerReadings: OdometerReading[] = [];

  constructor(private commonService: CommonService, private http: HttpClient) {}

  addVehicle(vehicle: NewVehicle): void {
    this.registeredVehicles.push(vehicle);
    console.log(this.registeredVehicles, vehicle);
    this.commonService.vehicleListChanged = true;
  }

  addOdometerReading(reading: OdometerReading): void {
    this.odometerReadings.push(reading);
  }

  getOdometerReadings(): OdometerReading[] {
    return this.odometerReadings;
  }

  getRegisteredVehicles(): NewVehicle[] {
    return this.registeredVehicles;
  }

  getVehicles(): NewVehicle[] {
    return this.getRegisteredVehicles();
  }

  getLatestMileage(vin: string): number | null {
    const readings = this.odometerReadings
      .filter((r) => r.vin === vin)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return readings.length ? readings[0].mileage : null;
  }

  getMileageHistory(vin: string): OdometerReading[] {
    return this.odometerReadings
      .filter((r) => r.vin === vin)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addVehicleApi(vehicle: NewVehicle): Observable<any> {
    if (this.commonService.getRole() !== 'admin') {
      return throwError(() => new Error('Forbidden: only admin can add vehicles'));
    }

    const payload = {
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      VIN: vehicle.VIN,
      lastServiceDate: vehicle.lastServiceDate || null,
    };

    return this.http.post(`${this.API_BASE}/api/vehicles`, payload).pipe(
      catchError((err) => {
        console.error('Error adding vehicle via API:', err);
        return throwError(() => err);
      })
    );
  }

  fetchVehiclesApi(): Observable<NewVehicle[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/vehicles`).pipe(
      map((res) =>
        (res || []).map((v) => ({
          type: v.type,
          make: v.make,
          model: v.model,
          year: v.year,
          VIN: v.VIN,
          lastServiceDate: v.lastServiceDate,
          nextServiceMileage: v.nextServiceMileage ?? null,
          hasOpenUnpaidService: v.hasOpenUnpaidService ?? false,
        }))
      ),
      tap((mapped) => (this.registeredVehicles = mapped)),
      catchError((err) => {
        console.error('Error fetching vehicles from API:', err);
        return throwError(() => err);
      })
    );
  }

  fetchOdometerReadings(vin: string): Observable<OdometerReading[]> {
    return this.http
      .get<any[]>(`${this.API_BASE}/api/vehicles/${encodeURIComponent(vin)}/odometer`)
      .pipe(
        map((res) =>
          (res || []).map((r: any) => ({
            readingId: r.readingId || r.readingID || r.id || '',
            vin,
            timestamp: r.date ? new Date(r.date) : new Date(),
            mileage: typeof r.mileage === 'number' ? r.mileage : Number(r.mileage) || 0,
            serviceType: r.serviceType || '',
          }))
        ),
        catchError((err) => {
          console.error('Error fetching odometer readings from API:', err);
          return throwError(() => err);
        })
      );
  }

  addOdometerApi(
    vin: string,
    payload: { mileage: number; serviceType?: string }
  ): Observable<{ reading: any; nextServiceMileage?: number; serviceId?: string }> {
    return this.http
      .post<any>(`${this.API_BASE}/api/vehicles/${encodeURIComponent(vin)}/odometer`, payload)
      .pipe(
        catchError((err) => {
          console.error('Error adding odometer reading via API:', err);
          return throwError(() => err);
        })
      );
  }
}
