import { Injectable } from '@angular/core';
import { NewVehicle } from '../VEHICLE/interface/IVehicle';
import { OdometerReading } from '../VEHICLE/interface/IOdometer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, throwError } from 'rxjs';

interface Credential {
  email: string;
  password: string;
}

// decorator marks the class as available for DI at root level
@Injectable({ providedIn: 'root' })
export class CommonService {
  // Base URL for backend API (adjust if your BE runs on a different port)
  private API_BASE = 'http://localhost:5000';
  public token: string | null = null;
  private storedRole: 'admin' | 'technician' | null = null;
  constructor(private http: HttpClient) {}

  // Call backend to authenticate; stores token & role in sessionStorage on success
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
      // Clear stale state on failure
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

  // Register technician through backend API
  async registerTechnicianApi(payload: any): Promise<any> {
    if (payload && payload.email) {
      payload.email = String(payload.email).trim().toLowerCase();
    }
    const res = await firstValueFrom(this.http.post<any>(`${this.API_BASE}/api/register`, payload));
    return res;
  }

  private adminUsername = 'admin@admin.com';
  private adminPassword = 'admin123';
  // private odometerReadings: OdometerReading[] = [];
  private technicians: Credential[] = [
    { email: 'tech@fleet.com', password: 'tech123' },
    { email: 'john@fleet.com', password: 'john123' },
  ];
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
    const service = [
      { name: 'Oil Change', cost: 12000 },
      { name: 'Brake Check', cost: 6000 },
      { name: 'Battery Test', cost: 15000 },
    ].find((s) => s.name === serviceType);
    return service ? service.cost : 0;
  }

  private scheduledServices: any[] = [];
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

  login(email: string, password: string): boolean {
    if (email === this.adminUsername && password === this.adminPassword) {
      this.role = 'admin';
      this.loggedInEmail = email;
      return true;
    } else if (this.technicians.find((t) => t.email === email && t.password === password)) {
      this.role = 'technician';
      this.loggedInEmail = email;
      return true;
    }
    return false;
  }

 logout(): void {
  const token = sessionStorage.getItem('token');

  if (token) {
    // Call backend to revoke token
    this.http.post('http://localhost:5000/api/auth/logout', {}, {
  headers: { Authorization: `Bearer ${token}` }
})
.subscribe({
      next: () => console.log('Token revoked successfully'),
      error: err => console.error('Logout error:', err)
    });
  }

  // Clear local session data
  this.role = null;
  this.loggedInEmail = null;
  this.token = null;
  this.storedRole = null;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
}


  // Keep getRole compatible with either storedRole or in-memory role
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
    // Signal that the technician list state has changed.
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
    return this.http.post('http://localhost:5000/api/history/addService', record);
  }
  getCompletedRecords(): any[] {
    return this.completedRecords;
  }

  addTechnician(credential: Credential): void {
    this.technicians.push(credential);
    console.log(this.technicians);
  }



  fetchAssignedServices(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any[]>('http://localhost:5000/api/technician/assignments', { headers });
  }

  // Convert date from YYYY-MM-DD to DD-MM-YYYY for backend
  formatToBackendDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = String(dateStr)
      .split('-')
      .map((p) => p.trim());
    // If already in DD-MM-YYYY format (day length 2 and first part isn't year), return as-is
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    // If it's YYYY-MM-DD -> convert
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // fallback: return original
    return dateStr;
  }

  // Convert backend date DD-MM-YYYY to YYYY-MM-DD for frontend date inputs
  parseBackendDateToISO(dateStr: string): string {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    // If looks like ISO timestamp (contains 'T'), parse and convert
    if (s.includes('T')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
      }
    }
    const parts = s.split('-').map((p) => p.trim());
    if (parts.length !== 3) return s;
    // assume DD-MM-YYYY -> return YYYY-MM-DD
    const [d, m, y] = parts;
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    // assume YYYY-MM-DD
    if (parts[0].length === 4)
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    return s;
  }

  // Add vehicle via backend API — requires admin role and Bearer token


  // Fetch vehicles from backend and populate in-memory list. Requires Bearer token.


  // Fetch odometer readings for a VIN from backend


  // Add odometer reading via backend API for a vehicle VIN


  // get unasssigned servies
  fetchUnassignedServices(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('No auth token present');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http
      .get<any[]>(`http://localhost:5000/api/scheduling/unassigned`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Error fetching unassigned services:', err);
          return throwError(() => err);
        })
      );
  }

  fetchAvailableTechnicians(serviceType: string): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('No auth token present');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http
      .get<any>(
        `http://localhost:5000/api/scheduling/available-technicians?serviceType=${encodeURIComponent(
          serviceType
        )}`,
        { headers }
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
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('No auth token present');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http
      .post<any>('http://localhost:5000/api/scheduling/schedule', payload, { headers })
      .pipe(
        catchError((err) => {
          console.error('Error scheduling service:', err);
          return throwError(() => err);
        })
      );
  }

  fetchAvailableTechniciansToday(serviceType: string): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any>(
      `http://localhost:5000/api/scheduling/available-technicians?serviceType=${serviceType}`,
      { headers }
    );
  }

  fetchAvailableTechniciansForCard(): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any>('http://localhost:5000/api/scheduling/available-technicians', {
      headers,
    });
  }

  getScheduledServices(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('No auth token present');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http
      .get<any>('http://localhost:5000/api/scheduling/scheduledServices', { headers })
      .pipe(
        map((res) => res.scheduled_services || []),
        catchError((err) => {
          console.error('Error fetching scheduled services:', err);
          return of([]);
        })
      );
  }

  async getScheduledServicesApi(): Promise<any[]> {
    try {
      const token = this.token || sessionStorage.getItem('token');
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
      const res = headers
        ? await firstValueFrom(
            this.http.get<any>(`${this.API_BASE}/api/scheduling/scheduledServices`, { headers })
          )
        : await firstValueFrom(
            this.http.get<any>(`${this.API_BASE}/api/scheduling/scheduledServices`)
          );

      // backend returns { scheduled_services: [...] } or an array
      if (res && Array.isArray(res.scheduled_services)) return res.scheduled_services;
      if (Array.isArray(res)) return res;
      return [];
    } catch (err) {
      console.error('Failed to fetch scheduled services', err);
      return [];
    }
  }

  getUnassignedServices(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any[]>('http://localhost:5000/api/technician/unassigned-services', {
      headers,
    });
  }

  assignServiceToTechnician(payload: { serviceId: string }): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.post('http://localhost:5000/api/technician/assignments', payload, { headers });
  }

  getTechnicianAssignments(technicianId: string): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any[]>(
      `http://localhost:5000/api/technician/assignments/${technicianId}`,
      { headers }
    );
  }

  getServiceHistories(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any[]>('http://localhost:5000/api/history/allHistories', { headers });
  }

  getDashboardSummary(): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any>('http://localhost:5000/api/dashboard/summary', { headers });
  }
}
