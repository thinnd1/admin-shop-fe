import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {Helper, TypeLogin} from '../../../common/helper';
import {FormGroup} from '@angular/forms';
import {Re0013PageValidator} from './re0013-page.validator';
import {RegistrationService} from '../../../services/registration.service';
import {NGXLogger} from 'ngx-logger';
import {environment} from '../../../../environments/environment';
import {HttpError} from '../../../common/error/http.error';
import { LoginReloader } from '../re0022-page/re0022-page.component';

declare const $: any;

@Component({
  selector: 'app-re0013-page',
  templateUrl: './re0013-page.component.html',
  styleUrls: ['./re0013-page.component.scss'],
  providers: [Re0013PageValidator]
})
export class Re0013PageComponent implements OnInit {
  public _loginId = "";
  public _password = "";
  public _showPassword = false;
  public _saveLogin = false;
  public _showError = false;

  public TypeLogin: typeof TypeLogin = TypeLogin;

  public loginIdError: boolean = null;

  public typeLogin = TypeLogin.LOGIN;
  public formForgotPassword: FormGroup;
  public errorForgotPassword = {
    mailAddressVal: '',
    mailAddressConfirmVal: ''
  };
  public options_graduation_year = [];
  public options_graduation_text = [];
  public monthYears = [];
  public dayOfMonths = [];

  public formResetPassword: FormGroup;
  public errorResetPassword = {
    newPassword: '',
    newPasswordConfirm: '',
    yearBirth: '',
    monthBirth: '',
    dayBirth: ''
  };
  public tokenResetPassword;
  public tokenEmail;
  public msgRe0013;
  public mailAddressForgot: any;
  public mailAddressForgotConfirm: any;

  private _loginReloader = new LoginReloader();

  constructor(private router: Router,
              private translate: TranslateService,
              private dialogService: DialogService,
              private shared: SharedValueService,
              private authenticationService: AuthenticationService,
              private helper: Helper,
              private re0013PageValidator: Re0013PageValidator,
              private registrationService: RegistrationService,
              private logger: NGXLogger,
              private activatedRoute: ActivatedRoute) {
    this._loginReloader.check();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.tokenResetPassword = param['tokenResetPassword'];
      this.tokenEmail = param['tokenEmail'];
      if (this.tokenResetPassword) {
        this.typeLogin = TypeLogin.RESET_PASSWORD;
      }
    });
    this.graduationYearInit();
    this.formForgotPassword = this.re0013PageValidator.createFormForgotPassword();
    this.formResetPassword = this.re0013PageValidator.createFormResetPassword();
    this.translate.get('RE0013').subscribe(msg => {
      this.msgRe0013 = msg;
    });
  }

  graduationYearInit() {
    const value = this.helper.parseBirthDate('');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    if (this.dayOfMonths) {
      for (let i = 1; i <= 31; i++) {
        const d = (i < 10 ? '0' : '') + i;
        this.dayOfMonths.push(d);
      }
    }
    const year = this.helper.graduationYearOptions(89);
    this.options_graduation_year = year[0];
    this.options_graduation_text = year[2];
  }

  changeDate() {
    const value = this.helper.changeDate('yearBirth', 'monthBirth');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    const day = $('#dayBirth').val();
    if (this.dayOfMonths.indexOf(day) === -1) {
      $('#dayBirth').val('');
      this.formResetPassword.controls.dayBirth.setValue('');
    }
  }

  clickForgotPassword(event: any) {
    this.mailAddressForgot = '';
    this.mailAddressForgotConfirm = ''
    this.typeLogin = TypeLogin.FORGOT_PASSWORD;
  }

  changeLogin(event: any) {
    this.typeLogin = TypeLogin.LOGIN;
  }

  backLogin() {
    this.transiteScreen('/re/re0013');
  }

  clickSignUp(event: any) {
    this.transiteScreen('/re/re0004');
  }

  clickLogin() {
    // required input field
    if (!this._loginId) {
      this._showError = true;
      this.translate.get('RE0013').take(1).subscribe(
        msg => {
          this.errorLogin('loginId require', msg.LOGINID_ERR_DIALOG_MESS);
        }
      );
      return;
    }
    if (!this._password) {
      this._showError = true;
      this.translate.get('RE0013').take(1).subscribe(
        msg => {
          this.errorLogin('password require', msg.PASS_ERR_DIALOG_MESS);
        }
      );
      return;
    }

    setTimeout(() => {
      // show loader
      this.dialogService.setLoaderVisible(true);
    });

    // request params
    const params = {
      grant_type: 'password',
      username: this._loginId,
      password: this._password,
      save_login: this._saveLogin,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
    };

    // call request
    this.authenticationService.getToken(params.grant_type, params).take(1).subscribe(() => {
      // UserSessionの取得
      this.getUserSession((userSession, error) => {
        if (error) {
          return this.errorLogin(error);
        }

        this._loginReloader.erase();

        if (userSession.identifyStatus) {
          this.transiteScreen('/re/re0032');
        } else if (userSession.accountStatus.isValid) {
          this.transiteScreen(this.getTransitUrl());
          this.authenticationService.redirectUrl = null;

        } else {
          this.errorLogin('Invalid account status');
        }
      });
    }, error => {
      this.errorLogin(error);
    });
  }

  checkValidateForgotPassword() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.re0013PageValidator.checkValidateForgotPassword(this.formForgotPassword, this.errorForgotPassword);
    this.helper.gotoError();
    if (this.formForgotPassword.valid && !this.errorForgotPassword['mailAddressConfirmVal']) {
      this.registrationService.forgotPasswordPr(this.formForgotPassword.value.mailAddressVal).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.typeLogin = TypeLogin.FORGOT_PASSWORD_SUCCESS;
        },
        (error: HttpError) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (error.contains('COMMON.GET_FAILED')) {
            this.dialogService.showError('RE0013.FORGET_PASSWORD.ERROR_ACCOUNT');
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

  checkValidateResetPassword() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.re0013PageValidator.checkValidateResetPassword(this.formResetPassword, this.errorResetPassword);
    this.helper.gotoError();
    if (this.formResetPassword.valid && !this.errorResetPassword['newPasswordConfirm']) {
      const model = {
        token: this.tokenResetPassword,
        password: this.formResetPassword.value.newPassword,
        birthDate: this.formResetPassword.value.yearBirth + '-' + this.formResetPassword.value.monthBirth + '-'
        + this.formResetPassword.value.dayBirth
      };

      // call api reset password
      this.registrationService.resetPasswordPr(model).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.typeLogin = TypeLogin.RESET_PASSWORD_SUCCESS;
        },
        (error: HttpError) => {

          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (error.contains('RE0022_E001_099')) {
            this.errorResetPassword.dayBirth = this.msgRe0013.BIRTHDAY_ERROR;
            this.errorResetPassword.monthBirth = this.msgRe0013.BIRTHDAY_ERROR;
            this.errorResetPassword.yearBirth = this.msgRe0013.BIRTHDAY_ERROR;
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

  // Helper
  // --------------------------------------------------------------------------
  private getUserSession(callback: (userSession, error) => void) {
    this.shared.fetchUserSession().subscribe(() => {
      const userSession = this.shared.getUserSession();
      callback(userSession, null);
    }, error => {
      callback(null, error);
    });
  }

  private getTransitUrl(): string {
    const redirectUrl = this.authenticationService.redirectUrl;
    if (!redirectUrl || redirectUrl === '/' || redirectUrl === '/re/re0013') {
      if (this.tokenEmail) {
        return 're/re0010';
      }
      return '/me/me0032';
    }
    return redirectUrl;
  }

  private transiteScreen(screenId: string) {
    this.router.navigate([screenId]).then(() => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }).catch(() => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    });
  }

  private errorLogin(error, message = null) {
    this.logger.warn('login error: ', error);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    // clear
    this.authenticationService.clearToken();
    this.shared.clearUserSession();
    // show dialog
    this.dialogService.showMessage('warning', false, 'MSG.RE0013_1.E004_1', message, null, 'MSG.OK', null);
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if (this.typeLogin === TypeLogin.LOGIN) {
  //       this.clickLogin();
  //     } else if (this.typeLogin === TypeLogin.FORGOT_PASSWORD) {
  //       this.checkValidateForgotPassword();
  //     } else if (this.typeLogin === TypeLogin.RESET_PASSWORD) {
  //       this.checkValidateResetPassword();
  //     }
  //   }
  // }
}
