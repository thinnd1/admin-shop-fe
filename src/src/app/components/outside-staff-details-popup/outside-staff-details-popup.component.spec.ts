import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutsideStaffDetailsPopupComponent } from './outside-staff-details-popup.component';

describe('OutsideStaffDetailsPopupComponent', () => {
  let component: OutsideStaffDetailsPopupComponent;
  let fixture: ComponentFixture<OutsideStaffDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutsideStaffDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutsideStaffDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
