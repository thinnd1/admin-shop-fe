import {Injectable} from '@angular/core';
import {Validator} from '../../../common/validation/validator';
import {TranslateService} from '@ngx-translate/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IndividualVerificationRequestSettings} from '../../../models/re/re0034-individual-verification-request-settings';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {LocalStorage} from '../../../services/local-storage.service';
import {Helper} from '../../../common/helper';

@Injectable()
export class VerificationValidator {
  formErrors = {
    'firstName': '',
    'firstNameKana': '',
    'lastName': '',
    'lastNameKana': '',
    'gender': '',
    'dayBirth': '',
    'monthBirth': '',
    'yearBirth': '',
    'jobType': '',
    'specializedDepartmentField': '',
    'specializedDepartmentType': '',
    'loginId': '',
    'password': '',
    'passwordConfirm': '',
    'specializedDepartment': []
  };
  validationMessage: any;
  validationMessages: any = {};
  checkValidateSD: any;

  constructor(private fb: FormBuilder,
              private translate: TranslateService,
              private validator: Validator,
              private specialtyArea: SpecialtyAreaConverter,
              private formBuilder: FormBuilder,
              private localStorage: LocalStorage) {
  }

  createFromVerification(model: IndividualVerificationRequestSettings) {
    let verificationForm: FormGroup;
    this.getErrorValidate();
    this.translate.get('ERROR_CHANGE_PASSWORD').subscribe(res => {
    });
    verificationForm = this.fb.group({
      'password': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Validator.passwordRegex)]
      ],
      'passwordConfirm': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Validator.passwordRegex)]
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
      'firstName': [(model.firstName) ? model.firstName : '※', [
        Validators.required,
        Validators.maxLength(8)]
      ],
      'firstNameKana': [(model.firstNameKana) ? model.firstNameKana : '※', [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Validator.nameKanaRegex)]
      ],
      'lastName': [(model.lastName) ? model.lastName : '※', [
        Validators.required,
        Validators.maxLength(8)]
      ],
      'lastNameKana': [(model.lastNameKana) ? model.lastNameKana : '※', [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Validator.nameKanaRegex)]
      ],
      'jobType': [model.jobType],
      'loginId': [model.loginId, [
        Validators.required,
        Validators.pattern(Helper.emailRegex)]],
      'specializedDepartmentField': [model.specializedDepartmentField],
      'specializedDepartmentType': [model.specializedDepartmentType],
      specializedDepartment: this.formBuilder.array([])
    });
    return verificationForm;
  }

  /**
   * RE0034 check validate before submit
   */
  checkValidate(myForm, formErrors) {
    if (!myForm) {
      return false;
    }
    this.getErrorValidate();
    const form = myForm;
    this.checkValidateSD = true;

    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        formErrors[field] = this.validator.validateForm(form, field, this.validationMessages[field]);
      }
    }

    // set validate password
    const newPasswors = form.get('password');
    const confirmPassword = form.get('passwordConfirm');
    if (newPasswors.value !== confirmPassword.value && confirmPassword.value) {
      formErrors['passwordConfirm'] = this.validationMessages['passwordConfirm']['passwordMatch'];
      this.checkValidateSD = false;
    }
    const jobType = form.get('jobType').value;
    if (jobType === 'J0001') {
      if (form.controls.specializedDepartmentField && form.controls.specializedDepartmentType) {
        const field = form.get('specializedDepartmentField').value;
        const type = form.get('specializedDepartmentType').value;
        if (!field || field.id === this.specialtyArea.idDefault || field === null || field === this.specialtyArea.idDefault) {
          this.setBorderForDepartment('Fields', '#D21D29');
          formErrors['specializedDepartmentField'] = this.validationMessages['specializedDepartmentField'].required;
          this.checkValidateSD = false;
        } else {
          this.setBorderForDepartment('Fields', 'rgba(0, 0, 0, 0.15)');
        }

        if ((!type || type.id === this.specialtyArea.idDefault || type === null || type === this.specialtyArea.idDefault) && (field && field.id !== this.specialtyArea.idDefault && field !== null && field !== this.specialtyArea.idDefault)) {
          this.setBorderForDepartment('Types', '#D21D29');
          formErrors['specializedDepartmentType'] = this.validationMessages['specializedDepartmentType'].required;
          this.checkValidateSD = false;
        } else {
          this.setBorderForDepartment('Types', 'rgba(0, 0, 0, 0.15)');
          formErrors['specializedDepartmentType'] = '';
        }
      }
    }
    return {'formErrors': formErrors, 'checkValid': this.checkValidateSD};
  }

  setBorderForDepartment(idDepartment: string, color: string) {
    $('#' + idDepartment).children().children('span:first').children('span').css('border', '1px solid ' + color);
  }

  getErrorValidate() {
    this.translate.get(['RE0034', 'VAL']).subscribe((res: any) => {
      this.validationMessages = {
        'firstName': {
          'required': res.VAL.FIRST_NAME,
          'maxlength': res.VAL.FIRST_NAME,
          'pattern': res.RE0034.RE0034_ERROR.REGEX
        },
        'lastName': {
          'required': res.VAL.LAST_NAME,
          'maxlength': res.VAL.LAST_NAME,
          'pattern': res.RE0034.RE0034_ERROR.REGEX
        },
        'firstNameKana': {
          'required': res.RE0034.RE0034_ERROR.FIRST_NAME_KANA,
          'maxlength': res.RE0034.RE0034_ERROR.FIRST_NAME_KANA,
          'pattern': res.VAL.FIRST_NAME_KANA
        },
        'lastNameKana': {
          'required': res.RE0034.RE0034_ERROR.LAST_NAME_KANA,
          'maxlength': res.RE0034.RE0034_ERROR.LAST_NAME_KANA,
          'pattern': res.VAL.LAST_NAME_KANA
        },
        'password': {
          'required': res.RE0034.RE0034_ERROR.PASSWORD_REQUIRED,
          'minlength': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR,
          'maxlength': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR,
          'pattern': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR
        },
        'passwordConfirm': {
          'required': res.RE0034.RE0034_ERROR.CONFIRM_PASSWORD_REQUIRED,
          'minlength': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR,
          'maxlength': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR,
          'pattern': res.RE0034.RE0034_ERROR.PASSWORD_FORMAT_ERROR,
          'passwordMatch': res.VAL.PASSWORD_CONFIRM_MISMATCH,
        },
        'yearBirth': {
          'required': res.RE0034.RE0034_ERROR.DATE_BIRTH_REQUIRED
        },
        'monthBirth': {
          'required': res.RE0034.RE0034_ERROR.DATE_BIRTH_REQUIRED
        },
        'dayBirth': {
          'required': res.RE0034.RE0034_ERROR.DATE_BIRTH_REQUIRED
        },
        'specializedDepartmentField': {
          'required': res.RE0034.RE0034_ERROR.SPECIALIZE_DEPARTMENT_REQUIRED
        },
        'specializedDepartmentType': {
          'required': res.RE0034.RE0034_ERROR.SPECIALIZE_DEPARTMENT
        },
        'loginId': {
          'required': res.RE0034.RE0034_ERROR.LOGINID_REQUIRED,
          'pattern': res.VAL.ILLEGAL_FORMAT_EMAIL,
          'loginIdMatch': res.RE0034.RE0034_ERROR.LOGINID_MATCH
        }
      };
    });
  }
}

