import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Validator } from '../../../common/validation/validator';
import { Helper } from '../../../common/helper';

@Injectable()
export class Re0022PageValidator {
  public msgFormForgotPass;
  public msgResetPass;
  constructor(private fb: FormBuilder, private translate: TranslateService, private validator: Validator) {
    this.getErrorValidate();
  }

  createFormForgotPassword() {
    let form: FormGroup;
    form = this.fb.group({
      'mailAddressVal': ['', [Validators.required, Validators.pattern(Helper.emailRegex), Validators.maxLength(64)]],
      'mailAddressConfirmVal': ['', [Validators.required, Validators.pattern(Helper.emailRegex), Validators.maxLength(64)]],
    });

    return form;
  }

  createFormResetPassword() {
    let form: FormGroup;
    form = this.fb.group({
      'newPassword': ['', [Validators.required, Validators.pattern(Helper.passwordRegex), Validators.minLength(6),
        Validators.maxLength(16)]],
      'newPasswordConfirm': ['', [Validators.required]],
      'yearBirth': ['', [Validators.required]],
      'monthBirth': ['', [Validators.required]],
      'dayBirth': ['', [Validators.required]]
    });

    return form;
  }

  checkValidateForgotPassword(form, errorForgotPassword) {
    if (!form) {
      return false;
    }

    for (const field in errorForgotPassword) {
      if (errorForgotPassword.hasOwnProperty(field)) {
        errorForgotPassword[field] = '';
        errorForgotPassword[field] = this.validator.validateForm(form, field, this.msgFormForgotPass[field]);
      }
    }

    const mailAddressVal = form.get('mailAddressVal');
    const mailAddressConfirmVal = form.get('mailAddressConfirmVal');
    if (mailAddressVal.value !== mailAddressConfirmVal.value && mailAddressConfirmVal.value) {
      errorForgotPassword['mailAddressConfirmVal'] = this.msgFormForgotPass['mailAddressConfirmVal']['mailMatch'];
    }
  }

  checkValidateResetPassword(form, errorResetPassword) {
    if (!form) {
      return false;
    }

    for (const field in errorResetPassword) {
      if (errorResetPassword.hasOwnProperty(field)) {
        errorResetPassword[field] = '';
        errorResetPassword[field] = this.validator.validateForm(form, field, this.msgResetPass[field]);
      }
    }

    const newPassword = form.get('newPassword');
    const newPasswordConfirm = form.get('newPasswordConfirm');
    if (newPassword.value !== newPasswordConfirm.value && newPasswordConfirm.value) {
      errorResetPassword['newPasswordConfirm'] = this.msgResetPass['newPasswordConfirm']['passwordMatch'];
    }
  }

  getErrorValidate() {
    this.translate.get('VAL').subscribe((res: any) => {
      this.msgFormForgotPass = {
        'mailAddressVal': {
          'required': res.REQUIRED_EMAIL,
          'maxlength': res.LENGHT_EMAIL,
          'pattern': res.ILLEGAL_FORMAT_EMAIL
        },
        'mailAddressConfirmVal': {
          'required': res.REQUIRED_EMAIL,
          'maxlength': res.LENGHT_EMAIL,
          'pattern': res.ILLEGAL_FORMAT_EMAIL,
          'mailMatch': res.MAIL_ADDRESS_CONFIRM_ERROR
        },
      };

      this.msgResetPass = {
        'newPassword': {
          'required': res.ERROR_CHANGE_PASSWORD.NEW_PASSWORD_REQUIRED,
          'minlength': res.PASSWORD_FORMAT_ERROR,
          'maxlength': res.PASSWORD_FORMAT_ERROR,
          'pattern': res.PASSWORD_FORMAT_ERROR
        },
        'newPasswordConfirm': {
          'required': res.ERROR_CHANGE_PASSWORD.CONFIRM_PASSWORD_REQUIRED,
          'passwordMatch': res.PASSWORD_CONFIRM_MISMATCH
        },
        'yearBirth': {
          'required': res.DATE_BIRTH_REQUIRED,
        },
        'monthBirth': {
          'required': res.DATE_BIRTH_REQUIRED,
        },
        'dayBirth': {
          'required': res.DATE_BIRTH_REQUIRED,
        },
      };
    });
  }
}
