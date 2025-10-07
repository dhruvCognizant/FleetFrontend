import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models/technician.model';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';
import { CommonService } from '../../../services/common-service';
import { ViewChild } from '@angular/core';
import { AssignmentDataService } from '../../../services/assignment-data.service';
import { ServiceSchedulingComponent } from '../../../SCHEDULING/maintenance-scheduling/msadmin';

@Component({
  selector: 'app-technician-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatStatusPipe],
  templateUrl: './technician-assignment.html',
  styleUrls: ['./technician-assignment.css'],
})
export class TechnicianAssignmentComponent implements OnInit {
  
  // toggles between different UI states
  currentView: 'addTechnician' | 'assignTask' | 'showList' = 'addTechnician';

  // Arrays to hold services
  technicians: Technician[] = [];
  assignments: ServiceAssignment[] = [];
  scheduledServices: any[] = [];
  selectedTechnicianName: string = '';
  isTaskConfirmed: boolean = false;

  skills: Technician['skill'][] = ['Oil Change', 'Brake Check', 'Battery Test'];

  // TS utility type, makes all properties optional
  newTechnician: Partial<Technician> = {};
  newAssignment: Partial<ServiceAssignment> = {};

  // DI
  constructor(
    private techService: TechnicianService,
    private commonService: CommonService,
    private assignmentDataService: AssignmentDataService
  ) {}

  // accessing child component
  @ViewChild(ServiceSchedulingComponent) serviceScheduler!: ServiceSchedulingComponent;

  // Initializes data and resets form models when the component loads
  ngOnInit(): void {
    this.refreshData();
    this.resetNewTechnician();
    this.resetNewAssignment();
  }

  // Fetches technicians, services, and assignments
  refreshData(): void {
    this.technicians = this.techService.getTechnicians();
    this.scheduledServices = this.commonService.getScheduledServices();
    this.assignments = this.techService.getAssignments();
  }

  // Changes the current view
  showView(view: 'addTechnician' | 'assignTask' | 'showList'): void {
    this.currentView = view;
  }

  // Initializes form models with default values
  resetNewTechnician(): void {
    this.newTechnician = { skill: this.skills[0], availability: 'Available' };
  }
  resetNewAssignment(): void {
    this.newAssignment = { status: 'Assigned' };
    this.selectedTechnicianName = '';
    this.isTaskConfirmed = false;
  }

  // Handles adding a new technician
  onAddTechnician(form: NgForm): void {
    if (form.invalid) return;
    try {
      const generatedId = this.commonService.generateTechnicianId();
      const payload: Technician = {
        technicianId: generatedId,
        name: String(this.newTechnician.name).trim(),
        skill: this.newTechnician.skill!,
        availability: this.newTechnician.availability!,
      };

      this.techService.addTechnician(payload);
      this.commonService.RegisterTechnicians({
        name: payload.name,
        expertise: payload.skill,
        available: payload.availability === 'Available',
      });
      alert(
        `Technician ${payload.name} added successfully! \nTechnician ID ${payload.technicianId} has been created.`
      );
      if (this.serviceScheduler) {
        console.log('if worked 1');
        this.serviceScheduler.refreshDropdowns();
      }
      this.refreshData();
      form.resetForm(this.newTechnician);
      this.resetNewTechnician();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  // Handles assigning a task
  onAssignTask(form: NgForm): void {
    if (form.invalid || !this.isTaskConfirmed) return;
    try {
      if (!this.selectedTechnicianName) {
        throw new Error('No technician is associated with the selected service.');
      }
      const matchedTech = this.technicians.find(
        (t) => t.name.trim() === this.selectedTechnicianName.trim()
      );
      if (!matchedTech || !matchedTech.technicianId) {
        throw new Error(
          `Could not find a registered technician with the name "${this.selectedTechnicianName}".`
        );
      }
      const generatedId = this.commonService.generateAssignmentId();
      const payload: ServiceAssignment = {
        assignmentId: generatedId,
        serviceId: String(this.newAssignment.serviceId),
        technicianId: matchedTech.technicianId,
        status: 'Assigned',
      };
      this.techService.assignTask(payload);
      alert(
        `Task assigned successfully! \nAssignment ID ${payload.assignmentId} has been created.`
      );

      this.refreshData();
      form.resetForm();
      this.resetNewAssignment();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  // Retrieves technician name by ID
  getTechnicianName(id: number): string {
    return this.techService.getTechnicianName(id);
  }

  // Updates selected technician name based on service ID
  onServiceIdChange(): void {
    const selectedServiceId = this.newAssignment.serviceId;
    const service = this.scheduledServices.find((s) => s.serviceId === selectedServiceId);
    this.selectedTechnicianName = service?.technician || '';
  }

  // Returns services that haven't been assigned yet
  get unassignedServices() {
    const assignedServiceIds = this.assignments.map((a) => a.serviceId);
    return this.scheduledServices.filter((s) => !assignedServiceIds.includes(s.serviceId));
  }
}
