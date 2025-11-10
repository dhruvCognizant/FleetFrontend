import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models/technician.model';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';
import { CommonService } from '../../../services/common-service';
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
  currentView: 'assignTask' | 'showList' = 'assignTask';

  // Arrays to hold services
  technicians: Technician[] = [];
assignments: ServiceAssignment[] = [];
  scheduledServices: any[] = [];
  selectedTechnicianName: string = '';
  isTaskConfirmed: boolean = false;
unassignedServicesList: any[] = [];

  // TS utility type, makes all properties optional
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
  this.resetNewAssignment();

  this.commonService.getUnassignedServices().subscribe({
  next: (services: any[]) => {
    console.log('Unassigned services received:', services);
    this.unassignedServicesList = services;
  },
  error: (err) => {
    console.error('Failed to load unassigned services:', err);
  }
});

}


  // Fetches technicians, services, and assignments
 refreshData(): void {
  this.technicians = this.techService.getTechnicians();

  this.commonService.getScheduledServices().subscribe({
    next: (services: any[]) => {
      this.scheduledServices = services;
    },
    error: (err) => {
      console.error('Failed to load scheduled services:', err);
      this.scheduledServices = [];
    }
  });

  this.loadAssignments(); 
}

loadAssignments(): void {
  this.commonService.fetchAssignedServices().subscribe({
    next: (res: ServiceAssignment[]) => {
      console.log('Assigned services:', res);
      this.assignments = res;
    },
    error: (err) => {
      console.error('Failed to load assignments:', err);
    }
  });
}

  // Changes the current view
  showView(view: 'assignTask' | 'showList'): void {
    this.currentView = view;
  }

  // Initializes form models with default values
  resetNewAssignment(): void {
    this.newAssignment = { status: 'Assigned' };
    this.selectedTechnicianName = '';
    this.isTaskConfirmed = false;
  }

  // Handles assigning a task
 onAssignTask(form: NgForm): void {
  if (form.invalid || !this.isTaskConfirmed) return;

  const selectedServiceId = this.newAssignment._id;
  if (!selectedServiceId) {
    alert('Please select a service to assign.');
    return;
  }

  this.commonService.assignServiceToTechnician({ serviceId: selectedServiceId }).subscribe({
  next: (res) => {
  alert(`${res.message} (Service ID: ${res.serviceId})`);

  // Remove from dropdown immediately
  this.unassignedServicesList = this.unassignedServicesList.filter(
    (s) => s._id !== selectedServiceId
  );

  this.refreshData();
  form.resetForm();
  this.resetNewAssignment();
}

  });
}


  // Retrieves technician name by ID
  getTechnicianName(id: string): string {
    return this.techService.getTechnicianName(id);
  }

  // Updates selected technician name based on service ID
 onServiceIdChange(): void {
  const selectedServiceId = this.newAssignment._id;
  const service = this.unassignedServicesList.find((s) => s._id === selectedServiceId);
  this.selectedTechnicianName = service?.technicianName || '';
}



  // Returns services that haven't been assigned yet
  get unassignedServices() {
    const assignedServiceIds = this.assignments.map((a) => a._id);
    return this.scheduledServices.filter((s) => !assignedServiceIds.includes(s.serviceId));
  }
}
