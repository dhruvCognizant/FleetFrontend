import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAssignmentsComponent } from './user-assignments';

xdescribe('UserAssignments', () => {
  let component: UserAssignmentsComponent;
  let fixture: ComponentFixture<UserAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
