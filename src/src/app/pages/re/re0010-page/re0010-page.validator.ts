/**
 * Created by thaobtb on 8/30/2017.
 */
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Helper} from '../../../common/helper';
import {Validator} from '../../../common/validation/validator';

@Injectable()
export class PrUserEditValidator {

  validationMessage: any;
  checkFormValid = true;
  checkArrayValid = true;
  formErrors = {
    'loginId': '',
    'mailAddress': '',
    'firstName': '',
    'lastName': '',
    'firtNameKana': '',
    'lastNameKana': '',
    'additionalMailAddress': [],
    'birthDate': [],
    'officeName': '',
    'branchAddress': '',
    'mobileNo': '',
    'branchPhoneNo': '',
    'branchPrefectureCode': '',
    'branchDepartment': '',
    'pharmacyGraduation': '',
    'listHandles': [],
    'identificationFileName' : '',
    'imageUrl' : ''
  };
  formInputPassError = '';

  constructor(private translate: TranslateService, private validator: Validator, private fb: FormBuilder, private helper: Helper) {
  }

  userEditForm(model) {
    return this.fb.group({
      'loginId': [
        model.loginId,
        Validators.compose([Validators.required, Validators.minLength(8),
          Validators.maxLength(64), Validators.pattern(Validator.loginIDRegex)])
      ],
      'mailAddress': [
        model.mailAddress, Validators.compose([Validators.pattern(Validator.emailRegex), Validators.maxLength(64)])
      ],
      'firstName': [
        model.firstName,
        Validators.compose([Validators.required, Validators.maxLength(8)])
      ],
      'lastName': [
        model.lastName,
        Validators.compose([Validators.required, Validators.maxLength(8)])
      ],
      'firtNameKana': [
        model.firtNameKana,
        Validators.compose([Validators.required, Validators.maxLength(8), Validators.pattern(Validator.nameKanaRegex)])
      ],
      'lastNameKana': [
        model.lastNameKana,
        Validators.compose([Validators.required, Validators.maxLength(8), Validators.pattern(Validator.nameKanaRegex)])
      ],
      'birthDate': [
        model.birthDate
      ],
      'gender': model.gender,
      'officeName': [
        model.officeName,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ],
      'branchPrefectureCode': [
        (model.branchPrefectureCode ? model.branchPrefectureCode : ''), Validators.required
      ],
      'branchAddress': [
        model.branchAddress,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ],
      'branchDepartment': [
        model.branchDepartment,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ],
      'branchPhoneNo': [
        model.branchPhoneNo,
        Validators.compose([Validators.required, this.validator.validateTel(false)])
      ],
      'mobileNo': [
        model.mobileNo,
        Validators.compose([Validators.required, this.validator.validateTel(true)])
      ],
      'experiences': [
        model.experiences
      ],
      'pharmacyGraduation': [
        model.pharmacyGraduation, Validators.required
      ],
      'hobby': [
        model.hobby, Validators.maxLength(20)
      ],
      'placeBornIn': [
        model.placeBornIn, Validators.maxLength(100)
      ],
      'additionalMailAddress': this.fb.array([]),
      'listHandles': this.fb.array([]),
      'message': model.message,
      'industryType': model.industryType,
      'identificationUpdated': model.identificationUpdated,
      'identificationFileName': [model.identificationFileName, Validators.required],
      'identificationImageUrl': model.identificationImageUrl
    });
  }

  formConfirmMail() {
    return this.fb.group({
      'inputPass': ['', Validators.compose([Validators.required, Validators.pattern(Validator.passwordRegex)])]
    });
  }

  /**
   * RE0010-2 && RE0010-3 Check validation
   */
  checkPassValid(formConfirmMail: FormGroup) {
    if (formConfirmMail.get('inputPass').value === '') {
      this.translate.get('RE0010').subscribe(msg => {
        this.formInputPassError = msg.PASS_ERROR;
      });
    } else {
      this.formInputPassError = '';
    }
    return this.formInputPassError;
  }

  /**
   * RE0010 Check validation when submited
   */
  validationSubmited(form: FormGroup, model) {
    this.checkFormValid = true;
    this.checkArrayValid = true;
    let checkBirthDate = true;
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      for (const field in this.formErrors) {
        switch (field) {
          case 'birthDate':
            const result = this.getErrorBirthDateMessage('year', 'month', 'day');
            this.formErrors.birthDate = result.errors;
            checkBirthDate = result.checkBirthDate;
            continue;
          case 'additionalMailAddress':
            this.arrayValidate(form, 'additionalMailAddress', 'email');
            this.checkDuplication(form, 'additionalMailAddress', 'email', model);
            continue;
          case 'listHandles':
            if(model.industryType === 'I0001'){
              this.arrayValidate(form, 'listHandles', 'fieldId');
            }
            this.checkDuplication(form, 'listHandles', 'fieldId', model);
            continue;
          default:
            this.fieldValidate(form, field);
            this.checkAllSpaces(form, field);
            if(field === 'mailAddress'){
              this.checkDuplication(form, 'mailAddress', 'email', model);
            }
        }
      }
    }
    return {
      'formErrors': this.formErrors,
      'checkFormValid': this.checkFormValid,
      'checkArrayValid': this.checkArrayValid,
      'checkBirthDate': checkBirthDate
    };
  }

  checkAllSpaces(form, field) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      if (field !== 'pharmacyGraduation' && field !== 'mobileNo' && field !== 'branchPhoneNo') {
        const control = form.get(field);
        if (control && control.value && control.value.trim() === '') {
          const mess = this.validationMessage[field];
          if (field === 'mailAddress') {
            this.formErrors[field] = mess['pattern'];
          } else {
            this.formErrors[field] = mess['required'];
          }
          this.checkFormValid = false;
        }
      }
      return this.formErrors[field];
    }
  }

  /**
   * RE0010 check validate for fields
   */
  fieldValidate(form, field) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.invalid) {
        const mess = this.validationMessage[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            this.formErrors[field] = mess[key];
          }
        }
        this.checkFormValid = false;
      }
    }
    return this.formErrors[field];
  }

  /**
   * RE0010 check validate for an array
   */

  checkDuplication(form, field, name, model?) {
    if (field === 'mailAddress') {
      const value = form.get('mailAddress').value;
      if(value !== ''){
        if(model.additionalMailAddress.indexOf(value) > -1){
          this.formErrors['mailAddress'] = this.translate.instant('VAL.DUPLICATION_MAIL');
          this.checkArrayValid = false;
          this.checkFormValid = false;
        }
      }
    }else{

      const duplicate = [];
      const listValue = <FormArray>form.get(field).value;
      for (let i = 0; i < listValue.length; i++) {
        const value = listValue[i][name];

        if(field === 'additionalMailAddress' && value !== ''){
          if(duplicate.indexOf(value) > -1 || (value === form.get('mailAddress').value && model.additionalMailAddress.indexOf(value) <  0) || value === model.mailAddress){
            this.formErrors[field][i] = this.translate.instant('VAL.DUPLICATION_MAIL');
            this.checkArrayValid = false;
            this.checkFormValid = false;
          }
        }

        if(field === 'listHandles' && value !== ''){
          if(duplicate.indexOf(value) > -1){
            this.formErrors[field][i] = this.translate.instant('VAL.DUPLICATION_MAIL');
            this.checkArrayValid = false;
            this.checkFormValid = false;
          }
        }

        duplicate.push(value);
      }
    }

    return this.formErrors[field];
  }

  arrayValidate(form, field, name) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      const list = <FormArray>form.get(field);
      if (list.controls.length === 1 && list.value[0][name] === '' && field === 'additionalMailAddress') {
        this.formErrors.additionalMailAddress[0] = '';
        this.checkArrayValid = true;
      } else {
        for (let i = 0; i < list.controls.length; i++) {
          const control = list.controls[i].get(name);
          const mess = this.validationMessage[field];
          if (control && !control.valid) {
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field][i] = mess[key];
                this.checkArrayValid = false;
                this.checkFormValid = false;
              }
            }
          } else {
            this.formErrors[field][i] = '';
          }
        }
      }
    }
    return this.formErrors[field];
  }

  getErrorBirthDateMessage(yearId: string, monthId: string, dayId: string) {
    this.getValidationMessage();
    let checkBirthDateValid = true;
    let checkBirthDate = true;
    const errors = new Array(3);
    if ($('#' + yearId).val() === '') {
      errors[0] = this.validationMessage.birthDate;
      checkBirthDateValid = false;
    } else {
      errors[0] = '';
    }
    if ($('#' + monthId).val() === '') {
      errors[1] = this.validationMessage.birthDate;
      checkBirthDateValid = false;
    } else {
      errors[1] = '';
    }
    if ($('#' + dayId).val() === '') {
      errors[2] = this.validationMessage.birthDate;
      checkBirthDateValid = false;
    } else {
      errors[2] = '';
    }
    if (!checkBirthDateValid) {
      checkBirthDate = false;
    }
    return {'errors': errors, 'checkBirthDate': checkBirthDate};
  }

  getValidationMessage() {
    this.translate.get(['RE0010', 'VAL']).subscribe((res) => {
      this.validationMessage = {
        'loginId': {
          'required': res.VAL.LOGIN_ID.LENGTH,
          'maxlength': res.VAL.LOGIN_ID.LENGTH,
          'minlength': res.VAL.LOGIN_ID.LENGTH,
          'pattern': res.VAL.LOGIN_ID.NOT_MATCH_PATTERN,
        },
        'mailAddress': {
          'maxlength': res.VAL.ILLEGAL_FORMAT_EMAIL,
          'pattern': res.VAL.ILLEGAL_FORMAT_EMAIL
        },
        'additionalMailAddress': {
          'maxlength': res.VAL.ILLEGAL_FORMAT_EMAIL,
          'required': res.VAL.ILLEGAL_FORMAT_EMAIL,
          'pattern': res.VAL.ILLEGAL_FORMAT_EMAIL
        },
        'firstName': {
          'required': res.VAL.FIRST_NAME,
          'maxlength': res.VAL.FIRST_NAME,
        },
        'lastName': {
          'required': res.VAL.LAST_NAME,
          'maxlength': res.VAL.LAST_NAME,
        },
        'firtNameKana': {
          'required': res.VAL.FIRST_NAME_KANA,
          'maxlength': res.VAL.FIRST_NAME_KANA,
          'pattern': res.VAL.FIRST_NAME_KANA,
        },
        'lastNameKana': {
          'required': res.VAL.LAST_NAME_KANA,
          'maxlength': res.VAL.LAST_NAME_KANA,
          'pattern': res.VAL.LAST_NAME_KANA,
        },
        'birthDate': {
          'required': 'Required'
        },
        'officeName': {
          'required': res.RE0010.RE0010_ERROR.OFFICE_NAME,
          'maxlength': res.RE0010.RE0010_ERROR.OFFICE_NAME_LENGTH
        },
        'branchAddress': {
          'required': res.RE0010.RE0010_ERROR.BRANCH_ADDRESS,
          'maxlength': res.RE0010.RE0010_ERROR.BRANCH_ADDRESS_LENGTH
        },
        'branchPrefectureCode': {
          'required': res.RE0010.RE0010_ERROR.PREFECTURE
        },
        'branchDepartment': {
          'required': res.RE0010.RE0010_ERROR.BRANCH_DEPARTMENT,
          'maxlength': res.RE0010.RE0010_ERROR.BRANCH_DEPARTMENT_LENGTH
        },
        'pharmacyGraduation': {
          'required': 'Required'
        },
        'listHandles': {
          'required': res.RE0010.RE0010_ERROR.DEPARTMENT_REQUIRED
        },
        'mobileNo': {
          'required': res.RE0010.RE0010_ERROR.MOBILE.REQUIRED,
          'maxlength': res.RE0010.RE0010_ERROR.MOBILE.MAXLENGTH,
          'fixLength': res.VAL.PHONE_FIXLENGTH
        },
        'branchPhoneNo': {
          'required': res.RE0010.RE0010_ERROR.PHONE.REQUIRED,
          'maxlength': res.RE0010.RE0010_ERROR.PHONE.MAXLENGTH,
          'fixLength': res.VAL.PHONE_FIXLENGTH
        },
        'identificationFileName': {
          'required': res.RE0010.RE0010_ERROR.IDENTIFICATION_IMAGE_URL
        },
        'imageUrl': {
          'required': res.RE0010.RE0010_ERROR.IMAGE_URL
        }
      };
    });
  }
}
