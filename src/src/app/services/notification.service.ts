import {Injectable, OnDestroy} from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {Subscription} from 'rxjs/Subscription';
import {AuthenticationMessage, FirebaseReadyMessage} from './message.service';
import {FirebaseDatabase} from './firebase/firebase.database';
import {SharedValueService} from './shared-value.service';
import {AuthenticationService} from './authentication.service';
import {JsonConvert} from 'json2typescript';
import {FirUserDesktop} from '../models/firebase/fir.user.desktop';
import {FirebaseStorage} from './firebase/firebase.storage';
import {SoundService} from './sound.service';
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;

/**
 * 通知サービス.
 */
@Injectable()
export class NotificationService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Subscriber
  private authenticationSubscription: Subscription;
  private firebaseReadySubscription: Subscription;

  // デスクトップ通知監視用のリファレンス
  private desktopReference: Reference;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private database: FirebaseDatabase,
              private storage: FirebaseStorage,
              private shared: SharedValueService,
              private authentication: AuthenticationService,
              private authenticationMessage: AuthenticationMessage,
              private sound: SoundService,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Prepare
  // --------------------------------------------------------------------------
  prepare() {
    this.logger.info('*** Initialize NotificationService');
    // Subscription登録
    this.registerSubscription();
  }

  // Overrideed
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    this.unregisterSubscription();
    this.stopMonitoring();
  }

  // Public methods
  // --------------------------------------------------------------------------
  /**
   * デスクトップ通知を表示します.
   */
  displayDesktopNotifications(officeId, officeUserId, title, message: string, playSound = true) {
    try {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          // 許可されていない時
          return;
        }
        this.show(officeId, officeUserId, title, message, playSound);

      }, reason => {
        this.logger.warn('Failed display desktop notifications: ', reason);
      });

    } catch (e) {
      if (e instanceof TypeError) {
        // safari
        Notification.requestPermission(permission => {
          if (permission !== 'granted') {
            return;
          }
          this.show(officeId, officeUserId, title, message, playSound);
        });
      }
    }
  }

  // 通知の表示
  private show(officeId, officeUserId, title, message: string, playSound = true) {
    // 顔写真URLの取得
    this.storage.faceImageURL(officeId, officeUserId).subscribe(url => {
      // デスクトップ通知の表示
      this.displayDesktop(title, message, url, playSound);
    }, cause => {
      this.logger.warn('Failed obtain face image url: ', cause);
      // アイコンURLの取得に失敗してもデスクトップ通知は表示する
      this.displayDesktop(title, message, null, playSound);
    });
  }

  // 通知を表示する
  private displayDesktop(title, message, iconUrl: string, playSound: boolean) {
    new Notification(title, {
      icon: iconUrl,
      body: message,
    });
    // 通知音
    if (playSound) {
      this.sound.play();
    }
  }

  // Subscription
  // --------------------------------------------------------------------------
  // 各種通知の登録
  private registerSubscription() {
    this.registerAuthenticationSubscription();
    this.registerFirebaseReadySubscription();
  }

  // ログイン・ログアウト時の通知
  private registerAuthenticationSubscription() {
    if (this.authenticationSubscription) {
      return;
    }
    this.authenticationSubscription = this.authenticationMessage.get().subscribe((type) => {
      if (type === AuthenticationMessage.Type.Loginin) {
        this.logger.debug('*** Login subscription on notification service');

      } else if (type === AuthenticationMessage.Type.Logout) {
        this.logger.debug('*** Logout subscription on notification service');
        this.stopMonitoring();
      }
    });
  }

  // Firebase使用準備完了時の通知
  private registerFirebaseReadySubscription() {
    if (this.firebaseReadySubscription) {
      return;
    }
    this.firebaseReadySubscription = this.firebaseReadyMessage.get().subscribe(ok => {
      if (ok) {
        this.logger.debug('*** Firebase ready subscription on notification service');
        this.startMonitoring();
      }
    });
  }

  // 通知の解除
  private unregisterSubscription() {
    // ログイン・ログアウト時
    if (this.authenticationSubscription) { this.authenticationSubscription.unsubscribe(); }
    this.authenticationSubscription = null;
    // Firebase準備完了時
    if (this.firebaseReadySubscription) { this.firebaseReadySubscription.unsubscribe(); }
    this.firebaseReadySubscription = null;
  }

  // Monitor
  // --------------------------------------------------------------------------
  /**
   * 通知に関わる情報の変更監視を開始する.
   */
  private startMonitoring() {
    this.logger.debug('*** starting notification monitoring');
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    if (!session) {
      this.shared.fetchUserSession().subscribe(ok => {
        if (ok) {
          // デスクトップ通知
          this.startDesktopMonitor(this.shared.getUserSession().officeUserId);
        }
      });
    } else {
      // デスクトップ通知
      this.startDesktopMonitor(session.officeUserId);
    }
  }

  /**
   * 通知に関わる情報の変更監視を停止する.
   */
  private stopMonitoring() {
    this.logger.debug('*** stopping notification monitoring');
    // firebase
    if (this.desktopReference) {
      this.desktopReference.off();
    }
  }

  // デスクトップ通知の監視を開始する
  // --------------------------------------------------------------------------
  private startDesktopMonitor(officeUserId: string) {
    // パスリファレンス
    this.desktopReference = this.database.ref(`/user/${officeUserId}/desktop`);
    // 既存の通知を全て削除する
    this.desktopReference.remove(err1 => {
      if (err1) {
        this.logger.warn('Failed delete all desktop notice data: ', err1);
      }
      // Added
      this.desktopReference.on(EventType.ChildAdd, snapshot => {
        if (!snapshot.exists()) {
          // 存在しない時
          return;
        }
        // モデルに変換する
        const data = new JsonConvert().deserialize(snapshot.val(), FirUserDesktop);
        // 取得した通知は削除する
        this.desktopReference.child(snapshot.key).remove(err2 => {
          if (err2) {
            this.logger.warn('Failed delete desktop notice data: ', err2);
          }
          // デスクトップ通知を行う
          this.displayDesktopNotifications(
            data.contributorOfficeId,
            data.contributorOfficeUserId,
            data.messageJP.title,
            data.messageJP.message,
            data.soundFlag);
        });
      });
    });
  }
}
