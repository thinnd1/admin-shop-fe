import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDetailsPopupComponent } from './staff-details-popup.component';

describe('StaffDetailsPopupComponent', () => {
  let component: StaffDetailsPopupComponent;
  let fixture: ComponentFixture<StaffDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
