import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {ReportUpdateSetting} from '../../../models/ph/report-update-setting';

/**
 * Created by hienlt on 4/4/2018.
 */
@Injectable()
export class ReportUpdateValidator {
  formErrors = {
    medicalOfficeId: '',
    content: '',
    phoneNumber: '',
    prescriptionIssuedDate: '',
    patientName: '',
    patientCode: '',
    pharmacistName: '',
    doctorName: '',
    departmentName: '',
    hasFile: '',
    prescriptionUpdateDetails: [
      {beforeChangeDrugName: '', afterChangeDrugName: ''},
    ]
  };
  validationForm: any = {};
  validationMessages: any = {};
  form: FormGroup;
  checkValidateSD: any;

  constructor(private translate: TranslateService,
              private validator: Validator,
              private fb: FormBuilder) {
    this.getErrorValidate();
  }

  createForm(model: ReportUpdateSetting) {
    let form: FormGroup;
    form = this.fb.group({
      'medicalOfficeId': [model.medicalOfficeId, [this.validator.validateAllSpace()]],
      'content': [model.content, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
      'pharmacistName': [model.pharmacistName,  Validators.maxLength(32)],
      'phoneNumber': [model.phoneNumber, Validators.compose([this.validator.validateAllSpace(), this.validator.validateTel(true)])],
      'patientName': [model.patientName, Validators.maxLength(32)],
      'patientCode': [model.patientCode,  Validators.maxLength(64)],
      'prescriptionIssuedDate': [model.prescriptionIssuedDate, [this.validator.validateAllSpace()]],
      'doctorName': [model.doctorName, Validators.maxLength(32)],
      'departmentName': [model.departmentName, Validators.maxLength(32)],
      'protocolUsage': [model.protocolUsage],
      'prescriptionUpdateReason': [model.prescriptionUpdateReason],
      'prescriptionUpdateDetails': this.fb.array([
        this.fb.group({
          'beforeChangeDrugName': ['', [this.validator.validateAllSpace(),  Validators.maxLength(200)]],
          'afterChangeDrugName': ['', [this.validator.validateAllSpace(), Validators.maxLength(200)]],
          })
        ]),
      'firebaseStorageTopicPath':  [model.medicalOfficeId],
      'fileIds': [model.fileIds]
    });
    return form;
  }

  checkValidate(myForm, formErrors) {
    if (!myForm) {
      return false;
    }
    this.getErrorValidate();
    const form = myForm;
    this.checkValidateSD = true;
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        if (field === 'prescriptionUpdateDetails') {
          const listDrug = form.get(field);
          for (let i = 0; i < listDrug.controls.length; i++) {
            formErrors[field][i]['beforeChangeDrugName'] = this.validator.validateForm(listDrug.controls[i],
              'beforeChangeDrugName', this.validationMessages['beforeChangeDrugName']);
            formErrors[field][i]['afterChangeDrugName'] = this.validator.validateForm(listDrug.controls[i],
              'afterChangeDrugName', this.validationMessages['afterChangeDrugName']);
          }
        } else {
          formErrors[field] = this.validator.validateForm(form, field, this.validationMessages[field]);
        }

      }
    }
  }

  getErrorValidate() {
    this.translate.get('PH0015.VALIDATE').subscribe((res: any) => {
      this.validationForm = res;
      this.validationMessages = {
        'medicalOfficeId': {
        'required': this.validationForm.MEDICAL
      },
        'content': {
          'maxlength': this.validationForm.CONTENT_LENGTH,
          'required': this.validationForm.CONTENT_REQUIRED
        },
        'phoneNumber': {
          'required': this.validationForm.PHONE_NUMBER,
          'fixLength': this.validationForm.PHONE_FIXLENGTH
        },
        'prescriptionIssuedDate': {
          'required': this.validationForm.UPDATED
        },
        'beforeChangeDrugName': {
          'required': this.validationForm.DRUG_OLD,
          'maxlength': this.validationForm.MAX_LENGTH_BEFORE_CHANGE_DRUD
        },
        'afterChangeDrugName': {
          'required': this.validationForm.DRUG_NEW,
          'maxlength': this.validationForm.MAX_LENGTH_AFTER_CHANGE_DRUD
        },
        'patientCode': {
          'maxlength': this.validationForm.MAX_LENGTH_PATIENT_CODE
        },
        'patientName': {
          'maxlength': this.validationForm.MAX_LENGTH_PATIENT_NAME
        },
        'pharmacistName': {
          'maxlength': this.validationForm.MAX_LENGTH_PHARMACIST_NAME
        },
        'departmentName': {
          'maxlength': this.validationForm.MAX_LENGTH_DEPARTMENT_NAME
        },
        'doctorName': {
          'maxlength': this.validationForm.MAX_LENGTH_DOCTOR_NAME
        }
      };
    });
  }
}
