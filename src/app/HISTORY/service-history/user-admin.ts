import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../services/common-service';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-admin.html',
  styleUrl: './user-admin.css',
})
export class UserAdmin implements OnInit {
  constructor(private commonService: CommonService) {}

  // Form fields
  newVehicleId: string = '';
  newDate: string = '';
  newPaymentStatus: string = '';
  newTechnician: string = '';
  newStatus: string = '';
  newType: string = '';
  newCost: number = 0;

  // Dropdown options
  vehicleIds: string[] = [];
  statusOptions: string[] = ['Completed', 'In Progress', 'Pending'];

  // Service types and costs
  services = [
    { name: 'Oil Change', cost: 12000 },
    { name: 'Brake Check', cost: 6000 },
    { name: 'Battery Test', cost: 15000 },
  ];

  // Records list
  records: any[] = [];

  // Search and sort
  searchTerm: string = '';
  filterStatus: string = '';
  sortOrder: string = '';

  ngOnInit(): void {
    console.log('Vehicle IDs:', this.vehicleIds);
  }

  addRecord(form: NgForm) {
    if (form.valid) {
      const newRecord = {
        date: new Date(this.newDate),
        vehicleId: this.newVehicleId,
        status: this.newStatus,
        type: this.newType,
        cost: this.newCost,
        technician: this.newTechnician,
        paymentStatus: this.newPaymentStatus,
      };
      this.records.push(newRecord);
      this.commonService.addCompletedRecord(newRecord);
      form.resetForm();
    }
  }

  onVehicleSelect(): void {
    const selected = this.commonService
      .getScheduledServices()
      .find((s) => s.vehicleId === this.newVehicleId);

    if (selected) {
      this.newDate = selected.dueDate;
      this.newTechnician = selected.technician;
      this.newType = selected.serviceType;
      this.newCost = this.services.find((s) => s.name === selected.serviceType)?.cost || 0;
      this.newStatus = 'Pending';
      this.newPaymentStatus = 'Unpaid';
    }
  }

  onTypeChange() {
    const matchedService = this.services.find((s) => s.name === this.newType);
    this.newCost = matchedService ? matchedService.cost : 0;
  }

  sortRecords(order: string) {
    if (order === 'asc') {
      this.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (order === 'desc') {
      this.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  get filteredRecords(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.filterStatus.trim().toLowerCase();

    return this.records.filter(
      (r) =>
        (!term || r.technician.toLowerCase().includes(term)) &&
        (!status || r.status.toLowerCase() === status)
    );
  }

  get typeOptions(): string[] {
    return [...new Set(this.services.map((s) => s.name))];
  }
  ngDoCheck(): void {
    const scheduled = this.commonService.getScheduledServices();

    // Get IDs already used in records
    const usedIds = this.records.map((r) => r.vehicleId);

    // Filter out used IDs from scheduled list
    this.vehicleIds = scheduled.map((s) => s.vehicleId).filter((id) => !usedIds.includes(id));
  }
}
