import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianService } from '../../../services/technician.service';
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

  constructor(private techService: TechnicianService) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.techService.getAssignments().subscribe({
      next: (assignments) => {
        this.myAssignments = assignments;
        console.log('Assignments loaded:', assignments);
      },
      error: (err) => {
        console.error('Failed to load technician assignments:', err);
      },
    });
  }

  updateStatus(assignmentId: string, newStatus: ServiceAssignment['status']): void {
    this.techService.updateAssignmentStatus(assignmentId, newStatus).subscribe({
      next: () => {
        alert(`Status for assignment ${assignmentId} updated successfully.`);
        this.loadAssignments();
      },
      error: (err) => {
        alert(`Error updating status: ${err.message}`);
      },
    });
  }
  getTechnicianName(id: string): string {
    return this.techService.getTechnicianName(id);
  }
}
