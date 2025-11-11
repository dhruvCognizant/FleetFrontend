import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models/technician.model';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';
import { CommonService } from '../../../services/common-service';
import { ServiceSchedulingComponent } from '../../../SCHEDULING/maintenance-scheduling/msadmin';

@Component({
  selector: 'app-technician-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatStatusPipe],
  templateUrl: './technician-assignment.html',
  styleUrls: ['./technician-assignment.css'],
})
export class TechnicianAssignmentComponent implements OnInit {
  currentView: 'assignTask' | 'showList' = 'assignTask';

  technicians: Technician[] = [];
  assignments: ServiceAssignment[] = [];
  scheduledServices: any[] = [];
  selectedTechnicianName: string = '';
  isTaskConfirmed: boolean = false;
  unassignedServicesList: any[] = [];

  newAssignment: Partial<ServiceAssignment> = {};

  constructor(private techService: TechnicianService, private commonService: CommonService) {}

  @ViewChild(ServiceSchedulingComponent) serviceScheduler!: ServiceSchedulingComponent;

  ngOnInit(): void {
    this.refreshData();
    this.resetNewAssignment();

    this.commonService.getUnassignedServices().subscribe({
      next: (services: any[]) => {
        this.unassignedServicesList = services;
        if (services.length === 0) {
          console.warn('No unassigned services available.');
        } else {
          console.log('Unassigned services received:', services);
        }
      },
      error: (err) => {
        console.error('Failed to load unassigned services:', err);
      },
    });
  }

  refreshData(): void {
    this.technicians = this.techService.getTechnicians();

    this.commonService.getScheduledServices().subscribe({
      next: (services: any[]) => {
        this.scheduledServices = services;
      },
      error: (err) => {
        console.error('Failed to load scheduled services:', err);
        this.scheduledServices = [];
      },
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
      },
    });
  }

  showView(view: 'assignTask' | 'showList'): void {
    this.currentView = view;
  }

  resetNewAssignment(): void {
    this.newAssignment = { status: 'Assigned' };
    this.selectedTechnicianName = '';
    this.isTaskConfirmed = false;
  }

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

        this.unassignedServicesList = this.unassignedServicesList.filter(
          (s) => s._id !== selectedServiceId
        );

        this.refreshData();
        form.resetForm();
        this.resetNewAssignment();
      },
    });
  }

  getTechnicianName(id: string): string {
    return this.techService.getTechnicianName(id);
  }

  onServiceIdChange(): void {
    const selectedServiceId = this.newAssignment._id;
    const service = this.unassignedServicesList.find((s) => s._id === selectedServiceId);
    this.selectedTechnicianName = service?.technicianName || '';
  }

  get unassignedServices() {
    const assignedServiceIds = this.assignments.map((a) => a._id);
    return this.scheduledServices.filter((s) => !assignedServiceIds.includes(s.serviceId));
  }
}
