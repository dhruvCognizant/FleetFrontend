import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianService } from '../../../services/technician.service';
import { CommonService } from '../../../services/common-service';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';
import { Technician } from '../../../models/technician.model';

@Component({
  selector: 'app-technician-tasks',
  standalone: true,
  imports: [CommonModule, FormatStatusPipe],
  templateUrl: './technician-tasks.html',
  styleUrls: ['./technician-tasks.css'],
})
export class TechnicianTasksComponent implements OnInit {
  myAssignments: ServiceAssignment[] = [];
  allTechnicians: Technician[] = [];
  private loggedInTechnicianId: number | null = null;

  // DI
  constructor(private techService: TechnicianService, private commonService: CommonService) {}

  // loads the technician's assignments when the component initializes
  ngOnInit(): void {
    this.refreshTasks();
  }
  
  // Fetches the latest assignments
  refreshTasks(): void {
    this.myAssignments = this.techService.getAssignments();
  }

  // Updates the status of a specific assignment and refreshes the task list
  updateStatus(assignmentId: number, newStatus: ServiceAssignment['status']): void {
    try {
      this.techService.updateAssignmentStatus(assignmentId, newStatus);
      alert(`Status for assignment ${assignmentId} updated successfully.`);
      this.refreshTasks();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  // Returns the name of a technician given their ID
  getTechnicianName(id: number): string {
    return this.techService.getTechnicianName(id);
  }
}
