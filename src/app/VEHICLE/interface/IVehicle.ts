export interface NewVehicle {
  type: string;
  make: string;
  model: string;
  year: number | null;
  VIN: string;
  lastServiceDate?: string;
  nextServiceMileage?: number | null;
  hasOpenUnpaidService?: boolean;

  serviceType?: string;
  serviceKm?: number;
  serviceDays?: number;
}
