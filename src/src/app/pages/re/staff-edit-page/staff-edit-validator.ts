import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {Helper} from '../../../common/helper';
import {SpecialtyAreaConverter} from "../../../common/converter/specialty-area.converter";

@Injectable()
export class StaffEditValidator {

  validationMessages: any = {};
  checkValidateSD: any;

  constructor(private translate: TranslateService,
              private formBuilder: FormBuilder,
              private helper: Helper,
              private validator: Validator,
              private specialtyArea: SpecialtyAreaConverter) { }

  staffEditForm() {
    return this.formBuilder.group({
      'firstName': [''],
      'lastName': [''],
      'firstNameKana': [''],
      'lastNameKana': [''],
      'gender': [''],
      'newPassword': [''],
      'confirmNewPass': [''],
      'mailAddressPublishingType': [''],
      'mobileNoPublishingType': [''],
      'department': this.formBuilder.group({
        'id': [''],
        'name': [''],
        'displayName': [''],
        'children': [],
        'path': ['']
      }),
      'graduationDate': [''],
      'mobileNo': [''],
      'phsNo': [''],
      'jobType': [''],
      specializedDepartment: this.formBuilder.array([])
    });
  }

  /**
   * RE0016 get data from api and validate form
   */
  formStaffEdit(model, gra_date) {
    return this.formBuilder.group({
      'firstName': [model.firstName, [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Helper.checkSpace)
      ]],
      'lastName': [model.lastName, [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Helper.checkSpace)
      ]],
      'firstNameKana': [model.firstNameKana, [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Helper.nameKanaRegex)
      ]],
      'lastNameKana': [model.lastNameKana, [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern(Helper.nameKanaRegex)
      ]],
      'gender': [model.gender],
      'newPassword': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Helper.passwordRegex)
      ]],
      'confirmNewPass': ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Helper.passwordRegex)
      ]],
      'mailAddressPublishingType': [model.mailAddressPublishingType],
      'mobileNoPublishingType': [model.mobileNoPublishingType],
      'department': this.formBuilder.group({
        'id': [model.department.id],
        'name': [model.department.name],
        'displayName': [''],
        'children': [],
        'path': ['']
      }),
      'graduationDate': [gra_date],
      'mobileNo': [model.mobileNo, Validators.compose([this.validator.validateTel(true)])],
      'phsNo': [model.phsNo, Validators.maxLength(6)],
      'jobType': [model.jobType],
      specializedDepartment: this.formBuilder.array([])
    });
  }

  /**
   * RE0016 check validate before submit
   */
  checkValidate(resetPassword, myForm, formErrors, model) {
    if (!myForm) {
      return false;
    }
    this.getErrorValidate();
    const form = myForm;
    this.checkValidateSD = true;
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        if (resetPassword) {
         this.checkSpecializedDepartment(form, field, formErrors);
        }else {
          if (field !== 'newPassword' && field !== 'confirmNewPass') {
            this.checkSpecializedDepartment(form, field, formErrors);
            this.checkDuplicationDept(myForm, model, formErrors);
          } else {
            formErrors[field] = '';
          }
        }
      }
    }
    if (resetPassword) {
      const newPasswords = form.get('newPassword');
      const confirmPassword = form.get('confirmNewPass');
      if (newPasswords.value !== confirmPassword.value  && !formErrors['confirmNewPass']) {
        formErrors['confirmNewPass'] = this.validationMessages['confirmNewPass']['passwordMatch'];
      }
    } else {
      formErrors['confirmNewPass'] = '';
    }

    return this.checkValidateSD;
  }

  checkSpecializedDepartment(form, field, formErrors) {
    const formErrorsSpecializedDepartment = ['fieldId', 'typeId'];
    if (field !== 'specializedDepartment') {
      formErrors[field] = this.validator.validateForm(form, field, this.validationMessages[field]);
    } else {
      const listSpecializedDepartment = <FormArray>form.get('specializedDepartment');
      if (listSpecializedDepartment.controls.length > 0) {
        for (let index = 0; index < listSpecializedDepartment.controls.length; index++) {

          const specializedDepartment = listSpecializedDepartment.controls[index].value;
          for (let i = 0; i < formErrorsSpecializedDepartment.length; i++) {
            const field1 = formErrorsSpecializedDepartment[i];

            if (specializedDepartment[field1].id !== this.specialtyArea.idDefault) {
              formErrors.specializedDepartment[index][field1] = '';
            } else {
              this.checkValidateSD = false;
              formErrors.specializedDepartment[index][field1] = this.validationMessages[field1].required;
            }
          }
        }
      }
    }
  }

  checkDuplicationDept(form, model, formErrors) {
    const modelArr = model.specializedDepartment;
    let listAllDepartment = new Array();
    listAllDepartment = listAllDepartment.concat(modelArr);
    const listDepartment = <FormArray>form.get('specializedDepartment').value;
    for (let i = 0; i < listDepartment.length; i++) {
      if (listDepartment[i].fieldId.id !== this.specialtyArea.idDefault && listDepartment[i].typeId.id !== this.specialtyArea.idDefault) {
        const dep = listAllDepartment.filter((item) => (item.fieldId === listDepartment[i].fieldId.id &&
          item.typeId === listDepartment[i].typeId.id));
        if (dep.length > 0) {
          this.checkValidateSD = false;
          formErrors.specializedDepartment[i].fieldId = this.translate.instant('VAL.DUPLICATION_SPECIALIZED_DEPT');
          formErrors.specializedDepartment[i].typeId =  '';
        } else {
          let item = {
            'fieldId': listDepartment[i].fieldId.id,
            'typeId': listDepartment[i].typeId.id
          }
          listAllDepartment.push(item);
        }
      }
    }
  }

  /**
   * RE0016 get error text to html
   */
  getErrorValidate() {
    this.translate.get(['RE0016', 'VAL', 'RE0023']).subscribe((res) => {
      this.validationMessages = {
        'firstName': {
          'required': res.VAL.FIRST_NAME,
          'maxlength': res.VAL.FIRST_NAME,
          'pattern': res.RE0016.ERROR_STAFF_EDIT.REGEX
        },
        'lastName': {
          'required': res.VAL.LAST_NAME,
          'maxlength': res.VAL.LAST_NAME,
          'pattern': res.RE0016.ERROR_STAFF_EDIT.REGEX
        },
        'firstNameKana': {
          'required': res.VAL.FIRST_NAME_KANA,
          'maxlength': res.VAL.FIRST_NAME_KANA,
          'pattern' : res.VAL.FIRST_NAME_KANA
        },
        'lastNameKana': {
          'required': res.VAL.LAST_NAME_KANA,
          'maxlength': res.VAL.LAST_NAME_KANA,
          'pattern' : res.VAL.LAST_NAME_KANA
        },
        'newPassword': {
          'required': res.VAL.ERROR_CHANGE_PASSWORD.NEW_PASSWORD_REQUIRED,
          'minlength': res.VAL.PASSWORD_FORMAT_ERROR_RE16,
          'maxlength': res.VAL.PASSWORD_FORMAT_ERROR_RE16,
          'pattern': res.VAL.PASSWORD_FORMAT_ERROR_RE16
        },
        'confirmNewPass': {
          'required': res.VAL.ERROR_CHANGE_PASSWORD.CONFIRM_PASSWORD_REQUIRED,
          'passwordMatch': res.VAL.PASSWORD_CONFIRM_MISMATCH
        },
        'phsNo': {
          'maxlength': res.RE0016.ERROR_STAFF_EDIT.PHS_MAXLENGTH
        },
        'mobileNo': {
          'maxlength': res.RE0016.ERROR_STAFF_EDIT.PHONE_MAXLENGTH,
          'fixLength': res.RE0016.ERROR_STAFF_EDIT.PHONE_FIXLENGTH
        },
        'fieldId': {
          'required': res.RE0023.RE0023_ERROR.SPECIALIZE_DEPARTMENT_REQUIRED
        },
        'typeId': {
          'required': res.RE0023.RE0023_ERROR.SPECIALIZE_DEPARTMENT
        },
      };
    });
  }
}
