import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Validator } from '../../../common/validation/validator';
import {StaffInvite} from '../../../models/re/staff-invite';

@Injectable()
export class StaffInvitePageValidator {
  validationMessages: any;
  constructor(private fb: FormBuilder, private translate: TranslateService, private validator: Validator) {
    this.getErrorValidate();
  }

  /*
   * create form change password
   */
  createStaff(model) {
    let form: FormGroup;
    form = this.fb.group({
      'firstName': [model.firstName, [this.validator.validateAllSpace(), Validators.maxLength(8)]],
      'lastName': [model.lastName, [this.validator.validateAllSpace(), Validators.maxLength(8)]],
      'firstNameKana': [model.firstNameKana, [this.validator.validateAllSpace(), Validators.maxLength(8), Validators.pattern(Validator.nameKanaRegex)]],
      'lastNameKana': [model.lastNameKana, [this.validator.validateAllSpace(), Validators.maxLength(8), Validators.pattern(Validator.nameKanaRegex)]],
      'jobType': [model.jobType, [this.validator.validateAllSpace()]],
      'department': [model.department ? model.department.id : '', [Validators.required]],
      'mailAddress': [model.mailAddress, [ this.validator.validateMailOrLoginID(), Validators.minLength(8), Validators.maxLength(64)]],
      'managementAuthority': [model.managementAuthority, [Validators.required]],
      'funcAuthoritySet': [model.funcAuthoritySet, [Validators.required]]
    });

    return form;
  }

  checkValidate(form: FormGroup) {
    const errorObj = new StaffInvite('', '', '', '', '', '', '', '', '');
    for (const field in errorObj) {
      if (errorObj.hasOwnProperty(field)) {
        errorObj[field] = this.validator.validateForm(form, field, this.validationMessages[field]);
      }
    }
    return form.valid ? null : errorObj;
  }

  getErrorValidate() {
    this.translate.get(['RE0015', 'VAL']).subscribe((res: any) => {
      this.validationMessages = {
        'firstName': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED,
          'maxlength': res.VAL.FIRST_NAME
        },
        'lastName': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED,
          'maxlength': res.VAL.LAST_NAME
        },
        'lastNameKana': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED,
          'pattern': res.RE0015.LAST_NAME_KANA,
          'maxlength': res.RE0015.LAST_NAME_KANA
        },
        'firstNameKana': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED,
          'pattern': res.RE0015.FIRST_NAME_KANA,
          'maxlength': res.RE0015.FIRST_NAME_KANA
        },
        'department': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED
        },
        'jobType': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED
        },
        'mailAddress': {
          'minlength': res.RE0015.MSG_VALIDATION.MAX_LENGHT_EMAIL,
          'maxlength': res.RE0015.MSG_VALIDATION.MAX_LENGHT_EMAIL,
          'pattern': res.RE0015.MSG_VALIDATION.LOGINID
        },
        'managementAuthority': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED
        },
        'funcAuthoritySet': {
          'required': res.RE0015.MSG_VALIDATION.REQUIRED
        }
      };
    });
  }
}
