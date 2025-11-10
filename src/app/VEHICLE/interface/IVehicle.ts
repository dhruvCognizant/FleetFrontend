export interface NewVehicle {
  type: string;
  make: string;                  // ✅ lowercase to match backend
  model: string;
  year: number | null;
  VIN: string;                   // ✅ uppercase to match backend
  lastServiceDate?: string;      // ✅ backend field
  nextServiceMileage?: number | null; // ✅ enrichment field
  hasOpenUnpaidService?: boolean;     // ✅ enrichment field

  // frontend-only fields (optional)
  serviceType?: string;
  serviceKm?: number;
  serviceDays?: number;
}
