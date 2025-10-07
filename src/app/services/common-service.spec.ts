import { TestBed } from '@angular/core/testing';
 
import { CommonService } from './common-service';
 
describe('CommonService', () => {
  let service: CommonService;
 
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonService);
  });
 
  it('should generate a valid technician ID', () => {
    const id = service.generateTechnicianId();
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThanOrEqual(1000);
    expect(id).toBeLessThanOrEqual(9999);
  });
 
  it('should generate a valid assignment ID', () => {
    const id = service.generateAssignmentId();
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThanOrEqual(10000);
    expect(id).toBeLessThanOrEqual(99999);
  });
});
 