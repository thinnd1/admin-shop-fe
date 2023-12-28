import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import {FormGroup, Validators, FormBuilder, FormArray} from '@angular/forms';
import { Helper } from '../../../common/helper';
import { Validator } from '../../../common/validation/validator';
@Injectable()

export class Re0006PageValidator {

  re0006PageForm: FormGroup;
  formErrors = {
    'medicalOfficeId': '',
    'officeName': '',
    'addressRegionOffice': '',
    'branchAddress': '',
    'branchDepartment': '',
    'branchPhoneNo': '',
    'mobileNo': '',
    'industryType': '',
    'firstName': '',
    'lastName': '',
    'firstNameKana': '',
    'lastNameKana': '',
    'gender': '',
    'birthDayYear': '',
    'birthDayMonth': '',
    'birthDayDay': '',
    'password': '',
    'confirmPassword': '',
    'mailAddress': '',
    'handleFields': [],
    'confirmEmail': '',
    'experiences': '',
    'placeBornIn': '',
    'hobby': '',
    'message': '',
    'imageByteSize': '',
    'imageByte': [],
    'identificationImageByteSize': '',
    'identificationImageByte': [],
    'access': ''
  };
  vaidationForm: any = {};
  validationMessages: any = {};
  errorBranch: string;
  errorBranchAddress: string;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private helper: Helper,
    private validator: Validator,
  ) {
    this.createForm();
  }

  createForm() {
    this.re0006PageForm = this.fb.group({
      'medicalOfficeId': ['1', [Validators.required]],
      'officeName': ['', [Validators.required, Validators.maxLength(255)]],
      'addressRegionOffice': ['', [Validators.required]],
      'branchAddress': ['', [Validators.required, Validators.maxLength(255)]],
      'branchDepartment': ['', [Validators.required, Validators.maxLength(255)]],
      'branchPhoneNo': ['', Validators.compose([Validators.required, this.validator.validateTel(false)])],
      'mobileNo': ['', Validators.compose([Validators.required, this.validator.validateTel(true)])],
      'industryType': ['', [Validators.required]],
      'firstName': ['', [Validators.required, Validators.maxLength(8)]],
      'lastName': ['', [Validators.required, Validators.maxLength(8)]],
      'firstNameKana': ['', [Validators.required, Validators.maxLength(8), Validators.pattern(Helper.nameKanaRegex)]],
      'lastNameKana': ['', [Validators.required, Validators.maxLength(8), Validators.pattern(Helper.nameKanaRegex)]],
      'gender': ['0'],
      'birthDayYear': ['', [Validators.required]],
      'birthDayMonth': ['', [Validators.required]],
      'birthDayDay': ['', [Validators.required]],
      'password': ['', [Validators.required, Validators.minLength(6),
      Validators.maxLength(16), Validators.pattern(Helper.passwordRegex)]],
      'confirmPassword': ['', [Validators.required, Validators.minLength(6),
      Validators.maxLength(16), Validators.pattern(Helper.passwordRegex)]],
      'mailAddress': ['', [Validators.required, Validators.maxLength(64), Validators.pattern(Validator.emailRegex)]],
      'confirmEmail': ['', [Validators.required, Validators.maxLength(64), Validators.pattern(Validator.emailRegex)]],
      'experiences': ['',[Validators.required]],
      'pharmacyGraduation': [true],
      'handleFields': this.fb.array([]),
      'placeBornIn': [''],
      'hobby': [''],
      'message': [''],
      'imageByteSize': [0, [Validators.required, Validators.min(1), Validators.max(10 * 1024 * 1024)]],
      'imageByte': [[]],
      'identificationImageByteSize': [0, [Validators.required, Validators.min(1), Validators.max(10 * 1024 * 1024)]],
      'identificationImageByte': [[]],
      'identificationFileName': '',
      'access': [false, Validators.requiredTrue]
    });
  }

  checkLength(event, filed, maxLength) {
    const length = event.target.value.length;
    if (length > maxLength) {
      this.re0006PageForm.controls[filed].setValue(event.target.value.slice(0, maxLength));
    }
  }

  checkSpaceBlank(form) {
    if (form.value.officeName.trim() === '') {
      this.formErrors.officeName = this.validationMessages.officeName.required;
    }
    if (form.value.branchAddress.trim() === '') {
      this.formErrors.branchAddress = this.validationMessages.branchAddress.required;
    }
    if (form.value.branchDepartment.trim() === '') {
      this.formErrors.branchDepartment = this.validationMessages.branchDepartment.required;
    }
    if (form.value.firstName.trim() === '') {
      this.formErrors.firstName = this.validationMessages.firstName.required;
    }
    if (form.value.lastName.trim() === '') {
      this.formErrors.lastName = this.validationMessages.lastName.required;
    }
  }

  checkValidate() {
    if (!this.re0006PageForm) {
      return false;
    }
    this.getErrorValidate();
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field) && field !== 'handleFields') {
        this.formErrors[field] = this.helper.validateForm(this.re0006PageForm, field, this.validationMessages[field]);
      }
    }
    this.checkPatternForm('password', 'confirmPassword');
    this.checkPatternForm('mailAddress', 'confirmEmail');
    this.arrayValidate('handleFields', 'fieldId');
  }

  checkPatternForm(pattern1, pattern2) {
    const valuePattern1 = this.re0006PageForm.get(pattern1);
    const valuePattern2 = this.re0006PageForm.get(pattern2);
    if (valuePattern1.value !== valuePattern2.value && valuePattern2.value) {
      this.formErrors[pattern2] = this.validationMessages[pattern2]['match'];
    }
  }

  arrayValidate(field, name) {
    const form = this.re0006PageForm;
    if (!form) {
      return;
    } else {
      this.getErrorValidate();
      const list = <FormArray>form.get(field);
      if (list.controls.length > 0) {
        for (let i = 0; i < list.controls.length; i++) {
          const control = list.controls[i].get(name);
          const mess = this.validationMessages[field];
          if (control && !control.valid) {
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field][i] = mess[key];
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

  checkValidateBranch() {
    if (this.formErrors.officeName || this.formErrors.addressRegionOffice || this.formErrors.branchAddress ||
      this.formErrors.branchDepartment) {
      return this.errorBranch = this.validationMessages.medicalOfficeId.required;
    } else {
      this.errorBranch = '';
    }
  }

  checkValidateBranchAddress() {
    if (this.formErrors.branchAddress || this.formErrors.addressRegionOffice) {
      return this.errorBranchAddress = this.validationMessages.branchAddress.required;
    } else {
      this.errorBranchAddress = '';
    }
  }

  getErrorValidate() {
    this.translate.get(['RE0006.VALIDATE', 'VAL']).subscribe((res) => {
      this.vaidationForm = res['RE0006.VALIDATE'];
      this.validationMessages = {
        'access': {
          'required': this.vaidationForm.ACCESS
        },
        'medicalOfficeId': {
          'required': this.vaidationForm.MEDICAL_OFFICE
        },
        'officeName': {
          'required': this.vaidationForm.OFFICE_NAME,
          'maxlength': this.vaidationForm.OFFICE_NAME_MAX_LENGTH
        },
        'addressRegionOffice': {
          'required': this.vaidationForm.OFFICE_ADDRESS
        },
        'branchAddress': {
          'required': this.vaidationForm.OFFICE_ADDRESS,
          'maxlength': this.vaidationForm.OFFICE_ADDRESS_MAX_LENGTH,
          'pattern': this.vaidationForm.OFFICE_ADDRESS
        },
        'branchDepartment': {
          'required': this.vaidationForm.OFFICE_DEPARTMENT,
          'maxlength': this.vaidationForm.OFFICE_DEPARTMENT_MAX_LENGTH,
          'pattern': this.vaidationForm.OFFICE_DEPARTMENT
        },
        'branchPhoneNo': {
          'required': this.vaidationForm.OFFICE_PHONE,
          'pattern': this.vaidationForm.OFFICE_PHONE,
          'fixLength': res.VAL.PHONE_FIXLENGTH
        },
        'mobileNo': {
          'required': this.vaidationForm.OFFICE_MOBILE,
          'pattern': this.vaidationForm.OFFICE_MOBILE,
          'fixLength': res.VAL.PHONE_FIXLENGTH
        },
        'industryType': {
          'required': this.vaidationForm.INDUSTRY_TYPE
        },
        'firstName': {
          'required': this.vaidationForm.FIRST_NAME,
          'maxlength': this.vaidationForm.FIRST_NAME,
          'pattern': this.vaidationForm.FIRST_NAME
        },
        'lastName': {
          'required': this.vaidationForm.LAST_NAME,
          'maxlength': this.vaidationForm.LAST_NAME,
          'pattern': this.vaidationForm.LAST_NAME
        },
        'firstNameKana': {
          'required': this.vaidationForm.FIRST_NAME_KANA,
          'maxlength': this.vaidationForm.FIRST_NAME_KANA,
          'pattern': this.vaidationForm.FIRST_NAME_KANA
        },
        'lastNameKana': {
          'required': this.vaidationForm.LAST_NAME_KANA,
          'maxlength': this.vaidationForm.LAST_NAME_KANA,
          'pattern': this.vaidationForm.LAST_NAME_KANA
        },
        'birthDayYear': {
          'required': this.vaidationForm.BIRTHDAY
        },
        'birthDayMonth': {
          'required': this.vaidationForm.BIRTHDAY
        },
        'birthDayDay': {
          'required': this.vaidationForm.BIRTHDAY
        },
        'password': {
          'required': this.vaidationForm.PASSWORD_TEXT,
          'minlength': this.vaidationForm.PASSWORD_TEXT,
          'maxlength': this.vaidationForm.PASSWORD_TEXT,
          'pattern': this.vaidationForm.PASSWORD_TEXT
        },
        'confirmPassword': {
          'required': this.vaidationForm.PASSWORD_TEXT,
          'match': this.vaidationForm.PASSWORD_CONFIRM_MISMATCH,
          'pattern': this.vaidationForm.PASSWORD_TEXT,
          'maxlength': this.vaidationForm.PASSWORD_TEXT
        },
        'mailAddress': {
          'required': this.vaidationForm.EMAIL_REQUIRED,
          'pattern': this.vaidationForm.EMAIL_INCORRECT_FORMAT,
          'maxlength': this.vaidationForm.EMAIL_INCORRECT_FORMAT
        },
        'confirmEmail': {
          'required': this.vaidationForm.EMAIL_REQUIRED,
          'pattern': this.vaidationForm.EMAIL_INCORRECT_FORMAT,
          'match': this.vaidationForm.EMAIL_NOT_MATCH,
          'maxlength': this.vaidationForm.EMAIL_INCORRECT_FORMAT
        },
        'experiences': {
          'required': this.vaidationForm.EXPERIENCE
        },
        'handleFields': {
          'required': this.vaidationForm.DEPARTMENT,
          'duplicate': res.VAL.DUPLICATION_SPECIALIZED_DEPT
        },
        'imageByteSize': {
          'required': this.vaidationForm.IMAGE_URL,
          'max': 'over 10Mb',
          'min': this.vaidationForm.IMAGE_URL
        },
        'identificationImageByteSize': {
          'required': this.vaidationForm.IDENTIFICATION_IMAGE_URL,
          'max': 'over 10Mb',
          'min': this.vaidationForm.IDENTIFICATION_IMAGE_URL
        }
      };
    });
  }
}
