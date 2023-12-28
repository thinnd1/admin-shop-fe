import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsideStaffDetailsPopupComponent } from './inside-staff-details-popup.component';

describe('InsideStaffDetailsPopupComponent', () => {
  let component: InsideStaffDetailsPopupComponent;
  let fixture: ComponentFixture<InsideStaffDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsideStaffDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsideStaffDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
