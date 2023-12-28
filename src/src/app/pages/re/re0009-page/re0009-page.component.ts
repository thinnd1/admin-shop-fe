import {Component, HostListener, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {RegistrationService} from '../../../services/registration.service';
import {PrPasswordSettings} from '../../../models/re/pr-password-settings';
import {PasswordSettingsSendApi} from '../../../models/re/password-setting-send-api';
import {PrPasswordSettingsSaveResult} from '../../../models/re/pr-password-settings-save-result';
import {Re0009PageValidator} from './re0009-page.validator';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {Helper} from '../../../common/helper';

@Component({
  selector: 'app-re0009-page',
  templateUrl: './re0009-page.component.html',
  styleUrls: ['./re0009-page.component.scss'],
  providers: [Re0009PageValidator]
})
export class Re0009PageComponent implements OnInit {
  changePasswordForm: FormGroup;
  formMessagesError = new PrPasswordSettings('', '', '');
  model = new PrPasswordSettings('', '', '');

  constructor(private validation: Re0009PageValidator, private helper: Helper,
              private registration: RegistrationService, private dialog: DialogService) {
  }

  ngOnInit() {
    this.changePasswordForm = this.validation.createForm(this.model);
  }

  /*
  * call api put change password
  */
  putPrPasswordSettings() {
    setTimeout(() => {
      this.dialog.setLoaderVisible(true);
    });
    this.model = this.changePasswordForm.value;
    this.validation.checkValidate(this.changePasswordForm, this.formMessagesError);
    this.helper.gotoError();
    if (this.changePasswordForm.valid && !this.formMessagesError['newPasswordConfirm']) {
      const passwordObj = new PasswordSettingsSendApi(this.model.currentPassword, this.model.newPassword);
      this.registration.putPrPasswordSettings(passwordObj).subscribe((response: PrPasswordSettingsSaveResult) => {
        setTimeout(() => {
          this.dialog.setLoaderVisible(false);
        });
        this.dialog.showSuccess('MSG.SAVED').subscribe((result: DialogResult) => {
          if (result.isOk()) {
            this.changePasswordForm.reset();
          }
        });
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialog.setLoaderVisible(false);
        });
        if (error.contains('COMMON.SAVE_FAILED')) {
          this.formMessagesError['currentPassword'] = this.validation.messageValidationError['currentPassword']['passwordMatch'];
        } else {
          this.dialog.showError('MSG.SAVE_FAILED');
        }
      });
    } else {
      setTimeout(() => {
        this.dialog.setLoaderVisible(false);
      });
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putPrPasswordSettings();
  //   }
  // }
}
