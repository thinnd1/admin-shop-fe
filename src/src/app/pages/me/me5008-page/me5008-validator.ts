import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class Me5008Validator {
  errors = {
    'paymentName': '',
    'zipCode1': '',
    'zipCode2': '',
    'address': '',
    'name': ''
  };
  validationMessage: any;

  constructor(private fb: FormBuilder, private translate: TranslateService,
              private validator: Validator, private specialtyArea: SpecialtyAreaConverter) {};
  createFormMe5008(userSession: any) {
    let Me5008Form: FormGroup;
    this.getErrorValidate();
    const paymentName = userSession.officeName + ' ' + userSession.lastName + ' ' + userSession.firstName;
    const name = userSession.lastName + ' ' + userSession.firstName;
    Me5008Form = this.fb.group({
      'paymentName': [paymentName, Validators.compose([Validators.required, Validators.maxLength(64)])],
      'zipCode1': ['', Validators.compose([Validators.required, Validators.maxLength(3), Validators.minLength(3)])],
      'zipCode2': ['', Validators.compose([Validators.required, Validators.maxLength(4), Validators.minLength(4)])],
      'address': ['', Validators.required],
      'address2': [''],
      'name': [name, Validators.compose([Validators.required, Validators.maxLength(64)])],
    });
    return Me5008Form;
  }

  checkValidate(Me5008Form: FormGroup) {
    let checkValidateForm = true;
    if (!Me5008Form) {
      return false;
    }
    this.getErrorValidate();
    for (const field in this.errors) {
      this.errors[field] = '';
      if (this.errors.hasOwnProperty(field)) {
        const control = Me5008Form.get(field);
        if (control && ( !control.valid || (control.value !== null && control.value.trim() === ''))) {
          if (control.value !== null && control.value.trim() === '') {
            this.errors[field] = this.validationMessage[field].required;
            checkValidateForm = false;
          }
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.errors[field] = this.validationMessage[field][key];
              checkValidateForm = false;
            }
            break;
          }
        }
      }
    }
    return {checkValidateForm: checkValidateForm, formErrors: this.errors};
  }

  // checkSpaceBlank(form) {
  //   if (form.value.paymentName.trim() === '') {
  //     this.errors.paymentName = this.validationMessage.paymentName.required;
  //   }
  //   if (form.value.zipCode1.trim() === '') {
  //     this.errors.zipCode1 = this.validationMessage.zipCode1.required;
  //   }
  //   if (form.value.zipCode2.trim() === '') {
  //     this.errors.zipCode2 = this.validationMessage.zipCode2.required;
  //   }
  //   if (form.value.address.trim() === '') {
  //     this.errors.address = this.validationMessage.address.required;
  //   }
  //   if (form.value.address2.trim() === '') {
  //     this.errors.address2 = this.validationMessage.address2.required;
  //   }
  //   if (form.value.name.trim() === '') {
  //     this.errors.name = this.validationMessage.name.required;
  //   }
  // }

  getErrorValidate() {
    this.translate.get( 'ME0058').subscribe((res: any) => {
      this.validationMessage = {
        'paymentName': {
          'required': res.ME0058_ERROR.NAME_REQUIRED,
          'maxlength': res.ME0058_ERROR.MAX_LENGHT_NAMEPAY,
        },
        'zipCode1': {
          'required': res.ME0058_ERROR.ZIPCODE_REQUIRED,
          'minlength': res.ME0058_ERROR.ZIPCODE_MINLENGTH,
        },
        'zipCode2': {
          'required': res.ME0058_ERROR.ZIPCODE_REQUIRED,
          'minlength': res.ME0058_ERROR.ZIPCODE_MINLENGTH,
        },
        'address': {
          'required': res.ME0058_ERROR.ADDRESS_REQUIRED,
        },
        'address2': {
          // 'required': res.ME0058_ERROR.ADDRESS2_REQUIRED,
        },
        'name': {
          'required': res.ME0058_ERROR.PAYMENT_NAME_PAY_REQUIRED,
          'maxlength': res.ME0058_ERROR.MAX_LENGHT_NAME,
        },
      };
      });
  }
}
