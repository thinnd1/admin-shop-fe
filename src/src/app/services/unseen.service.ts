import {Subscription} from 'rxjs/Subscription';
import {Injectable, OnDestroy} from '@angular/core';
import {SharedValueService} from './shared-value.service';
import {NGXLogger} from 'ngx-logger';
import {FirebaseDatabase} from './firebase/firebase.database';
import {FirebaseService} from './firebase/firebase.service';
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;
import DataSnapshot = firebase.database.DataSnapshot;
import {noUndefined} from "@angular/compiler/src/util";
import {count} from "rxjs/operator/count";
import {FirebaseReadyMessage} from "./message.service";
import {Unseens} from "../models/firebase/fir.unseens";

/**
 * Firebase 未読情報 サービス.
 */
@Injectable()
export class UnseenService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Subscriber
  private subscription: Subscription;

  // EventReference
  // --------------------------------------------------------------------------
  private firebaseReadySubscription: Subscription;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private firebase: FirebaseService,
              private database: FirebaseDatabase,
              private shared: SharedValueService,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private unseens: Unseens,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Initializer
  // --------------------------------------------------------------------------
  prepare() {
    this.logger.info('*** Initialize UnseenService');
    // Subscription登録
    this.registerSubscription();
  }

  // Overrideed
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    this.logger.debug('*** Destroy on UnseenService');
    this.unregisterSubscription();
    this.stopMonitoring();
  }

  // Public methods
  // --------------------------------------------------------------------------

  // Monitor
  // --------------------------------------------------------------------------
  /**
   * 未読件数に関わる情報の変更監視を開始する.
   */
  private startMonitoring() {
    this.logger.debug('*** starting sidemenu monitoring');
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    if (!session) {
      this.shared.fetchUserSession().subscribe(ok => {
        if (ok) {
          // 未読件数に関わる監視の開始
          this.registerObservers(this.shared.getUserSession().officeUserId);
        }
      });
    } else {
      // 未読件数に関わる監視の開始
      this.registerObservers(session.officeUserId);
    }
  }

  /**
   * 未読件数に関わる情報の変更監視を停止する.
   */
  private stopMonitoring() {
    this.logger.debug('*** stopping UnseenService monitoring');
    // firebase
    this.unregisterObservers();
  }

  // Firebase
  // --------------------------------------------------------------------------
  /**
   * Firebase変更監視の登録.
   */
  private registerObservers(officeUserId: string) {
    // 面会
    this.registerMeetingObserver(officeUserId);
    // チャット
    this.registerChatsObserver(officeUserId);
    // グループ
    this.registerGroupsObserver(officeUserId);
    // DrJOYからのお知らせ
    this.registerDrjoyInfoObserver(officeUserId);
    // 紙飛行機お知らせ
    this.registerInformationObserver(officeUserId);
  }

  private meetingRef: Reference;
  private chatsRef: Reference;
  private groupsRef: Reference;
  private drjoyInfoRef: Reference;
  private notifyInfoRef: Reference;

  private registerMeetingObserver(officeUserId: string) {
    if (this.meetingRef) {
      return;
    }
    this.meetingRef = this.database.ref(`/user/${officeUserId}/meeting`);
    // イベント登録
    this.meetingRef.on(EventType.Value, (snapshot: DataSnapshot) => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // 未読数カウント
        let count = snapshot.val().unseenCount;
        count = count !== undefined ? count : 0;
        this.unseens.meetingAll = count;
      }
    });
  }

  private registerChatsObserver(officeUserId: string) {
    if (this.chatsRef) {
      return;
    }
    this.chatsRef = this.database.ref(`/user/${officeUserId}/chats`);
    // イベント登録
    this.chatsRef.on(EventType.Value, (snapshot: DataSnapshot) => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // 未読数カウント
        let sum = 0;
        snapshot.forEach(child => {
          let count = child.val().unseenCount;
          count = count !== undefined ? count : 0;
          sum += count;
          return false;
        });
        this.unseens.chatAll = sum;
      }
    });
  }

  private registerGroupsObserver(officeUserId: string) {
    if (this.groupsRef) {
      return;
    }
    this.groupsRef = this.database.ref(`/user/${officeUserId}/groups`);
    // イベント登録
    this.groupsRef.on(EventType.Value, (snapshot: DataSnapshot) => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // 未読数カウント
        let sum = 0;
        snapshot.forEach(child => {
          let count = child.val().unseenCount;
          count = count !== undefined ? count : 0;
          let countTo = child.val().toUnseen;
          countTo = countTo !== undefined ? countTo : 0;

          sum += count;
          sum += countTo;
          return false;
        });
        this.unseens.groupAll = sum;
      }
    });
  }

  private registerDrjoyInfoObserver(officeUserId: string) {
    if (this.drjoyInfoRef) {
      return;
    }
    this.drjoyInfoRef = this.database.ref(`/user/${officeUserId}/drjoyInfo`);
    // イベント登録
    this.drjoyInfoRef.on(EventType.Value, (snapshot: DataSnapshot) => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // 未読数カウント
        let count = snapshot.val().unseenCount;
        count = count !== undefined ? count : 0;
        this.unseens.drjoyInfoAll = count;
      }
    });
  }

  private registerInformationObserver(officeUserId: string) {
    if (this.notifyInfoRef) {
      return;
    }
    this.notifyInfoRef = this.database.ref(`/user/${officeUserId}/information`);
    // イベント登録
    this.notifyInfoRef.on(EventType.Value, (snapshot: DataSnapshot) => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // 未読数カウント
        let sum = 0;
        snapshot.forEach(child => {
          sum += child.val().read ? 0 : 1;
          return false;
        });
        this.unseens.notifyInfoAll = sum;
      }
    });
  }

  /**
   * Firebase変更監視の解除.
   */
  private unregisterObservers() {
    // 面会
    if (this.meetingRef) { this.meetingRef.off(); }
    this.meetingRef = null;
    // チャット
    if (this.chatsRef) { this.chatsRef.off(); }
    this.chatsRef = null;
    // グループ
    if (this.groupsRef) { this.groupsRef.off(); }
    this.groupsRef = null;
    // DrJOYからのお知らせ
    if (this.drjoyInfoRef) { this.drjoyInfoRef.off(); }
    this.drjoyInfoRef = null;
    // 紙飛行機お知らせ
    if (this.notifyInfoRef) { this.notifyInfoRef.off(); }
    this.notifyInfoRef = null;
  }

  // Subscription
  // --------------------------------------------------------------------------
  // 各種通知の登録
  private registerSubscription() {
    this.registerFirebaseReadySubscription();
  }

  // Firebase使用準備完了時の通知
  private registerFirebaseReadySubscription() {
    if (this.firebaseReadySubscription) {
      return;
    }
    if (this.firebase.isReady()) {
      this.logger.debug('*** Firebase already loggined');
      this.startMonitoring();
    } else {
      this.firebaseReadySubscription = this.firebaseReadyMessage.get().subscribe(ok => {
        if (ok) {
          this.logger.debug('*** Firebase ready subscription on sidemenu service');
          this.startMonitoring();
        }
      });
    }
  }

  // 通知の解除
  private unregisterSubscription() {
    // Firebase準備完了時
    if (this.firebaseReadySubscription) { this.firebaseReadySubscription.unsubscribe(); }
    this.firebaseReadySubscription = null;
  }
}
