import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../services/common-service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(private commonService: CommonService) {}

  get stats() {
    return [
      { title: 'Total Vehicles', 
        count: this.commonService.getVehicles().length,
        color: 'blue' },
      {
        title: 'Scheduled Services',
        count: this.commonService.getScheduledServices().length,
        color: 'yellow',
      },
      { title: 'In Progress', 
        count: this.commonService.getInProgressServices(), 
        color: 'orange' },
      {
        title: 'Completed',
        count: this.commonService.getCompletedRecords().length,
        color: 'green',
      },
      {
        title: 'Active Technicians',
        count: this.commonService.getActiveTechnicians(),
        color: 'purple',
      },
    ];
  }
}
