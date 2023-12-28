import {Injectable, OnDestroy} from "@angular/core";
import {NGXLogger} from "ngx-logger";
import {FirebaseDatabase} from "./firebase/firebase.database";
import {SharedValueService} from "./shared-value.service";
import {AuthenticationService} from "./authentication.service";
import {AuthenticationMessage, FirebaseReadyMessage, LoginUserInfoMessage} from "./message.service";
import {Subscription} from "rxjs/Subscription";
import {FirUserInfo} from "../models/firebase/fir.userinfo";
import {Router} from "@angular/router";
import {DialogService} from "./dialog.service";
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;
import {UserSession} from '../models/ba/user-session';
import {TranslateService} from '@ngx-translate/core';
import {DialogResult} from '../models/dialog-param';

/**
 * Firebase上のログインユーザー情報監視サービス.
 */
@Injectable()
export class UserService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // ユーザー情報が変更されるとインスタンス自体が変更される
  private loginUserInfo: FirUserInfo;

  // DBリファレンス
  private reference: Reference;
  // ログイン・ログアウト通知
  private loginSubscription: Subscription;
  // Firebase準備完了通知
  private firebaseReadySubscription: Subscription;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private database: FirebaseDatabase,
              private shared: SharedValueService,
              private router: Router,
              private dialogService: DialogService,
              private authentication: AuthenticationService,
              private loginMessage: AuthenticationMessage,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private loginUserInfoMessage: LoginUserInfoMessage,
              private logger: NGXLogger,
              private translate: TranslateService) {
    this.setUp();
  }

  // Override
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    this.destroy();
  }

  // Public methods
  // --------------------------------------------------------------------------
  /**
   * Firebase上のログインユーザー情報を取得する.
   */
  public getLoginUserInfo() {
    return this.loginUserInfo;
  }

  // SetUp
  // --------------------------------------------------------------------------
  private setUp() {
    this.logger.debug('*** Initialize UserService');
    // 通知登録
    this.registerObservers();
  }

  // Destroy
  // --------------------------------------------------------------------------
  private destroy() {
    this.logger.debug('*** Deinit UserService');
    // データリセット
    this.loginUserInfo = null;
    // 監視停止
    this.stopMonitoring();
    // 通知解除
    this.unregisterObservers();
  }

  // Firebase database
  // --------------------------------------------------------------------------
  /**
   * 監視を開始する.
   */
  private startMonitoring() {
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    // DBリファレンス
    this.reference = this.database.ref(`/user/${session.officeUserId}/userInfo`);

    // 監視を開始する
    this.reference.on(EventType.Value, snapshot => {
      let data = [];
      if (snapshot.exists()) {
        data = snapshot.val();
      }
      const userInfo = new FirUserInfo(session.officeUserId, data);

      // アカウントステータスのチェックを行う
      if (!this.verifyAccountStatus(userInfo)) {
        return;
      }

      if (!this.identifyMRUser(userInfo)) {
        return;
      }
      // @logger
      this.logger.debug('*** firebase user info: ', userInfo);

      // アクセストークン、セッション情報を更新する
      this.updateAuthentication();

      this.loginUserInfo = userInfo;
      // Notify message
      this.loginUserInfoMessage.send(this.loginUserInfo);
    });
  }

  /**
   * 監視を終了する.
   */
  private stopMonitoring() {
    if (this.reference) {
      this.reference.off();
    }
    this.reference = null;
  }

  private identifyMRUser(userInfo: FirUserInfo): boolean {
    if (!this.loginUserInfo) {
      return true;
    }
    if (userInfo.checkIdentify()) {

      const html_lock = '<p>' + this.translate.instant('MSG_IDENTIFY.REJECT') + '</p>' + '</br>'
        + '<p>' + this.translate.instant('MSG_IDENTIFY.RE_UP') + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html_lock, 'MSG.OK', '').subscribe(
        () => {
          return this.router.navigate(['/re/re0032'], {replaceUrl: true}).then(() => {});
        });
      return false;
    }
    return true;
  }
  // Helper
  // --------------------------------------------------------------------------
  /**
   * システム利用可能かチェックし、権限がない場合はログイン画面に遷移する.
   * その際ログアウト処理も同時に行う.
   */
  private verifyAccountStatus(userInfo: FirUserInfo): boolean {
    if (!this.loginUserInfo) {
      // 初回はチェックしない
      return true;
    }
    if (!userInfo.checkAccountStatus()) {
      // ログアウト FIXME ログアウトサービスがあったほうがいい
      this.shared.clearUserSession();
      this.authentication.clearToken();
      // 通知
      this.loginMessage.send(AuthenticationMessage.Type.Logout);

      // エラーメッセージの表示
      // const id = 'CHANGE_ACCOUNT_STATUS';
      // this.dialogService.showMessage('warning', false, null, id, null, 'MSG.OK', null).subscribe(() => {
      //   return this.router.navigate(['/'], {replaceUrl: true}).then(() => {});
      // });
      const html_invalid = '<p>' + this.translate.instant('MSG_INVALID.INVALID') + '</p>' + '</br>'
        + '<p>' + this.translate.instant('MSG_INVALID.LOG_OUT') + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html_invalid, 'MSG.OK', '').subscribe(
        () => {
          return this.router.navigate(['/logout'], {replaceUrl: true}).then(() => {});
        });
      return false;
    }
    if (userInfo.checkLocking()) {
      this.shared.clearUserSession();
      this.authentication.clearToken();
      // 通知
      this.loginMessage.send(AuthenticationMessage.Type.Logout);

      const html_lock = '<p>' + this.translate.instant('MSG_LOCKED.LOCK') + '</p>' + '</br>'
        + '<p>' + this.translate.instant('MSG_LOCKED.LOG_OUT') + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html_lock, 'MSG.OK', '').subscribe(
        () => {
          return this.router.navigate(['/logout'], {replaceUrl: true}).then(() => {});
        });
      return false;
    }
    return true;
  }

  /**
   * アクセストークン、セッション情報を更新する.
   */
  private updateAuthentication() {
    if (!this.loginUserInfo) {
      // 初回はチェックしない
      return true;
    }

    // アクセストークン更新
    this.authentication.refreshToken((error) => {
      if (!error) {
        // セッション情報更新
        return this.shared.fetchUserSession().subscribe(() => {
          this.logger.debug('*** OK update user session');
        }, error => {
          this.logger.warn(error);
          this.dialogService.showError('NETWORK_ERROR');
        });
      } else {
        this.logger.warn(error);
        // TODO ここのエラーはどうする？
      }
    });
  }

  // Observable message
  // --------------------------------------------------------------------------
  /**
   * 通知登録.
   */
  private registerObservers() {
    if (!this.loginSubscription) {
      // ログイン・ログアウト時
      this.loginSubscription = this.loginMessage.get().subscribe(type => {
        if (type === AuthenticationMessage.Type.Loginin) {
          // ignore

        } else if (type === AuthenticationMessage.Type.Logout) {
          // ログアウト時
          this.stopMonitoring();
          this.loginUserInfo = null;
        }
      });
    }

    if (!this.firebaseReadySubscription) {
      // Firebase準備完了時
      this.firebaseReadySubscription = this.firebaseReadyMessage.get().subscribe(ready => {
        if (ready) {
          // ログイン時の通知
          this.startMonitoring();
        }
      });
    }
  }

  /**
   * 通知解除.
   */
  private unregisterObservers() {
    // ログイン・ログアウト通知
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    this.loginSubscription = null;

    // Firebase準備完了通知
    if (this.firebaseReadySubscription) {
      this.firebaseReadySubscription.unsubscribe();
    }
    this.firebaseReadySubscription = null;
  }
}
