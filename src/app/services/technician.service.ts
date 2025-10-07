import { Injectable } from '@angular/core';
import { Technician } from '../models/technician.model';
import { ServiceAssignment } from '../models/assignment.model';
import { CommonService } from './common-service';
 
// decorator marks the class as available for DI at root level
@Injectable({
  providedIn: 'root',
})
export class TechnicianService {
  private technicians: Technician[] = [];
  private assignments: ServiceAssignment[] = [];
 
  constructor(private commonService: CommonService) {
    const initialCommonTechnicians = this.commonService.getRegisteredTechnicians();
    this.technicians = initialCommonTechnicians.map((tech, index) => ({
      technicianId: 101 + index,
      name: tech.name,
      skill: tech.expertise as Technician['skill'],
      availability: tech.available ? 'Available' : 'Not Available',
    }));
  }
 
  // copy of technician list
  getTechnicians(): Technician[] {
    return [...this.technicians];
  }
 
  addTechnician(technician: Technician): Technician {
    const id = Number(technician.technicianId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('Technician ID must be a positive number.');
    }
    if (this.technicians.some((t) => t.technicianId === id)) {
      throw new Error('Technician ID must be unique.');
    }
    const newTech = { ...technician, technicianId: id };
    this.technicians.push(newTech);
    console.log(this.technicians,newTech);
    return { ...newTech };
  }
 
  // copy of the assignment list
  getAssignments(): ServiceAssignment[] {
    return [...this.assignments];
  }
 
  // Finds and returns the name of a technician by ID
  getTechnicianName(id: number): string {
    const tech = this.technicians.find((t) => t.technicianId === id);
    return tech ? tech.name : 'Unknown';
  }

  assignTask(assignment: ServiceAssignment): ServiceAssignment {
    if (!Number.isFinite(assignment.assignmentId) || assignment.assignmentId <= 0) {
      throw new Error('Assignment ID must be a positive number.');
    }
    if (
      !assignment.serviceId ||
      typeof assignment.serviceId !== 'string' ||
      assignment.serviceId.trim() === ''
    ) {
      throw new Error('Service ID is required and cannot be empty.');
    }
    if (!Number.isFinite(assignment.technicianId) || assignment.technicianId <= 0) {
      throw new Error('Technician ID is invalid or missing.');
    }
    if (this.assignments.some((a) => a.assignmentId === assignment.assignmentId)) {
      throw new Error('Assignment ID must be unique.');
    }
    const newAssignment = { ...assignment };
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  // find assignment by ID, updates status, return updated assignment
  updateAssignmentStatus(
    assignmentId: number,
    newStatus: ServiceAssignment['status']
  ): ServiceAssignment {
    const assignment = this.assignments.find((a) => a.assignmentId === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found.');
    }
    assignment.status = newStatus;
    return { ...assignment };
  }
}