import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSchedulingComponent } from './msadmin';

xdescribe('MSAdmin', () => {
  let component: ServiceSchedulingComponent;
  let fixture: ComponentFixture<ServiceSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceSchedulingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
