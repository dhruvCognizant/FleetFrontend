import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../services/common-service';
import { TechnicianService } from '../../services/technician.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-admin.html',
  styleUrls: ['./user-admin.css'],
})
export class UserAdmin implements OnInit {
  constructor(
    private commonService: CommonService,
    private techService: TechnicianService,
    private http: HttpClient
  ) {}

  newVehicleId: string = '';
  newDate: string = '';
  newTechnician: string = '';
  newStatus: string = '';
  newType: string = '';
  newCost: number = 0;

  showPaymentModal: boolean = false;
  showCashModal: boolean = false;

  cashInHand: boolean = false;
  cashCollected: string = '';
  pendingRecord: any = null;


  services = [
    { name: 'Oil Change', cost: 12000 },
    { name: 'Brake Check', cost: 6000 },
    { name: 'Battery Test', cost: 15000 },
  ];
  private API_BASE = environment.apiBaseUrl;

  records: any[] = [];
  searchTerm: string = '';
  filterStatus: string = '';
  sortOrder: string = '';
  dropdownEntries: any[] = [];

  async ngOnInit(): Promise<void> {
    await this.refreshDropdownData();
    await this.loadHistories();
  }

  async refreshDropdownData(): Promise<void> {
    try {
      const scheduled = await this.commonService.getScheduledServicesApi();
      const completedServices = (scheduled || []).filter(
        (service: any) =>
          service.status === 'Completed' && service.payment?.paymentStatus === 'Unpaid'
      );

      const completedHistoryIds = (await this.commonService.getCompletedRecords()).map(
        (r: any) => r.serviceId
      );

      this.dropdownEntries = completedServices
        .map((service: any) => {
          const isAlreadyInHistory = completedHistoryIds.includes(service._id);
          return {
            serviceId: service._id,
            vin: service.vehicleVIN,
            technician: service.technicianName || service.technicianId,
            serviceType: service.serviceType,
            date: service.assignmentDate,
            isDisabled: isAlreadyInHistory,
            isCompleted: service.status === 'Completed',
            isAlreadyInHistory,
          };
        })
        .filter((entry: any) => entry.vin && entry.serviceId);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  }

  addRecord(form: NgForm) {
    if (form.valid) {
      const selectedEntry = this.dropdownEntries.find((e) => e.serviceId === this.newVehicleId);
      if (!selectedEntry) {
        alert('Error: Could not find selected service.');
        return;
      }

      const newRecord = {
        date: new Date(this.newDate),
        vehicleId: selectedEntry.vin,
        serviceId: this.newVehicleId,
        status: this.newStatus,
        type: this.newType,
        cost: this.newCost,
        technician: this.newTechnician,
        paymentStatus: 'Unpaid',
        paymentMethod: '',
      };

      if (newRecord.status === 'Completed') {
        this.pendingRecord = newRecord;
        this.showPaymentModal = true;
      } else {
        this.records.push(newRecord);
        this.commonService.addCompletedRecord(newRecord);
      }

      form.resetForm();
      this.newVehicleId = '';
      this.resetAutoPopulatedFields();
    }
  }

  resetAutoPopulatedFields(): void {
    this.newDate = '';
    this.newTechnician = '';
    this.newType = '';
    this.newCost = 0;
    this.newStatus = '';
  }

  selectPayment(method: string) {
    if (this.pendingRecord) {
      if (method === 'Cash') {
        this.showPaymentModal = false;
        this.showCashModal = true;
      } else {
        this.pendingRecord.paymentStatus = 'Paid';
        this.pendingRecord.paymentMethod = method;
        this.records.push(this.pendingRecord);
        this.commonService.addCompletedRecord(this.pendingRecord);
        this.commonService.markTechnicianAvailable(this.pendingRecord.technician);
        this.pendingRecord = null;
        this.showPaymentModal = false;
      }
    }
  }

  confirmCashPayment() {
    if (this.pendingRecord && this.cashCollected) {
      this.pendingRecord.paymentStatus = this.cashCollected === 'Yes' ? 'Paid' : 'Pending';
      this.pendingRecord.paymentMethod = this.cashInHand ? 'Cash (in hand)' : 'Cash (not in hand)';
      this.records.push(this.pendingRecord);
      this.submitPaymentToBackend(this.pendingRecord.serviceId, this.pendingRecord.cost);

      this.commonService.addCompletedRecord(this.pendingRecord);
      this.commonService.markTechnicianAvailable(this.pendingRecord.technician);
      this.pendingRecord = null;
      this.cashInHand = false;
      this.cashCollected = '';
      this.showCashModal = false;
    }
  }

  closeModal() {
    this.pendingRecord = null;
    this.showPaymentModal = false;
    this.showCashModal = false;
  }

  onVehicleSelect(): void {
    const selectedEntry = this.dropdownEntries.find(
      (entry) => entry.serviceId === this.newVehicleId
    );

    if (selectedEntry) {
      this.newDate = selectedEntry.date
        ? new Date(selectedEntry.date).toISOString().split('T')[0]
        : '';

      this.newTechnician = selectedEntry.technician;
      this.newType = selectedEntry.serviceType;
      this.newCost = this.commonService.getServiceCost(selectedEntry.serviceType);
      this.newStatus = 'Completed';
    } else {
      this.resetAutoPopulatedFields();
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
    

    return this.records.filter(
      (r) =>
        (!term || r.technician.toLowerCase().includes(term))
       
    );
  }

  get typeOptions(): string[] {
    return [...new Set(this.services.map((s) => s.name))];
  }

  submitPaymentToBackend(serviceId: string, cost: number): void {
    const payload = {
      serviceId,
      paymentStatus: 'Paid',
      cost,
    };

    this.http.post(`${this.API_BASE}/api/history/addService`, payload).subscribe({
      next: (res: any) => {
        alert(`Payment recorded. History ID: ${res.historyId}`);
        this.refreshDropdownData();
      },
      error: (err) => {
        alert(`Failed to record payment: ${err.error?.message || err.message}`);
      },
    });
  }

  async loadHistories(): Promise<void> {
    try {
      const histories =
        ((await this.commonService.getServiceHistories().toPromise()) as any[]) ?? [];

      this.records = histories.map((h) => ({
        date: h.createdAt,
        vehicleId: h.vehicleVIN,
        status: h.workStatus,
        type: h.serviceType,
        cost: h.cost,
        technician: h.technicianName || '—',
        paymentStatus: h.paymentStatus,
        paymentMethod: '—',
      }));
    } catch (err) {
      console.error('Failed to load histories:', err);
    }
  }
}
