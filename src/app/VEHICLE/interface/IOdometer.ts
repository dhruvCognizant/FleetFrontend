export interface OdometerReading {
  readingId: string;
  vehicleId: string;
  timestamp: Date;
  mileage: number | null;
}