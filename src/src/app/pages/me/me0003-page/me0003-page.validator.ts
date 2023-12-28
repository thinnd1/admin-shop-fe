import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Helper} from '../../../common/helper';

declare const moment: any;

@Injectable()

export class Me0003PageValidator {

  me0003PageForm: FormGroup;
  formErrors = {
    dateStartVisit: '',
    dateEndVisit: '',
    timeStartVisit: '',
    timeEndVisit: '',
    visitor: '',
    visitorOffice: '',
    visitorNumber: '',
    purpose: '',
    place: '',
    note: ''
  };
  validationMessages: any = {};

  constructor(private fb: FormBuilder,
              private translate: TranslateService,
              private helper: Helper) {
  }

  createForm() {
    return this.fb.group({
      'dateStartVisit': ['', [Validators.required]],
      'timeStartVisit': ['', [Validators.required]],
      'dateEndVisit': [''],
      'timeEndVisit': ['', [Validators.required]],
      'visitor': ['', [Validators.required, Validators.maxLength(30)]],
      'visitorOffice': ['', [Validators.required, Validators.maxLength(30)]],
      'visitorNumber': ['', [Validators.required]],
      'purpose': ['', [Validators.required, Validators.maxLength(50)]],
      'place': ['', [Validators.required, Validators.maxLength(30)]],
      'note': ['', [Validators.maxLength(4000)]]
    });
  }

  checkSpaceBlank(form) {
    if (form) {
      if (form.value.visitor.trim() === '') {
        this.formErrors.visitor = this.validationMessages.visitor.required;
      }
      if (form.value.visitorOffice.trim() === '') {
        this.formErrors.visitorOffice = this.validationMessages.visitorOffice.required;
      }
      if (form.value.purpose.trim() === '') {
        this.formErrors.purpose = this.validationMessages.purpose.required;
      }
      if (form.value.place.trim() === '') {
        this.formErrors.place = this.validationMessages.place.required;
      }
    }
  }

  checkValidate(form) {
    let checkFormValid = true;

    if (!form) {
      return;
    } else {
      this.getErrorValidate();
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          this.formErrors[field] = '';
          const control = form.get(field);
          if (field !== 'dateStartVisit' && field !== 'timeStartVisit' && field !== 'timeEndVisit') {
            if (control && !control.valid) {
              for (const key in control.errors) {
                if (control.errors.hasOwnProperty(key)) {
                  this.formErrors[field] = this.validationMessages[field][key];
                  checkFormValid = false;
                }
              }
            }
          } else {
            const dateStartVisit = form.get('dateStartVisit').value;
            const dateEndVisit = form.get('dateEndVisit').value ? form.get('dateEndVisit').value : dateStartVisit;
            const timeStartVisit = form.get('timeStartVisit').value;
            const timeEndVisit = form.get('timeEndVisit').value;
            if (dateStartVisit === '' || timeStartVisit === '' || timeEndVisit === '') {
              if (form.get(field).value === '') {
                this.formErrors[field] = this.validationMessages['dateStartVisit'].required;
              }
            } else {
              if (moment(dateStartVisit).isAfter(moment(dateEndVisit), 'day')) {
                this.formErrors[field] = this.validationMessages['dateStartVisit'].compare;
                this.formErrors['dateEndVisit'] = this.validationMessages['dateStartVisit'].compare;
              } else {
                if (moment(dateStartVisit).isSame(moment(dateEndVisit), 'day')) {
                  if (timeStartVisit >= timeEndVisit) {
                    this.formErrors['timeStartVisit'] = this.validationMessages['timeStartVisit'].compare;
                    this.formErrors['timeEndVisit'] = this.validationMessages['timeStartVisit'].compare;
                  }
                }
              }
            }
          }
        }
      }
      return {formErrors: this.formErrors, checkFormValid: checkFormValid};
    }
  }

  getErrorValidate() {
    this.translate.get('ME0003.VALIDATE').subscribe((res) => {
      this.validationMessages = {
        'dateStartVisit': {
          'required': res.REQUIRED,
          'compare': res.DATE_COMPARE
        },
        'timeStartVisit': {
          'required': res.REQUIRED,
          'maxlength': res.REQUIRED,
          'pattern': res.REQUIRED,
          'compare': res.TIME_COMPARE
        },
        'dateEndVisit': {
          'required': res.REQUIRED,
          'maxlength': res.REQUIRED,
          'pattern': res.REQUIRED
        },
        'timeEndVisit': {
          'required': res.REQUIRED,
          'maxlength': res.REQUIRED,
          'pattern': res.REQUIRED
        },
        'visitor': {
          'required': res.REQUIRED,
          'maxlength': res.VISITOR_LENGTH,
          'pattern': res.REQUIRED
        },
        'visitorOffice': {
          'required': res.REQUIRED,
          'maxlength': res.COMPANY_LENGTH,
          'pattern': res.REQUIRED
        },
        'visitorNumber': {
          'required': res.REQUIRED
        },
        'purpose': {
          'required': res.REQUIRED,
          'maxlength': res.PURPOSE_LENGTH,
          'pattern': res.REQUIRED
        },
        'place': {
          'required': res.REQUIRED,
          'maxlength': res.PLACE_LENGTH,
          'pattern': res.REQUIRED
        },
        'note': {
          'maxlength': res.NOTE_LENGTH
        }
      };
    });
  }
}
