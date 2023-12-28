import {Injectable, OnDestroy} from '@angular/core';
import * as firebase from 'firebase/app';
import {environment} from '../../../environments/environment';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/concat';
import {JwtHelper} from 'angular2-jwt';
import {NGXLogger} from 'ngx-logger';
import {AuthenticationMessage, FirebaseReadyMessage} from '../message.service';
import {AuthenticationService} from '../authentication.service';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {Profile} from '../../common/profile';
import Database = firebase.database.Database;
import Storage = firebase.storage.Storage;

/**
 * Firebaseに関連する機能を提供するクラス.
 *
 * @author k.sumi 2017/09/19
 */
@Injectable()
export class FirebaseService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Subscriber
  private subscription: Subscription;
  // Jwt
  private jwtHelper: JwtHelper;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private http: Http,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private auth: AuthenticationService,
              private authMessage: AuthenticationMessage,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Prepare
  // --------------------------------------------------------------------------
  prepare() {
    this.logger.info('*** Initialize FirebaseService');
    // Jwt
    this.jwtHelper = new JwtHelper();
    // Loginin notify
    this.subscription = this.authMessage.get().subscribe((type) => {
      if (type === AuthenticationMessage.Type.Loginin) {
        // ログイン時
        this.subscribeLogin();
      } else if (type === AuthenticationMessage.Type.Logout) {
        // ログアウト時
        this.subscribeLogout();
      }
    });
    // Init firebase
    firebase.initializeApp(environment.firebase);
  }

  // Overrides
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Getter
  // --------------------------------------------------------------------------
  // Databaseクライアントの取得
  database(): Database {
    return firebase.database();
  }

  // Storageクライアントの取得
  storage(): Storage {
    return firebase.storage();
  }

  // 認証は終わっているか？
  isReady(): boolean {
    return firebase.auth().currentUser != null;
  }

  // Loginin subscription
  // --------------------------------------------------------------------------
  // ログイン時
  protected subscribeLogin() {
    this.logger.debug('*** Login subscription on firebase service');
  }

  // ログアウト時
  protected  subscribeLogout() {
    this.logger.debug('*** Logout subscription on firebase service');
    this.clearAccessToken().subscribe(ok => {
      if (!ok) {
        this.logger.warn('*** Failed clear firebase auth token');
      }
    }, cause => {
      this.logger.warn('*** Failed clear firebase auth token: ', cause);
    });
  }

  // AccessToken
  // --------------------------------------------------------------------------
  refreshAccessToken(): Observable<boolean> {
    let api = '/uaa/fb/access/token';
    if (environment.profile === Profile.local) {
      api = environment.authApi + api;
    }
    return Observable.create((subscriber) => {
      this.http.get(api).subscribe((res: Response) => {
        this.logger.debug('*** firebase access token: ', res.text());

        firebase.auth().signInWithCustomToken(res.text()).then(() => {
          // expire
          const date = this.jwtHelper.getTokenExpirationDate(res.text());
          this.scheduleRefreshToken(date);
          // complete
          subscriber.next(true);
          subscriber.complete();
        }).catch((error) => {
          subscriber.error(error);
        });
      }, (error) => {
        subscriber.error(error);
      });
    });
  }

  clearAccessToken(): Observable<boolean> {
    return Observable.create(subscriber => {
      firebase.auth().signOut().then(() => {
        subscriber.next(true);
        subscriber.complete();
      }).catch(reason => {
        subscriber.error(reason);
      });
    });
  }

  // Refresh token schedule
  // --------------------------------------------------------------------------
  private scheduleRefreshToken(initialInterval: number | Date = 0) {
    this.logger.info('## Initial interval=', initialInterval);

    TimerObservable.create(initialInterval).subscribe(() => {
      this.refreshAccessToken().subscribe(name => {
        this.logger.info('### Refresh firebase access token=', name);
      }, () => {
        this.scheduleRefreshToken(5000);
      });
    });
  }
}
