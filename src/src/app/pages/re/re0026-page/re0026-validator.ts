import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {FormArray} from '@angular/forms';

@Injectable()
export class Re0026Validator {

  validationForm: any = {};
  validationMess: any = {};

  constructor(private translate: TranslateService) {}

  /**
   * RE0026 validate form
   */
  checkValidate(myForm, formErrors) {
    if (!myForm) {
      return;
    } else {
      this.getValidationMessage();
      for (const field in formErrors) {
        if (field !== 'mailAddress') {
          formErrors[field] = '';
          const control = myForm.get(field);
          if (control && !control.valid) {
            const mess = this.validationMess[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                formErrors[field] = mess[key];
              }
            }
          } else {
            formErrors[field] = '';
          }
        } else {
          // validate for an array
          const listEmails = <FormArray>myForm.get('mailAddress');
          for (let i = 0; i < listEmails.controls.length; i++) {
            const control = listEmails.controls[i];
            const mess = this.validationMess[field];
            if (control && !control.valid) {
              for (const key in control.errors) {
                if (control.errors.hasOwnProperty(key)) {
                  formErrors.mailAddress[i] = mess[key];
                  if (listEmails.controls.length === 1 && key === 'required') {
                    formErrors.mailAddress[i] = this.translate.instant('RE0026.RE0026_ERROR.EMAIL.INCORRECT_FORMAT_ONE_MAIL');
                  }
                }
              }
            } else {
              formErrors.mailAddress[i] = '';
            }
          }
        }
      }
    }
  }

  /**
   * RE0026 translate validation messages
   */
  getValidationMessage() {
    this.translate.get('RE0026.RE0026_ERROR').subscribe((res: string) => {
      this.validationForm = res;
      this.validationMess = {
        'medicalOfficeId': {
          'required': this.validationForm.HOSPITAL.REQUIRED
        },
        'mailAddress': {
          'required': this.validationForm.EMAIL.INCORRECT_FORMAT_HIGH_MAIL,
          'pattern': this.validationForm.EMAIL.INCORRECT_FORMAT
        }
      };
    });
  }
}
