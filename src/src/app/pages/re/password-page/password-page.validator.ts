import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {PasswordSettings} from '../../../models/re/password-settings';

@Injectable()

export class PasswordPageValidator {
  messageValidationError: any;

  constructor(private fb: FormBuilder, private  translate: TranslateService, private validator: Validator) {
  }

  /*
  * create form change password
  */
  createForm(model: PasswordSettings) {
    this.getValidationMessages();
    let form: FormGroup;
    form = this.fb.group({
      'currentPassword': [model.currentPassword, [
        Validators.required
      ]
      ],
      'newPassword': [model.newPassword, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Validator.passwordRegex),
      ]
      ],
      'newPasswordConfirm': [model.newPasswordConfirm, [
        Validators.required
      ]
      ]
    });
    return form;
  }

  /*
  *check validate form after submit
  */
  checkValidate(changePasswordForm: FormGroup, formMessagesError: PasswordSettings) {
    if (!changePasswordForm) {
      return false;
    }
    const form = changePasswordForm;

    for (const field in formMessagesError) {
      if (formMessagesError.hasOwnProperty(field)) {
        formMessagesError[field] = '';
        formMessagesError[field] = this.validator.validateForm(form, field, this.messageValidationError[field]);
      }
    }

    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('newPasswordConfirm');
    if (newPassword.value !== confirmPassword.value && confirmPassword.value) {
      formMessagesError['newPasswordConfirm'] = this.messageValidationError['newPasswordConfirm']['passwordMatch'];
    }
  }

  getValidationMessages() {
    this.translate.get('VAL').subscribe((res: any) => {
      this.messageValidationError = {
        'currentPassword': {
          'required': res.ERROR_CHANGE_PASSWORD.CURRENT_PASSWORD_REQUIRED,
          'passwordMatch': res.ERROR_CHANGE_PASSWORD.CURRENT_PASSWORD_MATCH,
        },
        'newPassword': {
          'required': res.ERROR_CHANGE_PASSWORD.NEW_PASSWORD_REQUIRED,
          'minlength': res.PASSWORD_FORMAT_ERROR,
          'maxlength': res.PASSWORD_FORMAT_ERROR,
          'pattern': res.PASSWORD_FORMAT_ERROR
        },
        'newPasswordConfirm': {
          'required': res.ERROR_CHANGE_PASSWORD.CONFIRM_PASSWORD_REQUIRED,
          'passwordMatch': res.PASSWORD_CONFIRM_MISMATCH
        }
      };
    });
  }
}
