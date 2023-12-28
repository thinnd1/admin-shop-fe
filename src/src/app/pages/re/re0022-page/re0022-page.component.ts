import { Observable } from 'rxjs/Observable';
import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {AuthenticationMessage} from '../../../services/message.service';
import {Helper, TypeLogin} from '../../../common/helper';
import {Re0022PageValidator} from './re0022-page.validator';
import {FormGroup} from '@angular/forms';
import {RegistrationService} from '../../../services/registration.service';
import {NGXLogger} from 'ngx-logger';
import {environment} from '../../../../environments/environment';
import {HttpError} from '../../../common/error/http.error';
import {WsService} from '../../../services/stomp/ws.service';
import { InformationService } from '../../../services/information.service';

declare const $: any;

/**
 * ログイン画面表示時にリロードさせるクラス
 */
export class LoginReloader {
  private static readonly LOGIN_RELOADER = "LOGIN_RELOADER";

  /**
   * 条件に合致した場合、リロードする
   */
  public check = () => {
    // リロード済みならリロードしない
    const reloader = localStorage.getItem(LoginReloader.LOGIN_RELOADER);
    if (reloader) {
      return;
    }

    // ログイン中ならリロードしない
    if (localStorage.getItem("dr_auth_token") || localStorage.getItem("pr_auth_token")) {
      return;
    }

    // リロード済み設定をしておく
    localStorage.setItem(LoginReloader.LOGIN_RELOADER, "ALREADY_RELOAD");
    // location.reload(); // TODO: 一旦コメントアウト。ベトナム側が本番で戻す予定
  }

  /**
   * リロード済み設定を削除しておく
   */
  public erase = () => {
    localStorage.removeItem(LoginReloader.LOGIN_RELOADER);
  }
}

@Component({
  selector: 'app-re0022-page',
  templateUrl: './re0022-page.component.html',
  styleUrls: ['./re0022-page.component.scss'],
  providers: [Re0022PageValidator]
})
export class Re0022PageComponent implements OnInit {
  public _loginId = '';
  public _password = '';
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
  public msgRe0022;
  public mailAddressForgot: any;
  public mailAddressForgotConfirm: any;

  private _loginReloader = new LoginReloader();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private authenticationMessage: AuthenticationMessage,
    private shared: SharedValueService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private re0022PageValidator: Re0022PageValidator,
    private helper: Helper,
    private logger: NGXLogger,
    private wsService: WsService,
    private registrationService: RegistrationService,
    private activatedRoute: ActivatedRoute,
    private information: InformationService
  ) {
    this._loginReloader.check();
  }

  async ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    this.graduationYearInit();
    this.formForgotPassword = this.re0022PageValidator.createFormForgotPassword();
    this.formResetPassword = this.re0022PageValidator.createFormResetPassword();
    this.activatedRoute.params.subscribe((param: any) => {
      this.tokenResetPassword = param['tokenResetPassword'];
      this.tokenEmail = param['tokenEmail'];
      if (this.tokenResetPassword) {
        this.typeLogin = TypeLogin.RESET_PASSWORD;
      }
    });
    this.translate.get('RE0022').subscribe(msg => {
      this.msgRe0022 = msg;
    });

    // メモリ中に UserSession があれば（ログイン中なら）、トップページに遷移させる
    const userSession = this.shared.getUserSession();
    if (userSession) {
      console.log('Redirect to TopPage');
      this.router.navigate([ '/' ]);
      return;
    }

    // サーバが UserSession を持っていても（ログイン中なら）、トップページに遷移させる
    const hasSession = await this.shared.fetchUserSession().take(1).catch((() => Observable.from([]))).toPromise();
    if (hasSession) {
      console.log('Redirect to TopPage');
      this.router.navigate([ '/' ]);
      return;
    }
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
    this.mailAddressForgotConfirm = '';
    this.typeLogin = TypeLogin.FORGOT_PASSWORD;
  }

  changeLogin(event: any) {
    this.typeLogin = TypeLogin.LOGIN;
  }

  backLogin() {
    this.router.navigate(['/re/re0022']);
  }

  clickLogin() {
    // required input field
    if (!this._loginId) {
      this._showError = true;
      this.translate.get('RE0022').take(1).subscribe(
        msg => {
          this.errorLogin('loginId require', msg.LOGINID_ERR_DIALOG_MESS);
        }
      );
      return;
    }
    if (!this._password) {
      this._showError = true;
      this.translate.get('RE0022').take(1).subscribe(
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
          if (this.wsService.isConnected()) {
            console.log('---------------DISCONNECT---------------');
            this.wsService.onDisconnect();
          }

          this._loginReloader.erase();

          // 紙飛行機情報を取得する
          this.information.prepare();

          if (userSession.accountStatus.isProvisional) {
            this.transiteScreen('/re/first-entry');
          } else if (userSession.accountStatus.isValid && userSession.verificationFlag) {
            this.router.navigate(['/re/re0034']);
          } else if (userSession.accountStatus.isValid && userSession.personalFlag) {
            this.router.navigate(['/me/me0005']);
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
    this.re0022PageValidator.checkValidateForgotPassword(this.formForgotPassword, this.errorForgotPassword);
    this.helper.gotoError();
    if (this.formForgotPassword.valid && !this.errorForgotPassword['mailAddressConfirmVal']) {
      this.registrationService.forgotPasswordDr(this.formForgotPassword.value.mailAddressVal).subscribe(
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
            this.dialogService.showError('RE0022.FORGET_PASSWORD.ERROR_ACCOUNT');
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
    this.re0022PageValidator.checkValidateResetPassword(this.formResetPassword, this.errorResetPassword);
    this.helper.gotoError();
    if (this.formResetPassword.valid && !this.errorResetPassword['newPasswordConfirm']) {
      const model = {
        token: this.tokenResetPassword,
        password: this.formResetPassword.value.newPassword,
        birthDate: this.formResetPassword.value.yearBirth + '-' + this.formResetPassword.value.monthBirth + '-'
        + this.formResetPassword.value.dayBirth
      };

      // call api reset password
      this.registrationService.resetPasswordDr(model).subscribe(
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
            this.errorResetPassword.dayBirth = this.msgRe0022.BIRTHDAY_ERROR;
            this.errorResetPassword.monthBirth = this.msgRe0022.BIRTHDAY_ERROR;
            this.errorResetPassword.yearBirth = this.msgRe0022.BIRTHDAY_ERROR;
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
    if(this.tokenEmail) {
      return '/re/user-edit';
    }
    if (!redirectUrl || (redirectUrl === '/re/re0022')) {
      return '/';
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
    this.dialogService.showMessage('warning', false, 'MSG.RE0022_1.E004_1', message, null, 'MSG.OK', null);
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
