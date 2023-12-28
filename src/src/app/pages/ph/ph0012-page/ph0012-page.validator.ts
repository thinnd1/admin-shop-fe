import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {TracingReport} from '../../../models/ph/tracing-report';

declare var moment: any;

@Injectable()
export class TracingReportValidator {
  formErrors = {
    'compoundingDate': '',
    'content': '',
    'departmentName': '',
    'doctorName': '',
    'medicalOfficeId': '',
    'patientCode': '',
    'patientConsent': false,
    'patientDateOfBirth': '',
    'patientName': '',
    'pharmacistName': '',
    'phoneNumber': '',
    'prescriptionIssuedDate': ''
  };
  model = new TracingReport();
  validationForm: any = {};
  validationMessages: any = {};
  form: FormGroup;

  constructor(private translate: TranslateService,
              private validator: Validator,
              private fb: FormBuilder) {
    this.getErrorValidate();
  }

  createForm(model: TracingReport) {
    return this.fb.group({
      'compoundingDate': [model.compoundingDate],
      'content': [model.content, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
      'departmentName': [model.departmentName, Validators.maxLength(32)],
      'doctorName': [model.doctorName,  Validators.maxLength(32)],
      'medicalOfficeId': [model.medicalOfficeId, [this.validator.validateAllSpace()]],
      'patientCode': [model.patientCode, Validators.maxLength(64)],
      'patientConsent': [model.patientConsent, [this.validator.validateAllSpace()]],
      'patientDateOfBirth': [model.patientDateOfBirth, [this.validator.validateAllSpace()]],
      'patientGender': [model.patientGender, [this.validator.validateAllSpace()]],
      'patientName': [model.patientName, Validators.maxLength(32)],
      'pharmacistName': [model.pharmacistName, Validators.maxLength(32)],
      'phoneNumber': [model.phoneNumber, [this.validator.validateAllSpace(), this.validator.validateTel(true)]],
      'prescriptionIssuedDate': [model.prescriptionIssuedDate, [this.validator.validateAllSpace()]],
      'firebaseStorageTopicPath':  [model.medicalOfficeId],
      'fileIds': [model.fileIds]
    });
  }

  checkValidate(myForm, formErrors) {
    if (!myForm) {
      return false;
    }
    this.model = myForm.value;
    this.getErrorValidate();
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        formErrors[field] = this.validator.validateForm(myForm, field, this.validationMessages[field]);
      }
    }
    if (this.validateDate()) {
      formErrors.compoundingDate = this.validationMessages.compoundingDate. dateBefore;
    }
  }

  validateDate() {
    if (this.model.compoundingDate !== null) {
      return !moment(this.model.compoundingDate).isSameOrAfter(moment(this.model.prescriptionIssuedDate), 'day');
    }
    return false;
  }

  getErrorValidate() {
    this.translate.get('PHARMACY.PH0012.VALIDATE').subscribe((res: any) => {
      this.validationForm = res;
      this.validationMessages = {
        'compoundingDate': {
          'dateBefore': this.validationForm.DATE
        },
        'content': {
          'maxlength': this.validationForm.CONTENT_LENGTH,
          'required': this.validationForm.CONTENT_REQUIRED
        },
        'departmentName': {
          'maxlength': this.validationForm.DEPARTMENT_LENGTH
        },
        'doctorName': {
          'maxlength': this.validationForm.DOCTOR_NAME_LENGTH
        },
        'medicalOfficeId': {
          'required': this.validationForm.HOSPITAL_REQUIRED
        },
        'patientCode': {
          'maxlength': this.validationForm.PATIENT_CODE_LENGTH,
        },
        'patientConsent': {
          'required': this.validationForm.PATIENT_CONSENT_REQUIRED
        },
        'patientDateOfBirth': {
          'required': this.validationForm.PATIENT_DATE_OF_BIRTH_REQUIRED
        },
        'patientName': {
          'maxlength': this.validationForm.PATIENT_NAME_LENGTH,
        },
        'pharmacistName': {
          'maxlength': this.validationForm.PHARMACIST_NAME_LENGTH,
        },
        'phoneNumber': {
          'required': this.validationForm.PHONE_NUMBER,
          'fixLength': this.validationForm.PHONE_FIXLENGTH
        },
        'prescriptionIssuedDate': {
          'required': this.validationForm.PRESCRIPTION_ISSUED_DATE_REQUIRED
        }
      };
    });
  }
}
