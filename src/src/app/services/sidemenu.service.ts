import {AuthenticationService} from './authentication.service';
import {Subscription} from 'rxjs/Subscription';
import {SoundService} from './sound.service';
import {Injectable, OnDestroy} from '@angular/core';
import {SharedValueService} from './shared-value.service';
import {AuthenticationMessage, FirebaseReadyMessage, SideMenuMessage, SideMenuOrderMessage, SideMenuType} from './message.service';
import {NGXLogger} from 'ngx-logger';
import {FirebaseStorage} from './firebase/firebase.storage';
import {FirebaseDatabase} from './firebase/firebase.database';
import {FirSideMenu} from '../models/firebase/fir.sidemenu';
import {FirebaseService} from './firebase/firebase.service';
import {Observable} from 'rxjs/Observable';
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;
import DataSnapshot = firebase.database.DataSnapshot;
import SideMenu = SideMenuMessage.SideMenu;

/**
 * サイドメニューサービス.
 */
@Injectable()
export class SideMenuService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Subscriber
  private authenticationSubscription: Subscription;
  private firebaseReadySubscription: Subscription;

  // EventReference
  // --------------------------------------------------------------------------
  // 表示設定と並び順
  private orderReference: Reference;
  // 面会変更監視リファレンス
  private meetingReference: Reference;
  // 院内グループ変更監視リファレンス
  private insideGroupReference: Reference;
  // 院外グループ変更監視リファレンス
  private outsideGroupReference: Reference;
  // 院内チャット変更監視リファレンス
  private insideChatReference: Reference;
  // 院外チャット変更監視リファレンス
  private outsideChatReference: Reference;

  // サイドメニュー情報
  // --------------------------------------------------------------------------
  // 表示設定と並び順
  private visibleAndOrders: string[];
  // 面会
  private meetings: FirSideMenu[];
  // 院内グループ
  private insideGroups: FirSideMenu[];
  // 院外グループ
  private outsideGroups: FirSideMenu[];
  // 院内チャット
  private insideChats: FirSideMenu[];
  // 院外チャット
  private outsideChats: FirSideMenu[];

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private firebase: FirebaseService,
              private database: FirebaseDatabase,
              private storage: FirebaseStorage,
              private shared: SharedValueService,
              private authentication: AuthenticationService,
              private authenticationMessage: AuthenticationMessage,
              private sidemenuMessage: SideMenuMessage,
              private sidemenuOrderMessage: SideMenuOrderMessage,
              private sound: SoundService,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Initializer
  // --------------------------------------------------------------------------
  prepare() {
    this.logger.info('*** Initialize SideMenuService');
    // Subscription登録
    this.registerSubscription();
  }

  // Overrideed
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    this.logger.debug('*** Destroy on sidemenu service');
    this.unregisterSubscription();
    this.stopMonitoring();
  }

  // Public methods
  // --------------------------------------------------------------------------
  /**
   * 表示設定と並び順を取得する.
   */
  public getVisibleAndOrders(): string[] {
    return this.visibleAndOrders;
  }

  /**
   * 保持しているサイドメニュー情報を取得する.
   */
  public reuseObjects(): { [key: string]: FirSideMenu[] } {
    return {
      'meeting': this.meetings,
      'insideGroup': this.insideGroups,
      'outsideGroup': this.outsideGroups,
      'insideChat': this.insideChats,
      'outsideChat': this.outsideChats,
    };
  }

  // Monitor
  // --------------------------------------------------------------------------
  /**
   * サイドメニューに関わる情報の変更監視を開始する.
   */
  private startMonitoring() {
    this.logger.debug('*** starting sidemenu monitoring');
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    if (!session) {
      this.shared.fetchUserSession().subscribe(ok => {
        if (ok) {
          // サイドメニューに関わる監視の開始
          this.registerObservers(this.shared.getUserSession().officeUserId);
        }
      });
    } else {
      // サイドメニューに関わる監視の開始
      this.registerObservers(session.officeUserId);
    }
  }

  /**
   * サイドメニューに関わる情報の変更監視を停止する.
   */
  private stopMonitoring() {
    this.logger.debug('*** stopping sidemenu monitoring');
    // firebase
    this.unregisterObservers();
  }

  // Firebase
  // --------------------------------------------------------------------------
  /**
   * Firebase変更監視の登録.
   */
  private registerObservers(officeUserId: string) {
    // 表示設定と並び順
    this.registerOrderObserver(officeUserId);
    // 面会
    this.registerMeetingObserver(officeUserId);
    // 院内グループ
    this.registerInsideGroupObserver(officeUserId);
    // 院外グループ
    this.registerOutsideGroupObserver(officeUserId);
    // 院内メッセージ
    this.registerInsideChatObserver(officeUserId);
    // 院外メッセージ
    this.registerOutsideChatObserver(officeUserId);
  }

  /**
   * Firebase変更監視の解除.
   */
  private unregisterObservers() {
    // 表示設定と並び順
    if (this.orderReference) { this.orderReference.off(); }
    this.orderReference = null;
    // 面会
    if (this.meetingReference) { this.meetingReference.off(); }
    this.meetingReference = null;
    // 院内グループ
    if (this.insideGroupReference) { this.insideGroupReference.off(); }
    this.insideGroupReference = null;
    // 院外グループ
    if (this.outsideGroupReference) { this.outsideGroupReference.off(); }
    this.outsideGroupReference = null;
    // 院内メッセージ
    if (this.insideChatReference) { this.insideChatReference.off(); }
    this.insideChatReference = null;
    // 院外メッセージ
    if (this.outsideChatReference) { this.outsideChatReference.off(); }
    this.outsideChatReference = null;
  }

  /**
   * 表示設定を並び順.
   */
  private registerOrderObserver(officeUserId: string) {
    if (this.orderReference) {
      return;
    }
    this.orderReference = this.database.ref(`/user/${officeUserId}/sidemenu`);
    // イベント登録
    this.orderReference.on(EventType.Value, (snapshot: DataSnapshot) => {
      let data: string[] = [];
      if (snapshot.exists()) {
        data = snapshot.val();
      }
      this.visibleAndOrders = data;
      this.sidemenuOrderMessage.send(this.visibleAndOrders);
    });
  }

  /**
   * 面会.
   */
  private registerMeetingObserver(officeUserId: string) {
    if (this.meetingReference) {
      return;
    }
    this.meetingReference = this.database.ref(`/user/${officeUserId}/meeting`);
    // // イベントの登録
    this.meetingReference.on(EventType.Value, (snapshot: DataSnapshot) => {
      let data: FirSideMenu;
      if (snapshot.exists()) {
        data = new FirSideMenu(snapshot.val());
      }
      this.meetings = [data];
      return this.sidemenuMessage.send(new SideMenu(SideMenuType.Meeting, this.meetings));
    });
  }

  /**
   * 院内グループ.
   */
  private registerInsideGroupObserver(officeUserId: string) {
    if (this.insideGroupReference) {
      return;
    }
    this.insideGroupReference = this.database.ref(`/user/${officeUserId}/insideGroup`);
    // イベントの登録
    this.registerEventListener(
      officeUserId,
      this.insideGroupReference,
      SideMenuType.InsideGroup,
      'groups',
      (data) => {
        this.insideGroups = data;
      },
    );
  }

  /**
   * 院外グループ.
   */
  private registerOutsideGroupObserver(officeUserId: string) {
    if (this.outsideGroupReference) {
      return;
    }
    this.outsideGroupReference = this.database.ref(`/user/${officeUserId}/outsideGroup`);
    // イベントの登録
    this.registerEventListener(
      officeUserId,
      this.outsideGroupReference,
      SideMenuType.OutsideGroup,
      'groups',
      (data) => {
        this.outsideGroups = data;
      },
    );
  }

  /**
   * 院内チャット.
   */
  private registerInsideChatObserver(officeUserId: string) {
    if (this.insideChatReference) {
      return;
    }
    this.insideChatReference = this.database.ref(`/user/${officeUserId}/insideChat`);
    // イベントの登録
    this.registerEventListener(
      officeUserId,
      this.insideChatReference,
      SideMenuType.InsideChat,
      'chats',
      (data) => {
        this.insideChats = data;
      },
    );
  }

  /**
   * 院外チャット.
   */
  private registerOutsideChatObserver(officeUserId: string) {
    if (this.outsideChatReference) {
      return;
    }
    this.outsideChatReference = this.database.ref(`/user/${officeUserId}/outsideChat`);
    // イベントの登録
    this.registerEventListener(
      officeUserId,
      this.outsideChatReference,
      SideMenuType.OutsideChat,
      'chats',
      (data) => {
        this.outsideChats = data;
      },
    );
  }

  /**
   * 一覧情報から詳細情報一覧を取得しイベント登録する.
   */
  private registerEventListener(officeUserId: string, ref: Reference, type: SideMenuType, path: string,
                                callback: (data: FirSideMenu[]) => void) {
    ref.on(EventType.Value, (snapshot: DataSnapshot) => {
      // 結果の確認
      if (!snapshot.exists()) {
        // 存在しない時
        this.sidemenuMessage.send(new SideMenu(type, []));
        return callback([]);
      }
      // IDの取得
      const ids: string[] = [];
      snapshot.forEach(child => {
        ids.push(child.val());
        return false;
      });
      // IDに紐付く全情報を取得する
      Observable.forkJoin(ids.map(id => this.findById(path, officeUserId, id ))).subscribe(data => {
        // save
        const list: FirSideMenu[] = data.filter((item) => item).reverse();

        // 未読数でソートする
        list.sort((s1, s2) => {
          if (s1.toUnseen !== s2.toUnseen) {
            return s2.toUnseen - s1.toUnseen;
          } else if (s1.unseenCount !== s2.unseenCount) {
            return s2.unseenCount - s1.unseenCount;
          }
          return s2.timestamp - s1.timestamp;
        });
        // Success
        this.sidemenuMessage.send(new SideMenu(type, list));
        // Callback
        callback(list);

      }, reason => {
        // Failure
        this.logger.warn(reason);
        // Callback
        callback([]);
      });
    });
  }

  /**
   * 任意の1件の情報を取得する.
   */
  private findById(path: string, officeUserId: string, id: string): Observable<FirSideMenu> {
    // Create observable
    return Observable.create(subscriber => {
      this.database.ref(`/user/${officeUserId}/${path}/${id}`).once(EventType.Value).then(snapshot => {
        // Success
        if (snapshot.exists()) {
          const model = new FirSideMenu(snapshot.val());
          model.id = id;
          const reference = this.database.ref(`/user/${officeUserId}/${path}/${id}`);
          reference.on(EventType.ChildChanged, ref => {
            model.updateData(ref.key, ref.val());
          });
          reference.on(EventType.ChildAdd, ref => {
            model.updateData(ref.key, ref.val());
          });
          reference.on(EventType.ChildRemoved, ref => {
            model.updateData(ref.key, '');
          });
          // reference.off();
          subscriber.next(model);
        } else {
          subscriber.next(null);
        }
        subscriber.complete();
      }).catch(reason => {
        // Failure
        subscriber.error(reason);
      });
    });
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
        this.logger.debug('*** Login subscription on sidemenu service');

      } else if (type === AuthenticationMessage.Type.Logout) {
        this.logger.debug('*** Logout subscription on sidemenu service');
        // stop monitor
        this.stopMonitoring();
        // clear data
        this.visibleAndOrders = [];
        this.meetings = [];
        this.insideGroups = [];
        this.outsideGroups = [];
        this.insideChats = [];
        this.outsideChats = [];
      }
    });
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
    // ログイン・ログアウト時
    if (this.authenticationSubscription) { this.authenticationSubscription.unsubscribe(); }
    this.authenticationSubscription = null;
    // Firebase準備完了時
    if (this.firebaseReadySubscription) { this.firebaseReadySubscription.unsubscribe(); }
    this.firebaseReadySubscription = null;
  }
}
