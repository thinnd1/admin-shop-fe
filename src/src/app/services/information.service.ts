import {Injectable, OnDestroy} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {SoundService} from './sound.service';
import {FirebaseStorage} from './firebase/firebase.storage';
import {NGXLogger} from 'ngx-logger';
import {FirebaseDatabase} from './firebase/firebase.database';
import {AuthenticationMessage, FirebaseReadyMessage} from './message.service';
import {SharedValueService} from './shared-value.service';
import {FirUserInformation} from '../models/firebase/fir.user.information';
import {JsonConvert} from 'json2typescript';
import {Observable} from 'rxjs/Observable';
import {FirInformation} from '../models/firebase/fir.information';
import {Subscription} from 'rxjs/Subscription';
import {isNullOrUndefined} from 'util';
import Reference = firebase.database.Reference;
import EventType = FirebaseDatabase.EventType;

/**
 * お知らせサービス.
 */
@Injectable()
export class InformationService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // お知らせ情報
  public data: FirInformation[][] = [];
  // 一週間分のお知らせIDリスト
  private informations: FirUserInformation[] = [];
  // Subscription
  private subscription: Subscription;
  // Database reference
  private reference: Reference = null;
  // Before one week date
  private beforeOneweekDate: number;
  // 初回ロード
  public isFirst = true;

  // Class metehods
  // --------------------------------------------------------------------------
  /**
   * 1週間前の日付を取得する.
   */
  private static createBeforeOneWeekDate(): number {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  /**
   * 年月日が同じか確認する.
   */
  private static isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate();
  }

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

  // Public methods
  // --------------------------------------------------------------------------
  /**
   * 未読数を取得します.
   *
   * @returns {number} 総未読件数
   */
  unseenCount(): number {
    return this.informations.filter(data => !data.read).length;
  }

  /**
   * お知らせ情報を取得します.
   * <p>日付毎の配列</p>
   *
   * @returns {FirInformation[][]} お知らせ情報リスト
   */
  objects(): FirInformation[][] {
    return this.data;
  }

  /**
   * 全てのお知らせを既読にします.
   */
  seenAll() {
    this.seen(this.informations.map(data => data.id));
  }

  /**
   * お知らせを既読にします.
   *
   * @param {string[]} ids お知らせIDリスト
   */
  seen(ids: string[]) {
    if (ids.length === 0) {
      return;
    }
    // オフィスユーザーID
    const officeUserId = this.shared.getUserSession().officeUserId;
    // DBパスを作成する
    const updates = {};
    ids.forEach(id => {
      if (id) {
        updates[`/user/${officeUserId}/information/${id}/read`] = true;
      }
    });
    // データを更新する
    if (0 < Object.keys(updates).length) {
      this.database.ref().update(updates).catch(reason => {
        this.logger.error(`*** error update information seen, ${reason}`);
      });
    }
  }

  // Prepare
  // --------------------------------------------------------------------------
  public prepare() {
    if (this.reference) {
      return;
    }

    // １週間前の日時
    this.beforeOneweekDate = InformationService.createBeforeOneWeekDate();
    // Subscription登録
    this.registerSubscription();
    // お知らせを取得し、監視を開始する
    this.startMonitoring();
  }

  // Destroy
  // --------------------------------------------------------------------------
  // @Override
  ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * 情報の破棄等を行う.
   */
  private dispose() {
    // Firebase開始停止
    this.unregisterFirebaseObserver();
    // ログアウト通知停止
    this.unregisterSubscription();
    // データリセット
    this.data = [];
    this.informations = [];
  }

  // Firebase database
  // --------------------------------------------------------------------------
  /**
   * 過去１週間分のお知らせ情報を全て取得する.
   *
   * @param {string} officeUserId オフィスユーザーID
   */
  // TODO: 起動時に過去１週間分のお知らせを全件取得しているが、起動パフォーマンスに大きな影響を与える時は調整する
  private fetchUserInformation(officeUserId: string, retry?: number) {
    // DBパス
    this.reference = this.database.ref(`/user/${officeUserId}/information`);

    // 過去１週間分のお知らせの取得
    this.reference.orderByChild('sentAt').
    startAt(this.beforeOneweekDate).
    once(EventType.Value).
    then(snapshot => {
      const jsonConverter = new JsonConvert();
      const array: FirUserInformation[] = [];
      // モデルに変換する
      snapshot.forEach(child => {
        const data = jsonConverter.deserialize(child.val(), FirUserInformation);
        data.id = child.key;
        array.push(data);
      });
      // 結果を逆順にして保持する
      this.informations = array.reverse();
      // @Logger
      this.logger.info('*** data=', this.informations);
      // お知らせ情報更新の監視を開始する
      this.registerFirebaseObserver();
      // お知らせ件数の確認
      if (this.informations.length === 0) {
        // 存在しない時
        this.isFirst = false;
        return;
      }
      // お知らせ詳細を取得して保持する
      // this.fetchInformation(this.informations.map(data => data.id)).subscribe(data => {
      this.fetchInformation(this.informations).subscribe(data => {
        this.data = this.makePerSentDate(data);
        // @Logger
        this.logger.info('*** info data=', this.data);
        this.isFirst = false;
      });
    }).catch(reason => {
      this.logger.error(`*** ${reason}`);

      let retryVal = retry ? retry : 0;
      if (retryVal < 3) {
        setTimeout(() => {
          this.fetchUserInformation(officeUserId, ++retryVal);
        }, 1000)
      }
    });
  }

  /**
   * 取得したお知らせ情報を日付毎の配列にする.
   */
  private makePerSentDate(array: FirInformation[]): FirInformation[][] {
    if (array.length === 0) {
      return [];
    }
    // 日付毎にした配列
    const results: FirInformation[][] = [];
    let perdate: FirInformation[] = [];

    let date: Date;
    array.forEach(data => {
      if (!isNullOrUndefined(date)
          && !InformationService.isSameDate(data.sentAt, date)) {
        results.push(perdate);
        perdate = [];
      }
      perdate.push(data);
      date = data.sentAt;
    });
    if (0 < perdate.length) {
      results.push(perdate);
    }
    return results;
  }

  /**
   * お知らせ詳細情報を取得する.
   */
  // private fetchInformation(ids: string[]): Observable<FirInformation[]> {
  private fetchInformation(infos: FirUserInformation[]): Observable<FirInformation[]> {
    if (infos.length === 0) {
      return;
    }

    // 取得するお知らせ情報のObservableを作成
    const observers = infos.map(info => {
      return Observable.create(subscriber => {
        // お知らせの取得
        this.database.ref(`/information/${info.id}`).once(EventType.Value).then(snapshot => {
          if (snapshot.exists()) {
            // お知らせが存在する時
            const data = new JsonConvert().deserialize(snapshot.val(), FirInformation);
            data.id = info.id;
            data.read = info.read;
            subscriber.next(data);
            subscriber.complete();
          } else {
            this.logger.warn(`specified information does not exist, id=${info.id}`);
          }
        });
      });
    });
    return Observable.create(subscriber => {
      // 結合して全て取得する
      Observable.forkJoin(observers).subscribe(data => {
        // データ取得完了
        subscriber.next(data);
      }, error => {
        this.logger.error(`*** error fetch information, ${error}`);
        subscriber.error(error);
      }, () => {
        subscriber.complete();
      });
    });
  }

  /**
   * イベント監視を登録する.
   */
  private registerFirebaseObserver() {
    // 追加イベントの監視
    this.registerAddictionEvent();
    // 更新イベントの監視
    this.registerUpdateEvent();
  }

  /**
   * 追加イベントの監視を開始する.
   */
  private registerAddictionEvent() {
    this.reference.on(EventType.ChildAdd, snapshot => {
      // デシリアライズ
      const model = new JsonConvert().deserialize(snapshot.val(), FirUserInformation);
      model.id = snapshot.key;

      this.logger.debug('*** add information: ', model);

      // 存在、日時の確認
      if (0 <= this.indexOf(model) || model.sentAt < this.beforeOneweekDate) {
        // 存在するまたは１週間以上前の情報の時
        return;
      }
      this.fetchNewInformation(model, false);
    });
  }

  /**
   * 更新イベントの監視を開始する.
   */
  private registerUpdateEvent() {
    this.reference.on(EventType.ChildChanged, snapshot => {
      this.logger.info('##### info data: ', this.informations);
      // デシリアライズ
      const model = new JsonConvert().deserialize(snapshot.val(), FirUserInformation);
      model.id = snapshot.key;
      this.logger.debug('*** update information: ', model);
      // 日時の確認
      if (model.sentAt < this.beforeOneweekDate) {
        return;
      }
      const idx = this.indexOf(model);

      if (0 <= idx) {
        this.informations[idx].read = model.read;
        // 送信日に更新はあるか
        if (this.informations[idx].sentAt.getTime() === model.sentAt.getTime()) {
          // 既読情報の更新のみの時
          return;
        }
        // 送信日の更新
        this.informations[idx].sentAt = model.sentAt;
      }
      // ソートし直す
      this.informations.sort((o1, o2) => {
        return o2.sentAt.getTime() - o1.sentAt.getTime();
      });

      // 更新された情報が既に存在する時は一旦削除する
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].length; j++) {
          if (this.data[i][j].id === model.id) {
            this.data[i].splice(j, 1);
            break;
          }
        }
      }
      // 更新された情報を取得する
      this.fetchNewInformation(model, true);
    });
  }

  /**
   * お知らせ詳細情報を取得してデータを更新する.
   */
  private fetchNewInformation(model: FirUserInformation, update: boolean) {
    this.fetchInformation([model]).subscribe(array => {
      if (array.length !== 1) {
        return;
      }
      // データ追加
      if (!update) {
        this.informations.unshift(model);
      }
      // 新規お知らせ情報
      const information = array[0];
      // 最終日時
      const date = 0 < this.data.length ? this.data[0][0].sentAt : null;
      // 結果の追加
      if (!isNullOrUndefined(date) && InformationService.isSameDate(date, array[0].sentAt)) {
        this.data[0].unshift(information);
      } else {
        this.data.unshift([information]);
      }
      // @Logger
      this.logger.info('*** info data=', this.informations);
      this.logger.info('*** into data=', this.data);
    });
  }

  /**
   * イベント監視を停止する.
   */
  private unregisterFirebaseObserver() {
    if (this.reference) {
      this.reference.off();
    }
    this.reference = null;
  }

  // Monitoring
  // --------------------------------------------------------------------------
  /**
   * お知らせ情報の監視を開始する.
   */
  private startMonitoring() {
    this.logger.info('*** starting information monitoring');
    // ユーザーセッション情報
    const session = this.shared.getUserSession();
    if (!session) {
      this.shared.fetchUserSession().subscribe(ok => {
        if (ok) {
          this.fetchUserInformation(this.shared.getUserSession().officeUserId);
        }
      });
    } else {
      this.fetchUserInformation(session.officeUserId);
    }
  }

  // Observers
  // --------------------------------------------------------------------------
  /**
   * ログアウト通知を登録する.
   */
  private registerSubscription() {
    this.subscription = this.authenticationMessage.get().subscribe(type => {
      if (type === AuthenticationMessage.Type.Logout) {
        // ログアウト時
        this.dispose();
      }
    });
  }

  /**
   * ログアウト通知を解除する.
   */
  private unregisterSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = null;
  }

  // Helper
  // --------------------------------------------------------------------------
  private indexOf(data: FirUserInformation): number {
    return this.informations.findIndex(information => {
      return information.id === data.id;
    });
  }
}
