import { TestBed } from '@angular/core/testing';
import { VehicleService } from './vehicle.service';
import { CommonService } from './common-service';
import { NewVehicle } from '../VEHICLE/interface/IVehicle';
import { OdometerReading } from '../VEHICLE/interface/IOdometer';
 
describe('VehicleService', () => {
  let service: VehicleService;
  let mockCommonService: jasmine.SpyObj<CommonService>;
 
  beforeEach(() => {
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'getRegisteredVehicles',
      'addVehicle',
    ]);
 
    TestBed.configureTestingModule({
      providers: [
        VehicleService,
        { provide: CommonService, useValue: mockCommonService },
      ],
    });
 
    service = TestBed.inject(VehicleService);
  });
 
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
 
  it('should return vehicles from CommonService', () => {
    const vehicles: NewVehicle[] = [{ vehicleId: 'V001' } as any];
    mockCommonService.getRegisteredVehicles.and.returnValue(vehicles);
 
    const result = service.getVehicles();
    expect(result).toEqual(vehicles);
  });
 
  it('should generate vehicle ID based on number of registered vehicles', () => {
    mockCommonService.getRegisteredVehicles.and.returnValue([{ vehicleId: 'V001' } as any]);
    const id = service.generateVehicleId();
    expect(id).toBe('V002');
  });
 
  it('should add and return odometer readings', () => {
    const reading: OdometerReading = {
      readingId: 'r001',
      vehicleId: 'V001',
      timestamp: new Date(),
      mileage: 10000,
    };
 
    service.addOdometerReading(reading);
    const readings = service.getOdometerReadings();
    expect(readings.length).toBe(1);
    expect(readings[0]).toEqual(reading);
  });
 
  it('should return latest mileage for a vehicle', () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 100000);
    service.addOdometerReading({ vehicleId: 'V1', mileage: 5000, timestamp: earlier, readingId: 'r1' });
    service.addOdometerReading({ vehicleId: 'V1', mileage: 8000, timestamp: now, readingId: 'r2' });
 
    const latest = service.getLatestMileage('V1');
    expect(latest).toBe(8000);
  });
 
  it('should return mileage history sorted by date', () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 100000);
    const r1 = { vehicleId: 'V1', mileage: 5000, timestamp: earlier, readingId: 'r1' };
    const r2 = { vehicleId: 'V1', mileage: 8000, timestamp: now, readingId: 'r2' };
 
    service.addOdometerReading(r1);
    service.addOdometerReading(r2);
 
    const history = service.getMileageHistory('V1');
    expect(history[0].mileage).toBe(8000);
    expect(history[1].mileage).toBe(5000);
  });
});
 
 