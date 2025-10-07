import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignmentDataService } from '../../../services/assignment-data.service';
import { ServiceAssignment } from '../../../models/assignment.model';
import { FormatStatusPipe } from '../../../pipes/format-status-pipe';

@Component({
  selector: 'app-user-assignments',
  standalone: true,
  imports: [CommonModule, FormatStatusPipe],
  templateUrl: './user-assignments.html',
  styleUrls: ['./user-assignments.css'],
})
export class UserAssignmentsComponent implements OnInit {
  assignments: ServiceAssignment[] = [];

  // DI
  constructor(private assignmentDataService: AssignmentDataService) {}

  // populates the local assignments array 
  ngOnInit(): void {
    this.assignments = this.assignmentDataService.getAllAssignments();
  }

  // Displays technician name
  getTechnicianName(id: number): string {
    return this.assignmentDataService.getTechnicianName(id);
  }
}
