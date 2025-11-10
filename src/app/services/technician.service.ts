import { Injectable } from '@angular/core';
import { Technician } from '../models/technician.model';
import { ServiceAssignment } from '../models/assignment.model';
import { CommonService } from './common-service';
import { HttpHeaders ,HttpClient} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { catchError, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})

export class TechnicianService {
  private technicians: Technician[] = [];
  private assignments: ServiceAssignment[] = [];
  constructor(private commonService: CommonService, private http: HttpClient) {
    const initialCommonTechnicians = this.commonService.getRegisteredTechnicians();
   this.technicians = initialCommonTechnicians.map((tech) => ({
  _id: tech._id,
  firstName: tech.firstName,
  lastName: tech.lastName,
  email: tech.email,
  credential: tech.credential,
  skill: tech.expertise as Technician['skill'],
  availability: [tech.isAssigned ? 'Not Available' : 'Available'], 
}));

  }
  private API_BASE = '/api'; 

  private pad(num: number): string {
    return String(num).padStart(3, '0');
  }

  generateAssignmentId(): string {
    const nextId = this.assignments.length + 1; 
    return 'A' + this.pad(nextId);
  }

  getTechnicians(): Technician[] {
    return [...this.technicians];
  }

 addTechnician(technician: Technician): Technician {
  const id = technician._id;
  if (!id || id.trim() === '') {
    throw new Error('Technician _id must be a non-empty string.');
  }

  if (this.technicians.some((t: Technician) => t._id === id)) {
    throw new Error('Technician _id must be unique.');
  }

  const newTech = { ...technician };
  this.technicians.push(newTech);
  console.log(this.technicians, newTech);
  return { ...newTech };
}


  getAssignments(): Observable<ServiceAssignment[]> {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  return this.http.get<ServiceAssignment[]>(
    'http://localhost:5000/api/technician/assignments',
    { headers }
  );
}




  getTechnicianName(id: string): string {
  const tech = this.technicians.find(t => t._id === id);
  return tech ? `${tech.firstName} ${tech.lastName}` : 'Unknown';
}


  assignTask(assignment: ServiceAssignment): ServiceAssignment {
    
    if (
      !assignment._id ||
      typeof assignment._id !== 'string' ||
      assignment._id.trim() === ''
    ) {
      throw new Error('Service ID is required and cannot be empty.');
    }

   

   

    const newAssignment = { ...assignment };
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  updateAssignmentStatus(id: string, status: string): Observable<any> {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

 return this.http.patch(
  `http://localhost:5000/api/technician/assignments/${id}/status`,
  { status },
  { headers }
);

}
getTechnicianIdFromCredential(credentialId: string): Observable<string | null> {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  return this.http.get<Technician[]>(`${this.API_BASE}/technicians`, { headers }).pipe(
    map(techs => {
      const match = techs.find(t => t.credential === credentialId);
      return match?._id ?? null;
    }),
    catchError(err => {
      console.error('Failed to fetch technicians:', err);
      return of(null);
    })
  );
}




}
