import {Injectable, OnDestroy} from '@angular/core';
import {FirebaseService} from './firebase/firebase.service';
import {SharedValueService} from './shared-value.service';
import {Observable} from 'rxjs/Observable';
import {NGXLogger} from 'ngx-logger';
import {NotificationService} from './notification.service';
import {AuthenticationMessage, FirebaseReadyMessage} from './message.service';
import {SideMenuService} from './sidemenu.service';
import {Subscription} from 'rxjs/Subscription';
import {isNullOrUndefined} from 'util';
import {environment} from '../../environments/environment';
import {Product, Profile} from '../common/profile';
import {DrjoyInformationService} from './drjoy.information.service';
import {UserService} from "./user.service";
import {Router} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {UnseenService} from "./unseen.service";

/**
 * @author k.sumi 2018/02/25
 */
@Injectable()
export class PreLoginService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // ログアウト時の通知
  private logoutSubscription: Subscription;
  // 処理済みフラグ
  private processed: boolean;
  // ロックオブジェクト
  private lock: any;

  // Helper
  // --------------------------------------------------------------------------
  private static emptyObserver(): Observable<boolean> {
    return Observable.create(subscriber => {
      subscriber.next(true);
      subscriber.complete();
    });
  }

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private shared: SharedValueService,
              private firebase: FirebaseService,
              private notification: NotificationService,
              private unseenService: UnseenService,
              private sidemenu: SideMenuService,
              private authenticationMessage: AuthenticationMessage,
              private firebaseReadyMessage: FirebaseReadyMessage,
              private drjoyInformation: DrjoyInformationService,
              private userService: UserService,
              private logger: NGXLogger,
              private router: Router,
              private authenticationService: AuthenticationService) {
    this.registerObserver();
  }

  // Methods
  // --------------------------------------------------------------------------
  /**
   * 起動時に必要な処理を行う.
   */
  prepare( authority: string): Observable<boolean> {
    if (this.processed || !isNullOrUndefined(this.lock)) {
      return PreLoginService.emptyObserver();
    }
    this.lock = {};

    // ログイン通知
    this.authenticationMessage.send(AuthenticationMessage.Type.Loginin);

    // 処理対象
    const observables = [this.shared.fetchUserSession()];
    if (environment.profile !== Profile.mock) {
      observables.push(this.firebase.refreshAccessToken());
    }
    // Observableの作成
    return Observable.create(subscriber => {
      Observable.combineLatest(observables).subscribe(value => {
        this.logger.debug('*** ok: ', value);

      }, error => {
        this.lock = null;
        // FIXME: エラー処理を入れる
        subscriber.error(error);

      }, () => {
        this.logger.debug('*** Complete preLogin');
        // Update flag
        this.processed = true;
        // Notify message
        this.firebaseReadyMessage.send(true);
        this.lock = null;
        // Complete
        const userSession = this.shared.getUserSession();
        switch (authority) {
          case 'auth' :
            subscriber.next(true);
            subscriber.complete();
            break;
          case 'superAdmin':
            subscriber.next(userSession.managementAuthority === 'MP_1' && userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'admin':
            subscriber.next((userSession.managementAuthority === 'MP_1' || userSession.managementAuthority === 'MP_2')
              && userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'isValid':
            subscriber.next(userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'isProvisional':
            subscriber.next(userSession.accountStatus.isProvisional);
            subscriber.complete();
            break;
          case 'isMediator':
            subscriber.next(userSession.funcAuthority.FP_7);
            subscriber.complete();
            break;
          case 'personalVerify':
            subscriber.next(!userSession.verificationFlag);
            subscriber.complete();
            break;
          case 'identify':
            subscriber.next(!userSession.identifyStatus);
            subscriber.complete();
            break;
          case 'personal':
            subscriber.next(!userSession.personalFlag);
            subscriber.complete();
            break;
          case 'pharmacy':
            subscriber.next((userSession.funcAuthority.FP_9 || userSession.funcAuthority.FP_8)
              && userSession.accountStatus.isValid && userSession.officeType.MEDICAL);
            subscriber.complete();
            break;
          case 'adminpharmacy':
            subscriber.next(userSession.funcAuthority.FP_8 && userSession.accountStatus.isValid
              && userSession.accountStatus.isValid && userSession.officeType.MEDICAL);
            subscriber.complete();
            break;
          case 'pharmacy_drugstore':
            subscriber.next((userSession.funcAuthority.FP_9 || userSession.funcAuthority.FP_8)
              && userSession.accountStatus.isValid && userSession.officeType.DRUG_STORE);
            subscriber.complete();
            break;
          case 'adminpharmacy_drugstore':
            subscriber.next(userSession.funcAuthority.FP_8 && userSession.accountStatus.isValid
              && userSession.accountStatus.isValid && userSession.officeType.DRUG_STORE);
            subscriber.complete();
            break;
          default :
            this.router.navigate(['NotFound'], {replaceUrl: true});
            subscriber.next(false);
        }
      });
    });
  }

  canActiveAuthority(authority: string, url: string): boolean | Observable<boolean> {
    if (this.shared.isLoggedIn()) {
      return this.prepare(authority).map(res => {
        if (res) {
          return true;
        } else if (authority === 'personalVerify') {
          this.router.navigate(['re/re0034'], {replaceUrl: true});
          return false;
        } else if (authority === 'identify') {
          this.router.navigate(['re/re0032'], {replaceUrl: true});
          return false;
        } else {
          this.router.navigate(['NotFound'], {replaceUrl: true});
          return false;
        }
      });
    } else {
      this.authenticationService.redirectUrl = url;
      this.router.navigate(['/logout']);
    }
  }
  // OnDestroy
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
    this.logoutSubscription = null;
  }

  // Subscription
  // --------------------------------------------------------------------------
  private registerObserver() {
    this.logoutSubscription = this.authenticationMessage.get().subscribe(type => {
      if (type === AuthenticationMessage.Type.Logout) {
        this.processed = false;
      }
    });
  }
}
