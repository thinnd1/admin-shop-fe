import {AbstractControl, FormGroup} from '@angular/forms';
/**
 * Created by caton on 29/08/2017.
 */
export class Validator {
  public static loginIDRegex = /^[a-zA-Z0-9\@\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]+$/;
  public static emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9]{1,}[.][a-zA-Z0-9]{1,5}((?:[.]{1}[a-zA-Z0-9]{1,5})?)*$/;
  public static nameKanaRegex = '^[ぁ-ゔゞ゛゜ー]+$';
  public static passwordRegex =  '^[a-zA-Z0-9_]+$';
  public static drugCodeRegex =  /^[0-9]{7}[A-Z]{1}[0-9]{1,4}$/;

  constructor() {
  }
  validateForm (form: FormGroup, field: string, validationMessages: any) {
    let messages = '';
    const control = form.get(field);
    if (control && !control.valid) {
      for (const key in control.errors) {
        if (control.errors.hasOwnProperty(key)) {
          messages = validationMessages[key];
        }
      }
    }
    return messages;
  }

  validateTel(isMobile?: boolean) {
    const phone_regex = /^\d{2,5}-\d{1,4}-\d{4}$/;
    const mobile_regex = /^\d{3}-\d{4}-\d{4}$/;
    const regex = isMobile ? mobile_regex : phone_regex;
    return (control: AbstractControl): { [key: string]: any } => {
      const forbidden = !regex.test(control.value) && control.value !== '';
      return forbidden ? {
        'fixLength': true
      } : null;
    };
  }

  validateAllSpace() {
    return (control: AbstractControl): { [key: string]: any } => {
      const forbidden = control.value === null || (typeof control.value === 'string' && control.value.trim() === '');
      return forbidden ? {
        'required': true
      } : null;
    };
  }

  validateMailOrLoginID() {
    return (control: AbstractControl): { [key: string]: any } => {
      let checkEmail = true;
      let checkLoginId = true;
      if (control.value.indexOf('@') > -1) {
        checkEmail = Validator.emailRegex.test(control.value);
        if (!checkEmail) {
          checkLoginId = Validator.loginIDRegex.test(control.value);
        }
      } else {
        checkLoginId = Validator.loginIDRegex.test(control.value);
      }
      return (!checkEmail && !checkLoginId) ? {
        'pattern': true
      } : null;
    };
  }

}
