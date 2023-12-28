import {Component, HostListener, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrStaffInviteSettings } from '../../../models/re/pr-staff-invite-settings';
import {PrStaffInviteSettingsSaveResult} from '../../../models/re/pr-staff-invite-settings-save-result';
import {Helper} from '../../../common/helper';
import {Re0026Validator} from './re0026-validator';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';

@Component({
  selector: 'app-re0026-page',
  templateUrl: './re0026-page.component.html',
  styleUrls: ['./re0026-page.component.scss'],
  providers: [Re0026Validator]
})
export class Re0026PageComponent implements OnInit {

  arrayEmail: any;
  notHandle: boolean;
  data: any;
  myForm: FormGroup;
  checkValid = true;
  formErrors = {
    'medicalOfficeId': '',
    'mailAddress': []
  };
  response: any;

  public model = Array(new PrStaffInviteSettings());

  constructor(private registrationService: RegistrationService,
              private translate: TranslateService,
              private formBuilder: FormBuilder,
              private dialogService: DialogService,
              private helper: Helper,
              private re0026Validator: Re0026Validator) {
    this.myForm = this.formBuilder.group({
      'medicalOfficeId': ['', Validators.required],
      'mailAddress': this.formBuilder.array([])
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getPrStaffInviteSettings().subscribe((settings: PrStaffInviteSettings[]) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.model = settings;
      if (this.model.length < 1 || !this.model[0].id ) {
        this.notHandle = true;
      }else {
        this.notHandle = false;
      }
      this.createFormRE0026();
    },
    (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  createFormRE0026() {
    this.myForm = this.formBuilder.group({
      'medicalOfficeId': [this.model[0].id, Validators.required],
      'mailAddress': this.formBuilder.array([])
    });
    this.addEmail();
  }

  /**
   * RE0026 add new mail address
   */
  addEmail(mail?) {
    if (this.myForm.get('mailAddress').value && this.myForm.get('mailAddress').value.length < 10) {
      this.arrayEmail = <FormArray>this.myForm.controls['mailAddress'];
      let newEmail;
      if(mail){
         newEmail = this.formBuilder.control(mail, Validators.compose([Validators.required, Validators.pattern(Helper.emailRegex)]));
      }else{
        newEmail = this.formBuilder.control('', Validators.compose([Validators.required, Validators.pattern(Helper.emailRegex)]));
      }

      this.arrayEmail.push(newEmail);
      this.formErrors = {
        'medicalOfficeId': '',
        'mailAddress': ['']
      };
    } else {
      // do nothing...
    }
  }

  get formData() {
    return <FormArray>this.myForm.get('mailAddress');
  }

  /**
   * RE0026 remove email addresses
   */
  removeEmail(i: number) {
    const control = <FormArray>this.myForm.controls['mailAddress'];
    control.removeAt(i);
    this.formErrors = {
      'medicalOfficeId': '',
      'mailAddress': ['']
    };
  }

  deleteAllEmail() {
    let control = <FormArray>this.myForm.controls['mailAddress'];
    const length = control.controls.length;
    if (control.controls.length > 0) {
      for (let index = 0; index < length; index++) {
        control.removeAt(0);
      }
      this.formErrors = {
        'medicalOfficeId': '',
        'mailAddress': ['']
      }
    }
  }

  /**
   * RE0026 post staff invite setting API
   */
  postPrStaffInviteSettings() {
    this.checkValid = true;
    this.re0026Validator.checkValidate(this.myForm, this.formErrors);
    this.data = this.myForm.value;
    let officeName = '';
    if (this.model.length > 0) {
      for (let m = 0; m < this.model.length; m++) {
        if (this.model[m].id === this.myForm.get('medicalOfficeId').value) {
          officeName = this.model[m].name;
          break;
        }
      }
    }
    let mail = '';
    this.translate.get('RE0026').subscribe(msg => {
      mail = '<p>' + '「' + officeName + '」' + msg.E003_1_1 + '</p>' + msg.E003_1_2 + '<br>' + '<br>' ;
      const list = this.myForm.get('mailAddress').value;
      for (const i of list) {
        mail += i + '<br>';
      }
    });
    const listMail = this.myForm.get('mailAddress').value;
    let checkSameMail = -1;

    for (let i = 0; i < listMail.length; i++) {
      const listMails = listMail.filter(item => (item && item === listMail[i]));
      if (listMails.length > 1) {
        this.checkValid = false;
        checkSameMail = i;
        break;
      }
    }

    if (checkSameMail !== -1) {
      setTimeout(() => {
        this.dialogService.showMessage('error', false, 'RE0026.E003_3', null, listMail[checkSameMail], 'MSG.OK', null).subscribe(
          (res: DialogResult) => {
          }
        );
      }, 400);
    }
    this.helper.gotoError();
    if (this.myForm.valid && this.checkValid) {
      this.dialogService.showMessage('warning', false, null, null, mail, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              this.registrationService.postPrStaffInviteSettings(this.data).subscribe(
                (response: PrStaffInviteSettingsSaveResult) => {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(false);
                  });
                  this.response = response;
                  this.checkResponseApi(response);
                },
                (error: HttpError) => {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(false);
                  });
                  this.dialogService.showError('MSG.ERROR');
                }
              );
            }
          }, 400);
        }
      );
    }
  }

  checkResponseApi(result) {
    const changes = [];
    if (result.successList.length > 0) {
      changes.push('hasSuccess');
    }
    if (result.errorList.length > 0) {
      changes.push('hasFail');
    }
    this.showResponseDialog(changes);
  }

  showResponseDialog(changes) {
    if (changes && changes[0]) {
      const result = this.response;
      switch (changes[0]) {
        case 'hasSuccess':
          this.dialogService.showSuccess('MSG.SENT').subscribe((res: DialogResult) => {
            if (res.isOk()) {
              this.nextDialog(changes);
            }
          });
          break;
        case 'hasFail':
          let mail = '';
          const list = result.errorList;
          for (const i of list) {
            mail += i + '<br>';
          }
          this.dialogService.showMessage('error', true, 'RE0026.E003_2', null, mail, 'MSG.OK', null)
            .subscribe((res: DialogResult) => {
              if (res.isOk()) {
                this.deleteAllEmail();
                for (const j of list) {
                  this.addEmail(j);
                }
              }
            });
          break;
        default:
          this.nextDialog(changes);
      }
    } else {
      this.ngOnInit();
    }
  }

  nextDialog(changes) {
    changes.splice(0, 1);
    setTimeout(() => {
      this.showResponseDialog(changes);
    }, 200);
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.postPrStaffInviteSettings();
  //   }
  // }

}
