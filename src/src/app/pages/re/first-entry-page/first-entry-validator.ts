import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Validator } from '../../../common/validation/validator';
import { FirstEntrySettings } from '../../../models/re/first-entry-settings';
import {SpecialtyAreaConverter} from "../../../common/converter/specialty-area.converter";
@Injectable()
export class FirstEntryValidator {
  errors = {
    'newPassword': '',
    'newPasswordConfirm': '',
    'newEmailAddress': '',
    'newEmailAddressConfirm': '',
    'yearBirth': '',
    'monthBirth': '',
    'dayBirth': '',
    'specializedDepartmentField': '',
    'specializedDepartmentType': '',
    'chkResgister': '',
  };

  validationMessage: any;
  checkVaild = true;
  constructor(private fb: FormBuilder, private translate: TranslateService, private validator: Validator, private specialtyArea: SpecialtyAreaConverter) { }
  createFromFirstEntry(model: FirstEntrySettings) {
    let firstEntryForm: FormGroup;
    this.getErrorValidate();
    this.translate.get('ERROR_CHANGE_PASSWORD').subscribe(res => { });
    firstEntryForm = this.fb.group({
      'newPassword': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Validator.passwordRegex)]
      ],
      'newPasswordConfirm': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Validator.passwordRegex)]
      ],
      'newEmailAddress': [model.newEmailAddress, [
        Validators.required,
        Validators.maxLength(64),
        Validators.pattern(Validator.emailRegex)]
      ],
      'newEmailAddressConfirm': [model.newEmailAddress, [
        Validators.required,
        Validators.maxLength(64),
        Validators.pattern(Validator.emailRegex)]
      ],
      'gender': [model.gender],
      'yearBirth': [model.yearBirth,
      Validators.required
      ],
      'monthBirth': [model.monthBirth,
      Validators.required
      ],
      'dayBirth': [model.dayBirth,
      Validators.required
      ],
      'specializedDepartmentField': [model.specializedDepartmentField, Validators.required],
      'specializedDepartmentType': [model.specializedDepartmentType, Validators.required],
      'emailNotification': [model.emailNotification],
      'chkResgister': [model.chkResgister],
      'firstName': [model.firstName],
      'firstNameKana': [model.firstNameKana],
      'lastName': [model.lastName],
      'lastNameKana': [model.lastNameKana],
      'jobType': [model.jobType],
      'jobName': [model.jobName],
      'loginId': [model.loginId],
      'mailAddress': [model.mailAddress]
    });
    return firstEntryForm;
  }

  getErrorValidate() {
    this.translate.get(['RE0019', 'RE0023', 'VAL']).subscribe((res: any) => {
      this.validationMessage = {
        'newPassword': {
          'required': res.RE0023.RE0023_ERROR.PASSWORD_REQUIRED,
          'minlength': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR,
          'maxlength': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR,
          'passwordMatch': res.VAL.PASSWORD_CONFIRM_MISMATCH,
          'pattern': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR
        },
        'newPasswordConfirm': {
          'required': res.VAL.ERROR_CHANGE_PASSWORD.CONFIRM_PASSWORD_REQUIRED,
          'minlength': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR,
          'maxlength': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR,
          'pattern': res.RE0023.RE0023_ERROR.PASSWORD_FORMAT_ERROR
        },
        'newEmailAddress': {
          'required': res.RE0023.RE0023_ERROR.EMAIL_REQUIRED,
          'maxlength': res.RE0023.RE0023_ERROR.MAX_LENGHT_EMAIL,
          'emailAddressMatch': res.RE0023.RE0023_ERROR.EMAIL_CONFIRM_MISMATCH,
          'pattern': res.RE0023.RE0023_ERROR.EMAIL_TEXT
        },
        'newEmailAddressConfirm': {
          'required': res.RE0023.RE0023_ERROR.CONFIRM_EMAIL_REQUIRED,
          'maxlength': res.RE0023.RE0023_ERROR.MAX_LENGHT_EMAIL,
          'pattern': res.RE0023.RE0023_ERROR.EMAIL_TEXT
        },
        'yearBirth': {
          'required': res.RE0023.RE0023_ERROR.DATE_BIRTH_REQUIRED,
        },
        'monthBirth': {
          'required': res.RE0023.RE0023_ERROR.DATE_BIRTH_REQUIRED,
        },
        'dayBirth': {
          'required': res.RE0023.RE0023_ERROR.DATE_BIRTH_REQUIRED,
        },
        'specializedDepartmentField': {
          'required': res.RE0023.RE0023_ERROR.SPECIALIZE_DEPARTMENT_REQUIRED,
        },
        'specializedDepartmentType': {
          'required': res.RE0023.RE0023_ERROR.SPECIALIZE_DEPARTMENT,
        },
        'chkResgister': {
          'checked': res.RE0023.RE0023_ERROR.CHECK_RESGISTER
        }
      };
    });
  }

  checkValidate(firstEntryForm: FormGroup) {
    this.checkVaild = true;
    if (!firstEntryForm) {
      return false;
    }
    const form = <FormGroup>firstEntryForm;
    for (const field in this.errors) {
      if (this.errors.hasOwnProperty(field)) {
        this.errors[field] = this.validator.validateForm(form, field, this.validationMessage[field]);
      }
    }
    // set validate password
    const newPasswors = form.get('newPassword');
    const confirmPassword = form.get('newPasswordConfirm');
    if (newPasswors.value !== confirmPassword.value && confirmPassword.value) {
      this.errors['newPasswordConfirm'] = this.validationMessage['newPassword']['passwordMatch'];
      this.checkVaild = false;
    }
    // set validate email
    const newEmailAddress = form.get('newEmailAddress');
    const newEmailAddressConfirm = form.get('newEmailAddressConfirm');
    if (form.controls.newEmailAddress && form.controls.newEmailAddressConfirm) {
      if (newEmailAddress.value !== newEmailAddressConfirm.value && newEmailAddressConfirm.value) {
        this.errors['newEmailAddressConfirm'] = this.validationMessage['newEmailAddress']['emailAddressMatch'];
        this.checkVaild = false;
      }
    }
    // set validate checkbox
    const check = form.get('chkResgister');
    if (check.value === false) {
      this.errors['chkResgister'] = this.validationMessage['chkResgister']['checked'];
      this.checkVaild = false;
    }
    // set validate password
    if (form.controls.specializedDepartmentField && form.controls.specializedDepartmentType) {
      const filed = form.get('specializedDepartmentField').value;
      const type = form.get('specializedDepartmentType').value;
      if (!filed || filed.id === this.specialtyArea.idDefault || filed === null || filed === this.specialtyArea.idDefault) {
        this.setBorderForDepartment('Fields', '#D21D29');
        this.errors['specializedDepartmentField'] = this.validationMessage['specializedDepartmentField'].required;
        this.checkVaild = false;
      } else {
        this.setBorderForDepartment('Fields', 'rgba(0, 0, 0, 0.15)');
      }
      if ((!type || type.id === this.specialtyArea.idDefault || type === null || type === this.specialtyArea.idDefault) && (filed && filed.id !== this.specialtyArea.idDefault && filed !== null && filed !== this.specialtyArea.idDefault)) {
        this.setBorderForDepartment('Types', '#D21D29');
        this.errors['specializedDepartmentType'] = this.validationMessage['specializedDepartmentType'].required;
        this.checkVaild = false;
      } else {
        this.setBorderForDepartment('Types', 'rgba(0, 0, 0, 0.15)');
        this.errors['specializedDepartmentType'] = '';
      }
    }
    return { 'formErrors': this.errors, 'checkValid': this.checkVaild };
  }
  setBorderForDepartment(idDepartment: string, color: string) {
    $('#' + idDepartment).children().children('span:first').children('span').css('border', '1px solid ' + color);
  }
}
