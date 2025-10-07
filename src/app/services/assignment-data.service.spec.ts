import { TestBed } from '@angular/core/testing';

import { AssignmentDataService } from './assignment-data.service';

xdescribe('AssignmentData', () => {
  let service: AssignmentDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
