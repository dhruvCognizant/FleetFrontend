import { Injectable } from '@angular/core';
import { TechnicianService } from './technician.service';
import { ServiceAssignment } from '../models/assignment.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssignmentDataService {
  constructor(private technicianService: TechnicianService) {}

  getAllAssignments(): Observable<ServiceAssignment[]> {
    return this.technicianService.getAssignments();
  }

  getTechnicianName(id: string): string {
    return this.technicianService.getTechnicianName(id);
  }
}
