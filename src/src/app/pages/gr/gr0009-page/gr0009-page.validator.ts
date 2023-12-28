import {Injectable} from '@angular/core';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
declare const moment: any;

@Injectable()
export class CreatePollSurveyValidator {
  validationMessages: any;
  checkValidForm = true;
  checkValidArray = true;
  formErrors = {
    contents: '',
    singleChoiceFlag: null,
    choices: [],
    closeDate: '',
    closeTime: ''
  };

  constructor(private translate: TranslateService, private fb: FormBuilder) {
  }

  createForm() {
    return this.fb.group({
      'contents': ['', Validators.compose([Validators.required, Validators.maxLength(3000)])],
      'singleChoiceFlag': [null, Validators.required],
      'choices': this.fb.array([]),
      'closeDate': [''],
      'closeTime': ['']
    });
  }

  checkValidate(form, formErrors) {
    this.checkValidForm = true;
    this.checkValidArray = true;
    const currentDate = moment().format('YYYY/MM/DD');
    const currentTime = moment().format('HH:mm');
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      for (const field in formErrors) {
        if (field === 'choices') {
          this.arrayValidate(form, 'choices', formErrors);
        } else {
          formErrors[field] = '';
          if (field !== 'closeDate' && field !== 'closeTime') {
            const control = form.get(field);
            if (control && (control.invalid || (control.value && control.value.trim() === ''))) {
              const mess = this.validationMessages[field];
              if (control.value && control.value.trim() === '') {
                formErrors[field] = this.validationMessages[field].required;
                this.checkValidForm = false;
              }
              for (const key in control.errors) {
                if (control.errors.hasOwnProperty(key)) {
                  formErrors[field] = mess[key];
                  this.checkValidForm = false;
                }
              }
            }
          } else {
            const selectedDate = form.get('closeDate').value;
            const selectedTime = form.get('closeTime').value;
            if (selectedTime === '') {
              formErrors['closeTime'] = this.validationMessages['closeTime'].required;
              this.checkValidForm = false;
            } else if (!moment(selectedDate).isSameOrAfter(currentDate)) {
              formErrors['closeDate'] = this.validationMessages['closeDate'].pattern;
              this.checkValidForm = false;
            } else if (moment(selectedDate).isSame(currentDate) && selectedTime < currentTime) {
                formErrors['closeTime'] = this.validationMessages['closeTime'].pattern;
                this.checkValidForm = false;
            }
          }
        }
      }
      return {formErrors: formErrors, checkValidForm: this.checkValidForm, checkValidArray: this.checkValidArray};
    }
  }

  arrayValidate(form, field, formError) {
    if (!form) {
      return;
    } else {
      this.getValidationMessage();
      const list = <FormArray>form.get(field);
      for (let i = 0; i < list.controls.length; i++) {
        const control = list.controls[i];
        const mess = this.validationMessages[field];
        if (control && (control.invalid || control.value.trim() === '')) {
          if (control.value.trim() === '') {
            formError[field][i] = this.validationMessages[field].required;
            this.checkValidForm = false;
          }
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              formError[field][i] = mess[key];
              this.checkValidArray = false;
            }
          }
        } else {
          formError[field][i] = '';
        }
      }
      return formError[field];
    }
  }


  getValidationMessage() {
    this.translate.get('GR0009.GR0009_VALIDATION').subscribe((res) => {
      this.validationMessages = {
        'contents': {
          'required': res.CONTENTS.REQUIRED,
          'maxlength': res.CONTENTS.RANGE
        },
        'singleChoiceFlag': {
          'required': res.NON_SELECTED
        },
        'choices': {
          'required': res.CHOICES.REQUIRED,
          'maxlength': res.CHOICES.RANGE
        },
        'closeDate': {
          'required': res.DATE_REQUIRED,
          'pattern': res.CLOSE_DATE.WRONG_FORMAT
        },
        'closeTime': {
          'required': res.TIME_REQUIRED,
          'pattern': res.CLOSE_TIME.WRONG_FORMAT
        }
      };
    });
  }

}
