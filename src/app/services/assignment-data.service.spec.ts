// import { TestBed } from '@angular/core/testing';
// import { AssignmentDataService } from './assignment-data.service';
// import { TechnicianService } from './technician.service';
// import { ServiceAssignment } from '../models/assignment.model';

// // Change 'xdescribe' to 'describe' to run the tests
// describe('AssignmentDataService', () => {
//   let service: AssignmentDataService;
//   let techService: TechnicianService; // We inject the real TechnicianService

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       // No special providers needed, we will use the real, root-provided services
//     });
//     // Inject both the service we are testing...
//     service = TestBed.inject(AssignmentDataService);
//     // ...and its dependency, so we can set up test data
//     techService = TestBed.inject(TechnicianService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   // --- NEW TEST CASE ---
//   it('should get all assignments from the TechnicianService', () => {
//     // 1. Arrange: Create a new, unique assignment
//     const newAssignment: ServiceAssignment = {
//       assignmentId: 'A-TEST-' + Math.random(), // Unique ID for this test
//       serviceId: 'S-TEST',
//       technicianId: 'T-TEST',
//       status: 'Assigned',
//     };
//     // Add the assignment using the real service
//     techService.assignTask(newAssignment);

//     // 2. Act: Call the method on the service we are testing
//     const allAssignments = service.getAllAssignments().subscribe(assignments => {});

//     // 3. Assert: Check if the assignment we just added is in the list
//     // We use 'find' because other tests might add data to the service
//     const found = allAssignments.find(a => a.assignmentId === newAssignment.assignmentId);
//     expect(found).toBeTruthy(); // Check that it was found
//     expect(found?.status).toBe('Assigned');
//   });

//   // --- NEW TEST CASE ---
//   it('should get a technician name from the TechnicianService', () => {
//     // Since we don't have a technician with this ID,
//     // we are testing that it correctly returns 'Unknown'.
//     const name = service.getTechnicianName('ID_THAT_DOES_NOT_EXIST');
    
//     // The real techService.getTechnicianName returns 'Unknown' if not found.
//     expect(name).toBe('Unknown');
//   });
// });