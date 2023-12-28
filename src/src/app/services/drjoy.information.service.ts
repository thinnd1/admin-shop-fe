import {Injectable, OnDestroy} from '@angular/core';
import {FirebaseDatabase} from './firebase/firebase.database';
import {NGXLogger} from 'ngx-logger';
import {Subscription} from 'rxjs/Subscription';
import {AuthenticationMessage, DrjoyInfoAlertMessage, FirebaseReadyMessage} from './message.service';
import {AuthenticationService} from './authentication.service';
import {SharedValueService} from './shared-value.service';
import {CmsService} from './cms.service';
import {DrjoyInfoAlert} from '../models/cm/drjoy-info-alert';
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;
import DataSnapshot = firebase.database.DataSnapshot;

/**
 * Dr.JOYからのお知らせ監視サービス.
 *
 * @author k.sumi 2018/04/20
 */
@Injectable()
export class DrjoyInformationService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Dataase reference
  private databaseReference: Reference;
  // Subscription
  private authenticationSubscription: Subscription;
  private firebaseReadySubscription: Subscription;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private database: FirebaseDatabase,
              private shared: SharedValueService,
              private authentication: AuthenticationService,
              private authenticationMessage: AuthenticationMessage,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private drjoyInfoAlertMessage: DrjoyInfoAlertMessage,
              private cmsService: CmsService,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Override
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    this.unregisterSubscription();
    this.stopMonitoring();
  }

  // Prepare
  // --------------------------------------------------------------------------
  private prepare() {
    this.logger.info('*** Initialize DrjoyInformationService');
    this.registerSubscription();
  }

  // Monitor
  // --------------------------------------------------------------------------
  /**
   * 監視を開始する.
   */
  private startMonitoring() {
    this.logger.info('*** starting drjoy information monitoring');
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    // DBレファレンス
    this.databaseReference = this.database.ref(`/user/${session.officeUserId}/drjoyInfo`);
    // データ参照
    this.databaseReference.on(EventType.ChildAdd, (snapshot: DataSnapshot) => {
      if (!snapshot.exists() || snapshot.key !== 'new') {
        return;
      }
      // お知らせの取得
      this.cmsService.getDrInfoPopup().subscribe((res: DrjoyInfoAlert) => {
        if (res.exist && res.drjoyInfo) {
          this.drjoyInfoAlertMessage.send(res);
          // ここまできたらFirebase上のデータは削除する
         this.databaseReference.child('new').remove(err => {
           if (err) {
             this.logger.warn('Failed delete drjoyInfo/new data');
           }
         });
        }
      });
    });
  }

  /**
   * 監視を停止する.
   */
  private stopMonitoring() {
    this.logger.info('*** stopping drjoy information monitoring');
    // firebase
    if (this.databaseReference) {
      this.databaseReference.off();
    }
  }

  // Subscription
  // --------------------------------------------------------------------------
  /**
   * Subscription登録.
   */
  private registerSubscription() {
    this.registerAuthenticationSubscription();
    this.registerFirebaseReadySubscription();
  }

  /**
   * Subscription解除.
   */
  private unregisterSubscription() {
    // 認証
    if (this.authenticationSubscription) { this.authenticationSubscription.unsubscribe(); }
    this.authenticationSubscription = null;
    // Firebase
    if (this.firebaseReadySubscription) { this.firebaseReadySubscription.unsubscribe(); }
    this.firebaseReadySubscription = null;
  }

  // Authentication Subscription
  // --------------------------------------------------------------------------
  private registerAuthenticationSubscription() {
    if (this.authenticationSubscription) {
      return;
    }
    this.authenticationSubscription = this.authenticationMessage.get().subscribe((type) => {
      if (type === AuthenticationMessage.Type.Logout) {
        this.logger.debug('*** Logout subscription on drjoy information service');
        this.stopMonitoring();
      }
    });
  }

  // Firebase Ready Subscription
  // --------------------------------------------------------------------------
  private registerFirebaseReadySubscription() {
    if (this.firebaseReadySubscription) {
      return;
    }
    this.firebaseReadySubscription = this.firebaseReadyMessage.get().subscribe(ok => {
      if (ok) {
        this.logger.debug('*** Firebase ready subscription on drjoy information service');
        this.startMonitoring();
      }
    });
  }
}
