import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Regbody } from './regbody';

xdescribe('Regbody', () => {
  let component: Regbody;
  let fixture: ComponentFixture<Regbody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Regbody]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Regbody);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
