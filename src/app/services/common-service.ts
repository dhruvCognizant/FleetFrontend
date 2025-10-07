import { Injectable } from '@angular/core';
import { NewVehicle } from '../VEHICLE/interface/IVehicle';

interface Credential {
  email: string;
  password: string;
}

enum ServiceCode {
  'Oil Change' = 'FC01',
  'Brake Check' = 'FC02',
  'Battery Test' = 'FC03',
}
// decorator marks the class as available for DI at root level
@Injectable({ providedIn: 'root' })
export class CommonService {
  private adminUsername = 'admin@admin.com';
  private adminPassword = 'admin123';
  private users: Credential[] = [
    { email: 'user@gmail.com', password: 'user123' },
    { email: 'harshith@gmail.com', password: 'harshith123' },
    { email: 'kasi@gmail.com', password: 'kasi123' },
    { email: 'krishna@gmail.com', password: 'krishna123' },
  ];
  private technicians: Credential[] = [
    { email: 'tech@fleet.com', password: 'tech123' },
    { email: 'john@fleet.com', password: 'john123' },
  ];
  private role: 'admin' | 'technician' | 'user' | null = null;
  private loggedInEmail: string | null = null;
  vehicleListChanged = false;
  technicianListChanged = false;
  private registeredVehicles: NewVehicle[] = [
    {
      vehicleId: 'V001',
      type: 'SUV',
      Make: 'Toyota',
      model: 'Fortuner',
      year: 2025,
      vin: 'ABC123XYZ',
      lastService: '2025-01-15',
    },
  ];
  private scheduledServices: any[] = [];
  private completedRecords: any[] = [];
  private registeredTechnicians = [
    { name: 'Technician A', expertise: 'Oil Change', available: true },
    { name: 'Technician B', expertise: 'Battery Test', available: true },
    { name: 'Technician C', expertise: 'Brake Check', available: true },
    { name: 'Technician D', expertise: 'Oil Change', available: true },
    { name: 'Technician E', expertise: 'Brake Check', available: true },
  ];
  login(email: string, password: string): boolean {
    if (email === this.adminUsername && password === this.adminPassword) {
      this.role = 'admin';
      this.loggedInEmail = email;
      return true;
    } else if (this.technicians.find((t) => t.email === email && t.password === password)) {
      this.role = 'technician';
      this.loggedInEmail = email;
      return true;
    } else if (this.users.find((u) => u.email === email && u.password === password)) {
      this.role = 'user';
      this.loggedInEmail = email;
      return true;
    }
    return false;
  }
  getRole(): 'admin' | 'technician' | 'user' | null {
    return this.role;
  }
  getEmail(): string | null {
    return this.loggedInEmail;
  }
  addVehicle(vehicle: NewVehicle): void {
    this.registeredVehicles.push(vehicle);
    console.log(this.registeredVehicles, vehicle);
    this.vehicleListChanged = true;
  }
  //for dashboard toatal vehicles
  getVehicles() {
    return this.registeredVehicles;
  }
  //Inprogress services
  getInProgressServices() {
    return this.registeredVehicles.length - this.scheduledServices.length;
  }
  getActiveTechnicians() {
    return this.registeredTechnicians.filter((t) => t.available).length;
  }
  getRegisteredVehicles(): NewVehicle[] {
    return this.registeredVehicles;
  }
  getAvailableVehicles(): NewVehicle[] {
    const scheduledIds = this.scheduledServices.map((s) => s.vehicleId.toLowerCase());
    return this.registeredVehicles.filter((v) => !scheduledIds.includes(v.vehicleId.toLowerCase()));
  }
  getRegisteredTechnicians(): any[] {
    console.log('All technicians:', this.registeredTechnicians);
    return this.registeredTechnicians.filter((t) => t.available);
  }
  RegisterTechnicians(technician: { name: string; expertise: string; available: boolean }): void {
    this.registeredTechnicians.push(technician);
    this.technicianListChanged = true;
  }
  getScheduledServices(): any[] {
    return this.scheduledServices;
  }
  addScheduledService(service: any): void {
    this.scheduledServices.push(service);
    this.markTechnicianUnavailable(service.technician);
  }
  private markTechnicianUnavailable(name: string): void {
    const tech = this.registeredTechnicians.find((t) => t.name === name);
    if (tech) tech.available = false;
  }
  generateServiceId(serviceType: string): string {
    const prefix = ServiceCode[serviceType as keyof typeof ServiceCode] || 'FC00';
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNumber}`;
  }
  generateTechnicianId(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }
  generateAssignmentId(): number {
    return Math.floor(10000 + Math.random() * 90000);
  }
  addCompletedRecord(record: any): void {
    this.completedRecords.push(record);
  }
  getCompletedRecords(): any[] {
    return this.completedRecords;
  }
  addUser(credential: Credential): void {
    if (!this.users.some((user) => user.email === credential.email)) {
      this.users.push(credential);
      console.log(this.technicians);
    }
  }
  addTechnician(credential: Credential): void {
    this.technicians.push(credential);
    console.log(this.technicians);
  }
  addAdmin(credential: Credential): void {
    this.adminUsername = credential.email;
    this.adminPassword = credential.password;
    console.log(this.adminUsername);
  }
}
