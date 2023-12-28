import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInvitePharmacyStaffComponent } from './modal-invite-pharmacy-staff.component';

describe('ModalInvitePharmacyStaffComponent', () => {
  let component: ModalInvitePharmacyStaffComponent;
  let fixture: ComponentFixture<ModalInvitePharmacyStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInvitePharmacyStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInvitePharmacyStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
