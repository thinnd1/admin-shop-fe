import { Component, OnInit } from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { PharmacyService } from "../../services/pharmacy.service";
import { User } from "../../models/ph/user";

@Component({
  selector: 'app-modal-invite-pharmacy-staff',
  templateUrl: './modal-invite-pharmacy-staff.component.html',
  styleUrls: ['./modal-invite-pharmacy-staff.component.scss']
})
export class ModalInvitePharmacyStaffComponent implements DialogAdapter {
  params: DialogParams;
  mailForm: FormGroup;
  formErrors = {'email': ''};
  foundPharmacyStaff: User;
  inviteList: User[];

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService
  ) { }

  onModalInit() {
    this.inviteList = [];
    this.createMailForm();
  }

  getPayload(): any {
    return this.inviteList;
  }

  createMailForm() {
    this.mailForm = this.fb.group({
      email: ''
    });
  }

  searchPharmacyStaff() {
    this.foundPharmacyStaff = null;
    if (this.formIsValid()) {
      this.pharmacyService.searchPharmacyMember(this.mailForm.get('email').value)
      .subscribe((data: User) => {
          this.foundPharmacyStaff = data;
      });
    }
  }

  formIsValid() {
    let isValid = true;
    if (!this.mailForm.get('email').value || this.mailForm.get('email').value.trim() === '') {
      isValid = false;
      this.formErrors['email'] = 'GR0006.PLACEHOLDER_MAIL_INPUT';
    } else {
      this.formErrors['email'] = '';
    }

    return isValid;
  }

  isAlreadyAdded(pharmacyStaff: User) {
    return this.inviteList.map(function(s) { return s.officeUserId }).indexOf(pharmacyStaff.officeUserId) >= 0;
  }

  addToInviteList(pharmacyStaff: User) {
    if (!this.isAlreadyAdded(pharmacyStaff)) {
      this.inviteList.push(pharmacyStaff);
    }
    this.mailForm.reset();
    this.foundPharmacyStaff = null;
  }

  removeFromInviteList(i) {
    this.inviteList.splice(i, 1);
  }

}
