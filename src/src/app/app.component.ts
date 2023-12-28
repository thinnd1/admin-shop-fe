import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {SharedValueService} from './services/shared-value.service';
import {DialogService} from './services/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {DOCUMENT} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {UserSession} from './models/ba/user-session';
import {CmsService} from './services/cms.service';
import {DrjoyInfoAlert} from './models/cm/drjoy-info-alert';
import {Subscription} from 'rxjs/Rx';
import {DrjoyInfoAlertMessage} from './services/message.service';
import {environment} from '../environments/environment';
import {Product} from './common/profile';
import {OfficeInfoAlert} from './models/cm/office-info-alert';
import {WsService} from './services/stomp/ws.service';
import {LocalStorage} from './services/local-storage.service';
import {AuthenticationService} from './services/authentication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private userSession: UserSession;
  private subscriber: Subscription = null;
  private cmpopupText;
  public url: string;
  private first = true;

  constructor(
    private translate: TranslateService,
    private sharedValue: SharedValueService,
    public dialogService: DialogService,
    private drjoyInfoAlertMessage: DrjoyInfoAlertMessage,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    @Inject(DOCUMENT) private document,
    private cmsService: CmsService,
    private localStorage: LocalStorage,
    private authService: AuthenticationService,
    private wsService: WsService
  ) {
    translate.onLangChange.map(x => x.lang).subscribe(lang => {
      this.document.documentElement.lang = lang;
    });
    const userLang = navigator.language.split('-')[0];
    const lang = /(en|ja)/gi.test(userLang) ? 'ja' : 'ja';
    translate.setDefaultLang(lang);
    translate.use(lang);
    sharedValue.lang = lang;

    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;

        // #15522: scroll to top on NavigationEnd
        window.scrollTo(0, 0);

        if (this.sharedValue.isLoggedIn()) {
          this.userSession = this.sharedValue.getUserSession();

          // 強制リロード（userSession再読込）
          const authTokenType = environment.app === Product.Drjoy ? 'dr_auth_token' : 'pr_auth_token';
          const authToken = this.localStorage.getObject(authTokenType);
          if (authToken && this.userSession) {
            const authentication = this.authService.toAuthenticationModel(authToken.access_token);
            if (authentication.office_user_id !== this.userSession.officeUserId) {
              this.router.navigated = false;
              location.href = this.url;
            }
          }

          // 個人登録の際に「院外グループ」を「グループ」に変更
          if (this.userSession && this.userSession.personalFlag && lang === 'ja') {
            const i18n = require('../assets/i18n/personal-ja.json');
            this.translate.setTranslation(lang, i18n, true);
          }
        }

        // TODO: 情報確認用 あとで削除
        console.log('**** UserSession ****', this.sharedValue.getUserSession());

        // Set Document Title
        let title = 'DOC_TITLE.';
        if (this.url === '/') {
          title += 'TOP_PAGE';
        } else if (this.url) {
          const result = this.url.replace(/(\?|\#).*$/, '').split('/').filter(e => Boolean(e));
          if (result.length > 0) {
            title += result[result.length - 1].replace(/-/g, '_').toUpperCase();
          }
        }
        this.translate.get(title).subscribe(response => {
          if (title !== response) {
            this.titleService.setTitle(response);
          }
        });

        // zendesk chat set
        this.checkZopimView().then((result) => {
          if (result) {
            if (this.sharedValue.isLoggedIn()) {
              this.userSession = this.sharedValue.getUserSession();
              if (this.userSession) {
                this.setZopim();
              }
            } else {
              this.userSession = null;
              this.clearZopim();
            }
          } else {
            this.hideZopim();
          }
        });

        // office info alert
        if (this.sharedValue.isLoggedIn()) {
          if (this.first) {
            // Dr.JOYからのお知らせを表示しない
            if (
              this.url === '/cm/cm0000dr' ||
              this.url === '/cm/cm0000pr' ||
              this.url === '/me/me5002/invoice' ||
              this.url === '/me/me5002/receipt' ||
              this.url.match(/^\/re\/re0006(.*?)\//) ||
              this.url === '/re/re0013' ||
              this.url === '/re/re0022' ||
              this.url === '/re/re0032'
            ) {
              return false;
            }

            this.translate.get('CMPOPUP').mergeMap((res) => {
              this.cmpopupText = res;
              if (res) {
                if ((<any>$('#theModal')).is(':visible')) {
                  (<any>$('#theModal')).modal('hide');
                }
                return this.cmsService.getOfficeInfoPopup();
              }
            }).subscribe((res: OfficeInfoAlert) => {
              this.first = false;
              if (res && res.officeInfo) {
                let body = res.officeInfo.title;
                if (res.unseen > 1) {
                  body += '\n' + this.cmpopupText.UNSEEN + (res.unseen - 1) + this.cmpopupText.SUFFIX;
                }
                this.dialogService
                  .showMessage(null, true, 'CMPOPUP.TITLE_OFFICE', body, null, 'MSG.OK', null)
                  .subscribe((r) => {
                    if (r.isOk()) {
                      this.cmsService.putOfficeInfoRead([res.officeInfo.id]).subscribe();
                      if (environment.app === Product.Drjoy) {
                        this.router.navigate(['/cm/cm0005']);
                      } else {
                        this.router.navigate(['/cm/cm0008']);
                      }
                    }
                  });
              }
            });
          }
        } else {
          this.first = true;
        }
      }
    });

  }

  ngOnInit() {

    // Drjoy Info Alert
    this.subscriber = this.drjoyInfoAlertMessage.get()
      .subscribe((res: DrjoyInfoAlert) => {

        if (
          this.url === '/cm/cm0000dr' ||
          this.url === '/cm/cm0000pr' ||
          this.url === '/me/me5002/invoice' ||
          this.url === '/me/me5002/receipt' ||
          this.url.match(/^\/re\/re0006(.*?)\//) ||
          this.url === '/re/re0032' ||
          this.url === '/re/re0013' ||
          this.url === '/re/re0022' ||
          // 仮登録中は通知をださない
          this.userSession.accountStatus.isProvisional
        ) {
          return false;
        }

        if ((<any>$('#theModal')).is(':visible')) {
          (<any>$('#theModal')).modal('hide');
        }
        this.dialogService
          .showMessage(null, true, 'CMPOPUP.TITLE', res.drjoyInfo.title, null, 'MSG.OK', null)
          .subscribe((r) => {
            this.cmsService.putDrInfoRead([res.drjoyInfo.id]).subscribe();
            if (r.isOk()) {
              // if (environment.app === Product.Drjoy) {
              //   this.router.navigate(['/cm/cm0001']);
              // } else {
              //   this.router.navigate(['/cm/cm0007']);
              // }

              (<any>$('#theModal')).modal('hide');
            }
          });
      });

    // modal option
    (<any>$(this.document))
      .on('show.bs.modal', '.modal', () => {
        const scrollbarWidth = (<any>window).innerWidth - (<any>$(window)).width();
        $('body').css({'overflow-y': 'hidden', 'padding-right': scrollbarWidth + 'px'});
        $('.navbar-global').css({'margin-right': scrollbarWidth + 'px'});
        this.pauseMedia();
      }).on('hidden.bs.modal', '.modal', () => {
        $('body').css({'overflow-y': 'scroll', 'padding-right': ''});
        $('.navbar-global').css({'margin-right': ''});
        this.pauseMedia();
      });

    (<any>$(window)).on('popstate', (e) => {
      if ((<any>$('#theModal')).is(':visible')) {
        (<any>$('#theModal')).modal('hide');
      }
    });

  }

  pauseMedia() {
    const mediaList = this.document.querySelectorAll('video, audio');
    const media = Array.prototype.slice.call(mediaList, 0);
    if (media) {
      media.forEach(function (elem) {
        elem.pause();
      });
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
    if (this.wsService.isConnected()) {
      this.wsService.unsubscribe();
      this.wsService.onDisconnect();
    }
  }

  // zendeskにnameなどをセット
  setZopim() {
    if (this.isZopim()) {
      const zopimName = this.userSession.lastName + ' ' + this.userSession.firstName + ' (' + this.userSession.deptName + ') (' + this.userSession.officeName + ')';
      const zopimMail = this.userSession.email;
      (<any>window).$zopim(() => {
        (<any>window).$zopim.livechat.setName(zopimName);
        (<any>window).$zopim.livechat.setEmail(zopimMail);
        (<any>window).$zopim.livechat.button.show();
      });
    }
  }

  // zendeskにnameなどをクリア
  clearZopim() {
    if (this.isZopim()) {
      (<any>window).$zopim(() => {
        (<any>window).$zopim.livechat.clearAll();
      });
    }
  }

  // zendeskをhide
  hideZopim() {
    if (this.isZopim()) {
      (<any>window).$zopim(() => {
        (<any>window).$zopim.livechat.hideAll();
      });
    }
  }

  // zendeskを確認
  isZopim(): boolean {
    if ((<any>window).$zopim) {
      return true;
    }
    return false;
  }

  // zendeskを表示するか確認
  async checkZopimView(): Promise<boolean> {
    // iosとAndroidは起動しない
    if (
      (<any>window).navigator.userAgent.indexOf('iPhone') !== -1 ||
      (<any>window).navigator.userAgent.indexOf('Android') !== -1 ||
      this.url === '/me/me5002/invoice' ||
      this.url === '/me/me5002/receipt'
    ) {
      return false;
    }
    // offline
    if (this.isZopim()) {
      const result = await new Promise((resolve) => {
        (<any>window).$zopim.livechat.setOnStatus((s) => {
          if (s === 'offline') {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
      return <boolean>result;
    } else {
      return false;
    }
  }

}
