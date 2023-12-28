/**
 * Created by thaobtb on 8/31/2017.
 */
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Helper} from '../../../common/helper';
import {Validator} from '../../../common/validation/validator';
import {SpecialtyAreaConverter} from "../../../common/converter/specialty-area.converter";

@Injectable()
export class UserEditValidator {

  validationMessage: any;
  checkFormValid = true;
  checkArrayValid = true;
  checkDepartmentValid = true;
  formErrors = {
    'loginId': '',
    'imageUrl': '',
    'mailAddress': '',
    'firstName': '',
    'lastName': '',
    'firstNameKana': '',
    'lastNameKana': '',
    'additionalMailAddress': [],
    'mobileNo': '',
    'phsNo': '',
    'specializedDepartment': [],
    'mailAddressPublishingType': '',
    'mobileNoPublishingType': '',
  };

  formInputPassError = '';

  constructor(private translate: TranslateService,
              private validator: Validator,
              private fb: FormBuilder,
              private helper: Helper,
              private specialtyArea: SpecialtyAreaConverter) {
  }
  checkValidate(fieldForm: string, form: FormGroup, formError: any){
    const loginId = form.get(fieldForm).value;
    if (Helper.emailRegex.test(loginId) === false && Helper.loginIDRegex.test(loginId) === false && loginId) {
      formError['loginId'] = this.validationMessage['loginId'].pattern;
      return false;
    }else{
      formError['loginId'] = '';
      return true;
    }
  }

  userEditForm(userModel, publishingDefault) {
    return this.fb.group({
      'loginId': [
        userModel.loginId,
        Validators.compose([Validators.required, Validators.minLength(8),
          Validators.maxLength(64)])
      ],
      'mailAddress': [
        userModel.mailAddress, Validators.compose([Validators.pattern(Helper.emailRegex), Validators.maxLength(64)])
      ],
      'mailAddressPublishingType': [
        ((userModel.mailAddressPublishingType) ? userModel.mailAddressPublishingType : publishingDefault),
        Validators.compose([Validators.required])
      ],
      'firstName': [
        userModel.firstName, Validators.compose([Validators.required, Validators.maxLength(8)])
      ],
      'lastName': [
        userModel.lastName, Validators.compose([Validators.required, Validators.maxLength(8)])
      ],
      'firstNameKana': [
        userModel.firstNameKana,
        Validators.compose([Validators.required, Validators.maxLength(8), Validators.pattern(Helper.nameKanaRegex)])
      ],
      'lastNameKana': [
        userModel.lastNameKana,
        Validators.compose([Validators.required, Validators.maxLength(8), Validators.pattern(Helper.nameKanaRegex)])
      ],
      'birthDate': userModel.birthDate,
      'gender': userModel.gender,
      'mobileNo': [
        userModel.mobileNo,  Validators.compose([this.validator.validateTel(true)])
      ],
      'hobby': [
        userModel.hobby, Validators.maxLength(20)
      ],
      'placeBornIn': [
        userModel.placeBornIn, Validators.maxLength(100)
      ],
      'briefHistory': [
        userModel.briefHistory, Validators.maxLength(1000)
      ],
      'qualification': [
        userModel.qualification, Validators.maxLength(1000)
      ],
      'position': [
        userModel.position, Validators.maxLength(1000)],
      'additionalMailAddress': this.fb.array([]),
      'phsNo': [
        userModel.phsNo, Validators.maxLength(6)
      ],
      'jobType': userModel.jobType,
      'jobName': userModel.jobName,
      'imageUrl': userModel.imageUrl,
      'mobileNoPublishingType': [
        ((userModel.mobileNoPublishingType) ? userModel.mobileNoPublishingType : publishingDefault),
        Validators.required
      ],
      'specializedDepartment': this.fb.array([]),
      'department': userModel.department,
      'newLoginId': userModel.newLoginId
    });
  }

  formConfirmMail() {
    return this.fb.group({
      'inputPass': ['', Validators.compose([Validators.required, Validators.pattern(Validator.passwordRegex)])]
    });
  }

  checkPassValid(formConfirmMail: FormGroup) {
    if (formConfirmMail.get('inputPass').value === '') {
      this.translate.get('RE0020').subscribe(msg => {
        this.formInputPassError = msg.PASS_ERROR;
      });
    } else {
      this.formInputPassError = '';
    }
    return this.formInputPassError;
  }

  /**
   * RE0020 validate form when sumitted
   */
  submittedValidate(form, listTypeDisabled: any, model, fieldIds, typeIds) {
    this.checkFormValid = true;
    this.checkArrayValid = true;
    this.checkDepartmentValid = true;
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      for (const field in this.formErrors) {
        switch (field) {
          case 'additionalMailAddress':
            this.arrayValidate(form, 'additionalMailAddress');
            this.checkDuplication(form,'additionalMailAddress', model);
            continue;
          case 'specializedDepartment':
            this.checkSpecializedDepartment(form, listTypeDisabled, fieldIds, typeIds);
            this.checkDuplicationDept(form, model);
            continue;
          default:
            if (field === 'mobileNo') {
              form.patchValue({'mobileNo': this.helper.combinePhoneNumber('mobile-first', 'mobile-middle', 'mobile-last')});
            }
            this.fieldValidate(form, field);
            this.checkAllSpaces(form, field);
            if(field === 'mailAddress'){
              this.checkDuplication(form, 'mailAddress', model);
            }
        }
      }
    }
    return {
      'formErrors': this.formErrors,
      'checkFormValid': this.checkFormValid,
      'checkArrayValid': this.checkArrayValid,
      'checkDepartmentValid': this.checkDepartmentValid
    };
  }

  checkDuplication(form, field, model) {
    if(field === 'mailAddress'){
      const value = form.get('mailAddress').value;
      if(value !== ''){
        if(model.additionalMailAddress.filter(item => item === value).length > 0){
          this.formErrors['mailAddress'] = this.translate.instant('VAL.DUPLICATION_MAIL');
          this.checkArrayValid = false;
          this.checkFormValid = false;
        }
      }
    }else{
      const duplicate = [];
      const listValue = <FormArray>form.get('additionalMailAddress').value;
      for (let i = 0; i < listValue.length; i++) {
        if(listValue[i].trim() != ''){
          if (duplicate.indexOf(listValue[i].trim()) > -1||(listValue[i] === form.get('mailAddress').value && model.additionalMailAddress.indexOf(listValue[i].trim()) < 0) || listValue[i] === model.mailAddress) {
            this.formErrors['additionalMailAddress'][i] = this.translate.instant('VAL.DUPLICATION_MAIL');
            this.checkArrayValid = false;
            this.checkFormValid = false;
          }
          duplicate.push(listValue[i]);
        }
      }
    }

    return this.formErrors['additionalMailAddress'];
  }

  /**
   * RE0020 validate for an array
   */
  arrayValidate(form, field) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      const list = <FormArray>form.get(field);
      if (list.controls.length === 1 && list.value[0] === '' && field === 'additionalMailAddress') {
        this.formErrors.additionalMailAddress[0] = '';
        this.checkArrayValid = true;
      } else {
        for (let i = 0; i < list.controls.length; i++) {
          const control = list.controls[i];
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

  checkAllSpaces(form, field) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
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

  /**
   * RE0020 check validate for fields
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

  checkDuplicationDept(form, model) {
    const addedArr = [];
    const modelArr = model.specializedDepartment;
    const listDepartment = <FormArray>form.get('specializedDepartment').value;
    if (listDepartment.length > 0) {
      for (let i = 0; i < listDepartment.length; i++) {
        const obj = {};
        if (listDepartment[i].fieldId.id !== this.specialtyArea.idDefault && listDepartment[i].typeId.id !== this.specialtyArea.idDefault) {
          obj['fieldId'] = listDepartment[i].fieldId.id;
          obj['typeId'] = listDepartment[i].typeId.id;
          obj['index'] = i;
          addedArr.push(obj);
        }
      }
      const combineArray = modelArr.concat(addedArr);
      for (let m = 0; m < combineArray.length; m++) {
        for (let n = m; n < combineArray.length; n++) {
          if (m !== n && combineArray[m].fieldId === combineArray[n].fieldId &&
            combineArray[m].typeId === combineArray[n].typeId) {
            if (combineArray[n].index >= 0) {
              this.setBorderForDepartment('fieldId', combineArray[n].index, '#D21D29');
              this.setBorderForDepartment('typeId', combineArray[n].index, '#D21D29');
              this.formErrors.specializedDepartment[combineArray[n].index].fieldId =
                this.translate.instant('VAL.DUPLICATION_SPECIALIZED_DEPT');
            }
            this.checkDepartmentValid = false;
          }
        }
      }
    }
    return this.formErrors.specializedDepartment;
  }

  checkSpecializedDepartment(form, listTypeDisabled: any, listField, listType) {
    const departmentErrors = ['fieldId', 'typeId'];
    const listDepartment = <FormArray>form.get('specializedDepartment');
    const arr = listDepartment.value;
    if (listDepartment.value.length > 0) {
      for (let index = 0; index < arr.length; index++) {
        const specializedDepartment = listDepartment.value[index];
        for (let i = 0; i < departmentErrors.length; i++) {
          const value = departmentErrors[i];
          if (specializedDepartment[value].id !== this.specialtyArea.idDefault) {
            this.formErrors.specializedDepartment[index][value] = '';
            this.setBorderForDepartment(value, index, '#aaa');
          } else {
            this.checkDepartmentValid = false;
            if (listTypeDisabled[index] === false) {
              this.setBorderForDepartment(value, index, '#D21D29');
              this.formErrors.specializedDepartment[index][value] = this.validationMessage[value].required;
            } else {
              this.formErrors.specializedDepartment[index].fieldId = this.validationMessage.fieldId.required;
              this.formErrors.specializedDepartment[index].typeId = '';
              this.setBorderForDepartment('fieldId', index, '#D21D29');
            }
          }
        }
      }
    }
    return this.formErrors.specializedDepartment;
  }

  setBorderForDepartment(idDepartment: string, index: number, color: string) {
    $('#' + idDepartment + '_' + index).children().children('span:first').children('span').css('border', '1px solid ' + color);
  }

  /**
   * RE0020 translate validation messages
   */
  getValidationMessage() {
    this.translate.get('VAL').subscribe((res) => {
      this.validationMessage = {
        'loginId': {
          'required': res.LOGIN_ID.LENGTH,
          'maxlength': res.LOGIN_ID.LENGTH,
          'minlength': res.LOGIN_ID.LENGTH,
          'pattern': res.LOGIN_ID.NOT_MATCH_PATTERN
        },
        'mailAddress': {
          'maxlength': res.LENGHT_EMAIL,
          'pattern': res.ILLEGAL_FORMAT_EMAIL
        },
        'additionalMailAddress': {
          'required': res.REQUIRED_EMAIL,
          'maxlength': res.LENGHT_EMAIL,
          'pattern': res.ILLEGAL_FORMAT_EMAIL
        },
        'firstName': {
          'required': res.FIRST_NAME,
          'maxlength': res.FIRST_NAME,
        },
        'lastName': {
          'required': res.LAST_NAME,
          'maxlength': res.LAST_NAME,
        },
        'firstNameKana': {
          'required': res.FIRST_NAME_KANA,
          'maxlength': res.FIRST_NAME_KANA,
          'pattern': res.FIRST_NAME_KANA,
        },
        'lastNameKana': {
          'required': res.LAST_NAME_KANA,
          'maxlength': res.LAST_NAME_KANA,
          'pattern': res.LAST_NAME_KANA,
        },
        'mobileNo': {
          'maxlength': 'Invalid',
          'fixLength': res.PHONE_FIXLENGTH
        },
        'phsNo': {'maxlength': res.RE0020.ERROR_STAFF_EDIT.PHS_MAXLENGTH},
        'mailAddressPublishingType': {'required': 'Required'},
        'mobileNoPublishingType': {'required': 'Required'},
        'fieldId': {
          'required': res.SPEC_DEPT_FIELD_REQUIRED,
        },
        'typeId': {
          'required': res.SPEC_DEPT_TYPE_REQUIRED,
        }
      };
    });
  }

}
