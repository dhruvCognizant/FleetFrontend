import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianAssignmentComponent } from './technician-assignment';

xdescribe('TechnicianAssignment', () => {
  let component: TechnicianAssignmentComponent;
  let fixture: ComponentFixture<TechnicianAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});