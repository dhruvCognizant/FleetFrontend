// import { TestBed } from '@angular/core/testing';

// import { TechnicianService } from './technician.service';

// xdescribe('Technician', () => {
//   let service: TechnicianService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(TechnicianService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
// });


import { TestBed } from '@angular/core/testing';
import { TechnicianService } from './technician.service';
import { CommonService } from './common-service';
import { ServiceAssignment } from '../models/assignment.model';
import { Technician } from '../models/technician.model';

// Change 'xdescribe' to 'describe' to run the tests
describe('TechnicianService', () => {
  let service: TechnicianService;
  let commonService: CommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // No special providers needed, we'll use the root-provided services
    });
    service = TestBed.inject(TechnicianService);
    commonService = TestBed.inject(CommonService);

    // --- Test Isolation ---
    // Manually clear the internal arrays before each test
    // This is important so tests don't interfere with each other
    service.getAssignments().length = 0;
    service.getTechnicians().length = 0;
    
    // We also clear the technicians in CommonService, since our service depends on it
    commonService.getRegisteredTechnicians().length = 0;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- NEW TEST CASE ---
  it('should generate a unique assignment ID', () => {
    const id1 = service.generateAssignmentId();
    expect(id1).toBe('A001');

    // Add a dummy task to increment the internal counter
    const testAssignment: ServiceAssignment = {
      assignmentId: id1,
      serviceId: 'S001',
      technicianId: 'T001',
      status: 'Assigned',
    };
    service.assignTask(testAssignment);

    const id2 = service.generateAssignmentId();
    expect(id2).toBe('A002');
  });

  // --- NEW TEST CASE ---
  it('should add and get a technician', () => {
    // 1. Arrange
    const newTechnician: Technician = {
      technicianId: 'T001',
      name: 'Test Tech',
      skill: 'Oil Change',
      availability: 'Available',
    };

    // 2. Act
    service.addTechnician(newTechnician);
    const technicians = service.getTechnicians();

    // 3. Assert
    expect(technicians.length).toBe(1);
    expect(technicians[0].name).toBe('Test Tech');
  });

  // --- NEW TEST CASE ---
  it('should add and get an assignment', () => {
    // 1. Arrange
    const newAssignment: ServiceAssignment = {
      assignmentId: 'A001',
      serviceId: 'S001',
      technicianId: 'T001',
      status: 'Assigned',
    };

    // 2. Act
    service.assignTask(newAssignment);
    const assignments = service.getAssignments();

    // 3. Assert
    expect(assignments.length).toBe(1);
    expect(assignments[0].assignmentId).toBe('A001');
  });

  // --- NEW TEST CASE ---
  it('should update an assignment status', () => {
    // 1. Arrange
    const newAssignment: ServiceAssignment = {
      assignmentId: 'A002',
      serviceId: 'S002',
      technicianId: 'T002',
      status: 'Assigned',
    };
    service.assignTask(newAssignment);
    
    // 2. Act
    service.updateAssignmentStatus('A002', 'Work In Progress');
    const assignments = service.getAssignments();

    // 3. Assert
    expect(assignments[0].status).toBe('Work In Progress');
  });

  // --- NEW TEST CASE ---
  it('should return "Unknown" for an invalid technician ID', () => {
    const name = service.getTechnicianName('INVALID_ID');
    expect(name).toBe('Unknown');
  });
});