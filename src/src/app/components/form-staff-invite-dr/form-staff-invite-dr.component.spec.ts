import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormStaffInviteDrComponent } from './form-staff-invite-dr.component';

describe('FormStaffInviteDrComponent', () => {
  let component: FormStaffInviteDrComponent;
  let fixture: ComponentFixture<FormStaffInviteDrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormStaffInviteDrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormStaffInviteDrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
