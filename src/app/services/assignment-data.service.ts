import { Injectable } from '@angular/core';
import { TechnicianService } from './technician.service';
import { ServiceAssignment } from '../models/assignment.model';
 import { Observable } from 'rxjs';
// decorator marks the class as available for DI at root level
@Injectable({ providedIn: 'root' })
export class AssignmentDataService {
  constructor(private technicianService: TechnicianService) {}

  // Returns an array of ServiceAssignment object
  getAllAssignments(): Observable<ServiceAssignment[]> {
  return this.technicianService.getAssignments();
}

 
  // Takes a technician ID and returns the technician name
  getTechnicianName(id: string): string {
    return this.technicianService.getTechnicianName(id);
  }
}
 