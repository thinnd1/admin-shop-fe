import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffInvitePageComponent } from './staff-invite-page.component';
import {AppModule} from './../../../app.module';
import {FormGroup, FormArray} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {RegistrationService} from './../../../services/registration.service';
import {DialogService} from './../../../services/dialog.service';
import {StaffInvite} from '../../../models/re/staff-invite';


describe('StaffInvitePageComponent', () => {
  let component: StaffInvitePageComponent;
  let fixture: ComponentFixture<StaffInvitePageComponent>;
  let registrationService: RegistrationService;
  let translate: TranslateService;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [RegistrationService, DialogService, TranslateService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffInvitePageComponent);
    component = fixture.componentInstance;
    registrationService = fixture.debugElement.injector.get(RegistrationService);
    translate = fixture.debugElement.injector.get(TranslateService);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('all null => false', () => {
    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('required', ['firstName'])).toBe(true);
    expect(staff.hasError('required', ['lastName'])).toBe(true);
    expect(staff.hasError('required', ['firstNameKana'])).toBe(true);
    expect(staff.hasError('required', ['lastNameKana'])).toBe(true);
    expect(staff.hasError('required', ['department'])).toBe(true);
    expect(staff.hasError('required', ['jobType'])).toBe(true);
    expect(staff.hasError('required', ['staffAuthority'])).toBe(true);
    expect(staff.hasError('required', ['otherAuthority'])).toBe(true);
  });

  it('firstName null => false', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);
    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('required', ['firstName'])).toBe(true);
  });

  it('firstName, lastName, firstNameKana, lastNameKana length >,  8 => false', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', '123456789', '123456789', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('maxlength', ['firstName'])).toBe(true);
    expect(staff.hasError('maxlength', ['lastName'])).toBe(true);
    expect(staff.hasError('maxlength', ['firstNameKana'])).toBe(true);
    expect(staff.hasError('maxlength', ['lastNameKana'])).toBe(true);
  });

  it('firstNameKana, lastNameKana not kana >,  8 => false', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['firstNameKana'])).toBe(true);
    expect(staff.hasError('pattern', ['lastNameKana'])).toBe(true);
  });

  it('firstNameKana, lastNameKana => true format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['firstNameKana'])).toBe(false);
    expect(staff.hasError('pattern', ['lastNameKana'])).toBe(false);
  });

  it('email => true format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'email@gmail.com', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['email'])).toBe(false);
  });

  it('email => false format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'email@gmail.m', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['email'])).toBe(true);
  });

  it('email => false format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'email@gmail', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['email'])).toBe(true);
  });

  it('email => false format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'email@', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['email'])).toBe(true);
  });

  it('email => false format', () => {
    component.deleteAllStaff();
    const dataStaff = [];
    const data = new StaffInvite('123456789', '123456789', 'あああ', 'あああ', 'aaaa', 'aaaa', 'email', 'aaaa', 'aaaa');
    dataStaff.push(data);
    component.addStaff(dataStaff);

    expect(component.modelGroupForm.valid).toBe(false);
    const listStaff = <FormArray>component.modelGroupForm.controls.staff;
    const staff = <FormGroup>listStaff.controls[0];
    expect(staff.hasError('pattern', ['email'])).toBe(true);
  });

  it('test api', (done) => {
    const dataStaff = [{
      'firstName': 'aaaaa',
      'lastName': 'aaaa',
      'firstNameKana': 'aaaa',
      'lastNameKana': 'aaaaa',
      'departmant': 'aaaa',
      'job': 'aaaa',
      'email': 'email@gmail.com',
      'staffAuthority': 'aaa',
      'otherAuthority': 'aaa'
    }];

    component.deleteAllStaff();
    component.addStaff(dataStaff);
    registrationService.staffInviteTempRegist(component.modelGroupForm.controls.staff.value).subscribe(
      res => {
        expect(res.status).toBe(200);
        done();
      },
      error => {
      }
    );
  });
});
