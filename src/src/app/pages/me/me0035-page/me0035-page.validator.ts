import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Helper} from '../../../common/helper';
import {Validator} from '../../../common/validation/validator';

@Injectable()
export class Me0035PageValidator {
  public validationMessages: any;
  constructor(private translate: TranslateService, private fb: FormBuilder, private helper: Helper, private validator: Validator) {
    this.getErrorValidate();
  }

  createFormInputDrug() {
    let form: FormGroup;
    form = this.fb.group({
      'officeName': ['', [Validators.required, Validators.maxLength(255)]],
      'firstName': ['', [Validators.required, Validators.maxLength(8)]],
      'lastName': ['', [Validators.required, Validators.maxLength(8)]],
      'mailAddress': ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64),
        Validators.pattern(Validator.emailRegex)]],
      'phoneNumber': ['', Validators.compose([this.validator.validateTel(true)])],
      'drugs': this.fb.array([
        this.fb.group({
          'drugName': ['', [Validators.required]],
          'drugCode': ['', [Validators.maxLength(12), Validators.pattern(Validator.drugCodeRegex)]],
        })
      ]),
    });
    return form;
  }

  addDrug() {
    let form: FormGroup;
    form = this.fb.group({
      'drugName': ['', [Validators.required]],
      'drugCode': ['', [Validators.maxLength(12), Validators.pattern(Validator.drugCodeRegex)]],
    });
    return form;
  }

  checkValidate(errorInputDrug: any, modelInputDrug: FormGroup) {
    for (const field in errorInputDrug) {
      if (errorInputDrug.hasOwnProperty(field)) {
        if (field !== 'drugs') {
          const control = modelInputDrug.get(field);
          const validationMessages = this.validationMessages[field];
          errorInputDrug[field] = '';
          if (control && !control.valid) {
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                errorInputDrug[field] = validationMessages[key];
              }
            }
          }
        } else {
          const listDrug = modelInputDrug.get('drugs') as FormArray;
          if (listDrug.controls.length > 0) {
            const drugCodeList = {};
            for (let index = 0; index < listDrug.controls.length; index++) {
              const drugCode = listDrug.controls[index].get('drugCode').value;
              for (const f in errorInputDrug.drugs[index]) {
                if (errorInputDrug.drugs[index].hasOwnProperty(f)) {
                  errorInputDrug.drugs[index][f] = this.validator.validateForm(<FormGroup>listDrug.controls[index], f,
                    this.validationMessages.drugs[f]);
                }
              }
              if (drugCodeList.hasOwnProperty(drugCode) && drugCode !== '') {
                errorInputDrug.drugs[index]['drugCode'] = this.validationMessages.drugs['drugCode']['duplicate'];
                errorInputDrug.isError = true;
              }
              drugCodeList[drugCode] = 1;
            }
          }
        }
      }
    }
    return errorInputDrug;
  }

  getErrorValidate() {
    this.translate.get('ME0035.VALIDATE').subscribe((res: any) => {
      this.validationMessages = {
        'firstName': {
          'required': res.FIRST_NAME_REQUIRED,
          'maxlength': res.FIRST_NAME
        },
        'lastName': {
          'required': res.LAST_NAME_REQUIRED,
          'maxlength': res.LAST_NAME
        },
        'mailAddress': {
          'required': res.EMAIL_REQUIRED,
          'minlength': res.EMAIL_INVALID,
          'maxlength': res.EMAIL_INVALID,
          'pattern': res.EMAIL_INVALID
        },
        'officeName': {
          'required': res.MEDICAL_OFFICE,
          'maxlength': res.MEDICAL_OFFICE_MAX
        },
        'phoneNumber': {
          'maxlength': res.FIRST_NAME,
          'fixLength' : res.PHONE_INVALID
        },
        'drugs': {
          'drugName': {
            'required': res.NAME_PRODUCT,
            'maxlength': 'max length'
          },
          'drugCode': {
            'duplicate': res.DUPLICATE_CODE,
            'maxlength': res.CODE_PRODUCT,
            'pattern': res.CODE_PRODUCT
          }
        }
      };
    });
  }
}
