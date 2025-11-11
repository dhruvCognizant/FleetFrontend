export interface OdometerReading {
  readingId: string;
  vin: string;
  timestamp: Date;
  mileage: number | null;
  serviceType: string;
}
