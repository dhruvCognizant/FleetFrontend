import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environment/environment';

interface Credential {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  private API_BASE = environment.apiBaseUrl;
  public token: string | null = null;
  private storedRole: 'admin' | 'technician' | null = null;
  constructor(private http: HttpClient) {}

  async apiLogin(email: string, password: string): Promise<boolean> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE}/auth/login`, { email: normalizedEmail, password })
      );

      this.token = res.token;
      this.storedRole = res.role || null;

      if (this.token) {
        sessionStorage.setItem('token', this.token);

        try {
          const payload = JSON.parse(atob(this.token.split('.')[1]));
          console.log('Decoded token payload:', payload);

          if (payload.id) {
            sessionStorage.setItem('technicianId', payload.id);
          } else {
            console.warn('Token payload does not contain id');
          }
        } catch (e) {
          console.error('Failed to decode token payload:', e);
        }
      }

      if (this.storedRole) {
        sessionStorage.setItem('role', this.storedRole);
      } else {
        sessionStorage.removeItem('role');
      }

      return true;
    } catch (err) {
      this.token = null;
      this.storedRole = null;
      this.role = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('technicianId');
      console.error('API login failed', err);
      return false;
    }
  }

  async registerTechnicianApi(payload: any): Promise<any> {
    if (payload && payload.email) {
      payload.email = String(payload.email).trim().toLowerCase();
    }
    const res = await firstValueFrom(this.http.post<any>(`${this.API_BASE}/api/register`, payload));
    return res;
  }

  private technicians: Credential[] = [];
  private role: 'admin' | 'technician' | null = null;
  private loggedInEmail: string | null = null;
  vehicleListChanged = false;
  technicianListChanged = false;
  private serviceCatalog = [
    { name: 'Oil Change', cost: 12000 },
    { name: 'Brake Repair', cost: 6000 },
    { name: 'Battery Test', cost: 15000 },
  ];

  getServiceCost(serviceType: string): number {
    const service = this.serviceCatalog.find((s) => s.name === serviceType);
    return service ? service.cost : 0;
  }

  private completedRecords: any[] = [];
  private registeredTechnicians: {
    technicianId: string;
    name: string;
    expertise: string;
    availability: string;
    isAssigned: boolean;
  }[] = [];

  private pad(num: number): string {
    return String(num).padStart(3, '0');
  }

  logout(): void {
    this.http.post(`${this.API_BASE}/auth/logout`, {}).subscribe({
      next: () => {
        console.log('Token revoked successfully');
        this.role = null;
        this.loggedInEmail = null;
        this.token = null;
        this.storedRole = null;
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('technicianId');
      },
      error: (err) => console.error('Logout error:', err),
    });
  }

  getRole(): 'admin' | 'technician' | null {
    const fromStorage = sessionStorage.getItem('role') as 'admin' | 'technician' | null;
    if (fromStorage) return fromStorage;
    if (this.storedRole) return this.storedRole;
    return this.role;
  }

  getRegisteredTechnicians(): any[] {
    return this.registeredTechnicians;
  }

  RegisterTechnicians(technician: {
    technicianId: string;
    name: string;
    expertise: string;
    availability: string;
  }): void {
    this.registeredTechnicians.push({ ...technician, isAssigned: false });
    this.technicianListChanged = true;
  }

  private setTechnicianAssignedStatus(name: string, isAssigned: boolean): void {
    const tech = this.registeredTechnicians.find((t) => t.name === name);
    if (tech) {
      tech.isAssigned = isAssigned;
    }
    this.technicianListChanged = true;
  }

  public markTechnicianAvailable(name: string): void {
    this.setTechnicianAssignedStatus(name, false);
  }

  generateTechnicianId(): string {
    const nextId = this.registeredTechnicians.length + 1;
    return 'T' + this.pad(nextId);
  }

  addCompletedRecord(record: any) {
    return this.http.post(`${this.API_BASE}/api/history/addService`, record);
  }
  getCompletedRecords(): any[] {
    return this.completedRecords;
  }

  addTechnician(credential: Credential): void {
    this.technicians.push(credential);
    console.log(this.technicians);
  }

  fetchAssignedServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/technician/assignments`).pipe(
      catchError((err) => {
        console.error('Error fetching assigned services:', err);
        return throwError(() => err);
      })
    );
  }

  fetchUnassignedServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/scheduling/unassigned`).pipe(
      catchError((err) => {
        console.error('Error fetching unassigned services:', err);
        return throwError(() => err);
      })
    );
  }

  fetchAvailableTechnicians(serviceType: string): Observable<any> {
    return this.http
      .get<any>(
        `${this.API_BASE}/api/scheduling/available-technicians?serviceType=${encodeURIComponent(
          serviceType
        )}`
      )
      .pipe(
        catchError((err) => {
          console.error('Error fetching available technicians:', err);
          return throwError(() => err);
        })
      );
  }

  scheduleService(payload: {
    vehicleVIN: string;
    serviceType: string;
    technicianId: string;
    dueServiceDate: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/scheduling/schedule`, payload).pipe(
      catchError((err) => {
        console.error('Error scheduling service:', err);
        return throwError(() => err);
      })
    );
  }

  fetchAvailableTechniciansToday(serviceType: string): Observable<any> {
    return this.http.get<any>(
      `${this.API_BASE}/api/scheduling/available-technicians?serviceType=${encodeURIComponent(
        serviceType
      )}`
    );
  }

  fetchAvailableTechniciansForCard(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/scheduling/available-technicians`);
  }

  getScheduledServices(): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE}/api/scheduling/scheduledServices`).pipe(
      map((res) => res.scheduled_services || []),
      catchError((err) => {
        console.error('Error fetching scheduled services:', err);
        return of([]);
      })
    );
  }

  async getScheduledServicesApi(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE}/api/scheduling/scheduledServices`)
      );
      if (res && Array.isArray(res.scheduled_services)) return res.scheduled_services;
      if (Array.isArray(res)) return res;
      return [];
    } catch (err) {
      console.error('Failed to fetch scheduled services', err);
      return [];
    }
  }

  getUnassignedServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/technician/unassigned-services`);
  }

  assignServiceToTechnician(payload: { serviceId: string }): Observable<any> {
    return this.http.post(`${this.API_BASE}/api/technician/assignments`, payload);
  }

  getTechnicianAssignments(technicianId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/technician/assignments/${technicianId}`);
  }

  getServiceHistories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/api/history/allHistories`);
  }

  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/dashboard/summary`);
  }
}
