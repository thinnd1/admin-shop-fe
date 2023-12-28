import {Component, HostListener, OnInit} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {PasswordSettings} from '../../../models/re/password-settings';
import {FormGroup} from '@angular/forms';
import {PasswordSettingsSendApi} from '../../../models/re/password-setting-send-api';
import {Location} from '@angular/common';
import {PasswordPageValidator} from './password-page.validator';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {Helper} from '../../../common/helper';

declare const $: any;

@Component({
  selector: 'app-password-page',
  templateUrl: './password-page.component.html',
  styleUrls: ['./password-page.component.scss'],
  providers: [PasswordPageValidator]
})
export class PasswordPageComponent implements OnInit {
  changePassForm: FormGroup;
  formErrors = new PasswordSettings('', '', '');
  model = new PasswordSettings('', '', '');

  constructor(private passwordPageValidator: PasswordPageValidator, private registrationService: RegistrationService, private helper: Helper,
              private dialogService: DialogService, private location: Location) {
  }
  ngOnInit() {
    this.changePassForm = this.passwordPageValidator.createForm(this.model);
  }

  putPasswordSettings() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.model = this.changePassForm.value;
    this.passwordPageValidator.checkValidate(this.changePassForm, this.formErrors);
    this.helper.gotoError();
    if (this.changePassForm.valid && !this.formErrors['newPasswordConfirm']) {
      const password_change = new PasswordSettingsSendApi(this.model.currentPassword, this.model.newPassword);
      this.registrationService.putPasswordSettings(password_change).subscribe(
        (response: any) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showSuccess('MSG.SAVED').subscribe(
            (res: DialogResult) => {
              if (res.isOk() ) {
                const pass = new PasswordSettings('', '' , '');
                this.changePassForm.setValue(pass);
              }
            }
          );
        },
        (error: HttpError) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (error.contains('COMMON.SAVE_FAILED')) {
            this.formErrors['currentPassword'] = this.passwordPageValidator.messageValidationError['currentPassword']['passwordMatch'];
          } else {
            this.dialogService.showError('MSG.ERROR');
          }
        }
      );
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putPasswordSettings();
  //   }
  // }

}
