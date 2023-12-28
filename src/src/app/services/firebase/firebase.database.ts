import {FirebaseService} from './firebase.service';
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import * as firebase from 'firebase';
import {SharedValueService} from '../shared-value.service';
import {NGXLogger} from 'ngx-logger';
import {Observable} from 'rxjs/Observable';
import {FirBase} from '../../models/gr/firebase/fir.base';
import {JsonConvert} from 'json2typescript';
import Database = firebase.database.Database;
import DataSnapshot = firebase.database.DataSnapshot;
import Query = firebase.database.Query;
import Reference = firebase.database.Reference;

/**
 * Firebase database.
 */
@Injectable()
export class FirebaseDatabase implements OnDestroy {

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private fb: FirebaseService,
              private shared: SharedValueService,
              private logger: NGXLogger, private zone: NgZone) {
    this.initialize();
  }


  // Overrideed
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
  }


  // Wrapper
  // --------------------------------------------------------------------------
  ref(path?: string): Reference {
    return this.database().ref(path);
  }


  // Operation
  // --------------------------------------------------------------------------
  fetchOne<T extends FirBase>(cls: new() => T, path: string): Observable<T> {
    return Observable.create(subscriber => {
      const ref = this.database().ref(path);
      ref.once(FirebaseDatabase.EventType.Value).then((snapshot: DataSnapshot) => {
          let data: T = null;
          if (snapshot.hasChildren()) {
            data = new JsonConvert().deserialize(snapshot.val(), cls);
            data.id = snapshot.key;
          }
          subscriber.next(data);
          subscriber.complete();
      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }

  fetch<T extends FirBase>(cls: new() => T, path: string): Observable<T[]> {
    return Observable.create(subscriber => {
      const ref = this.database().ref(path);
      const converter = new JsonConvert();
      ref.once(FirebaseDatabase.EventType.Value).then((snapshot: DataSnapshot) => {
          const array: T[] = [];
          if (snapshot.hasChildren()) {
            snapshot.forEach(child => {
              const data = converter.deserialize(child.val(), cls);
              data.id = child.key;
              array.push(data);
              return false;
            });
          }
          subscriber.next(array);
          subscriber.complete();

      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }

  fetchSnapshot(path: string): Observable<DataSnapshot> {
    return Observable.create(subscriber => {
      const ref = this.database().ref(path);
      ref.once(FirebaseDatabase.EventType.Value).then((snapshot: DataSnapshot) => {
        subscriber.next(snapshot);
        subscriber.complete();

      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }

  set(path: string, data: any): Observable<void> {
    return Observable.create(subscriber => {
      this.database().ref(path).set(data).then(() => {
        subscriber.next();
        subscriber.complete();

      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }

  update(data: any): Observable<void> {
    return Observable.create(subscriber => {
      this.database().ref().update(data).then(() => {
        subscriber.next();
        subscriber.complete();

      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }


  // Pager
  // --------------------------------------------------------------------------
  /**
   * 指定された値から指定された件数分のデータを昇順で取得します.
   *
   * @param {T} cls クラス
   * @param {string} path 対象パス
   * @param {string} from [optional] 開始位置の値
   * @param {string} orderby [optional] ソート値(指定がない場合はキー)
   * @param {number} limit [optional] 取得最大件数(default=10)
   * @returns {Observable<DataSnapshot>}
   */
  pagerStartAt<T extends FirBase>(cls: new() => T, path: string, from?: string,
                                  orderby?: string, limit = 10): Observable<T[]> {
    // reference
    const ref = this.database().ref(path);
    // query
    let query: Query;

    // order by
    if (orderby) {
      query = ref.orderByChild(orderby);
    } else {
      query = ref.orderByKey();
    }
    // offset
    if (from) {
      query = query.startAt(from);
    }
    // limit
    query = query.limitToFirst(from ? limit + 1 : limit);

    // observable
    return this.newPagerObservable(cls, query, true, from);
  }

  /**
   * 指定された値から指定された件数分のデータを降順で取得します.
   *
   * @param {T} cls クラス
   * @param {string} path 対象パス
   * @param {string} from [optional] 開始位置の値
   * @param {string} orderby [optional] ソート値(指定がない場合はキー)
   * @param {number} limit [optional] 取得最大件数(default=10)
   * @returns {Observable<DataSnapshot>}
   */
  pagerLastAt<T extends FirBase>(cls: new() => T, path: string, from?: string,
                                 orderby?: string, limit = 10): Observable<T[]> {
    // reference
    const ref = this.database().ref(path);
    // query
    let query: Query;

    // order by
    if (orderby) {
      query = ref.orderByChild(orderby);
    } else {
      query = ref.orderByKey();
    }
    // offset
    if (from) {
      query = query.endAt(from);
    }
    // limit
    query = query.limitToLast(from ? limit + 1 : limit);

    // observable
    return this.newPagerObservable(cls, query, false, from);
  }


  // Initializer
  // --------------------------------------------------------------------------
  private initialize() {
    this.logger.debug('*** Initialize firebase database service');
  }


  // Helper
  // --------------------------------------------------------------------------
  private database(): Database {
    return this.fb.database();
  }

  private newPagerObservable<T>(cls: new() => T, query: Query, isFirst: boolean,
                                                fromValue?: string): Observable<T[]> {
    return Observable.create(subscriber => {
      query.once(FirebaseDatabase.EventType.Value).then((snapshot: DataSnapshot) => {
        const converter = new JsonConvert();
        const array: T[] = [];

        snapshot.forEach((child) => {
          if (fromValue && child.key === fromValue) {
            return false;
          }
          const data = converter.deserialize(child.val(), cls);
          data.id = child.key;
          array.push(data);

          return false;
        });
        subscriber.next(isFirst ? array : array.reverse());
        subscriber.complete();

      }).catch((error) => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }
}

/**
 * FirebaseDatabase namespace.
 */
export namespace FirebaseDatabase {
  /**
   * Firebase realtime database event type.
   */
  export enum EventType {
    ChildAdd = 'child_added',
    ChildChanged = 'child_changed',
    ChildRemoved = 'child_removed',
    Value = 'value',
  }
}
