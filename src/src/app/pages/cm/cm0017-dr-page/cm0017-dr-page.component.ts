import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedValueService } from '../../../services/shared-value.service';
import { SideMenuService } from '../../../services/sidemenu.service';
import { SideMenuMessage, SideMenuOrderMessage, SideMenuType } from '../../../services/message.service';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cm0017-dr-page',
  templateUrl: './cm0017-dr-page.component.html',
  styleUrls: ['./cm0017-dr-page.component.scss']
})
export class Cm0017DrPageComponent implements OnInit {

  public target: string;
  sideMenuSubscription: Subscription;
  sideMenuOrderSubscription: Subscription;
  public sideMenu: any[] = [];
  public sideMenuOrder: any[];
  public sideMenuVisible: object = {};
  public title: string;
  private tmpPool = [];
  userSession;

  constructor(
    private translate: TranslateService,
    private sharedValueService: SharedValueService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sidemenuOrderMessage: SideMenuOrderMessage,
    private sidemenuMessage: SideMenuMessage,
    private sidemenu: SideMenuService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    const self = this;
    this.userSession = this.sharedValueService.getUserSession();
    if (! this.userSession) {
      return;
    }

    this.activatedRoute.params.subscribe((params: Params) => {
      switch (params['target']) {
        case 'insideGroup':
        case 'outsideGroup':
        case 'insideChat':
        case 'outsideChat':
          this.target = params['target'];

          this.title = this.manualUppercase(this.target.replace(/([a-z])([A-Z])/g, '$1_$2'));
          this.title = this.translate.instant('CM0017DR.TITLE.' + this.title);
          this.titleService.setTitle(this.title);

          // =================
          // サイドメニュー情報取得
          let orders = this.sidemenu.getVisibleAndOrders();
          let data = this.sidemenu.reuseObjects();
          this.sideMenuOrderSubscription = this.sidemenuOrderMessage.get().subscribe(res => {
            this.sideMenuOrder = res;
            this.sideMenuVisible = {};
            this.sideMenuOrder.forEach(key => {
              this.sideMenuVisible[key] = true;
            });
            orders = this.sidemenu.getVisibleAndOrders();
            data = this.sidemenu.reuseObjects();
            this.getData(this.sideMenuOrder, data);
            this.tmpPool.forEach(function (val) {
              self.onChengedSidemenu(val);
            });
            this.tmpPool = [];
          });
          if (orders !== undefined) {
            this.getData(orders, data);
          }
          this.sideMenuSubscription = this.sidemenuMessage.get().subscribe(res => {
            if (this.sideMenuOrder === undefined) {
              this.tmpPool.push(res);
              return;
            }
            this.onChengedSidemenu(res);
          });
          // =================
          break;
        default:
          this.router.navigate(['/NotFound'], { replaceUrl: true });
          break;
      }
    });
  }

  manualUppercase(s: string): string {
    return s.replace(/[a-z]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) & ~32); });
  };

  onChengedSidemenu(res: any) {
    switch (res.type) {
      case SideMenuType.InsideGroup:
        this.setData('insideGroup', res);
        break;
      case SideMenuType.OutsideGroup:
        this.setData('outsideGroup', res);
        break;
      case SideMenuType.InsideChat:
        this.setData('insideChat', res);
        break;
      case SideMenuType.OutsideChat:
        this.setData('outsideChat', res);
        break;
      default:
        break;
    }
  }

  getData(orders: string[], data: any) {
    if (typeof orders === 'undefined' || orders.length === 0) {
      return;
    }

    this.sideMenuOrder = orders;
    this.sideMenuVisible = {};
    this.sideMenuOrder.forEach(key => {
      this.sideMenuVisible[key] = true;
    });
    Object.keys(data).forEach(key => {
      const reuseData = [];
      reuseData['data'] = data[key];
      this.setData(key, reuseData);
    });
  }

  setData(type: string, data: any) {
    if (this.sideMenuOrder.indexOf(type) === -1) {
      return;
    }

    this.sideMenu[type] = [];
    this.sideMenu[type] = data;

    this.sideMenu[type]['toUnseen'] = 0;
    this.sideMenu[type]['unseenCount'] = 0;
    if (this.sideMenu[type].data) {
      this.sideMenu[type].data = this.sideMenu[type].data.filter(v => v);

      this.sideMenu[type].data.forEach((item) => {
        const toUnseen = (typeof item['toUnseen'] === 'undefined') ? 0 : item['toUnseen'];
        const unseenCount = (typeof item['unseenCount'] === 'undefined') ? 0 : item['unseenCount'];
        this.sideMenu[type]['toUnseen'] += toUnseen;
        this.sideMenu[type]['unseenCount'] += unseenCount + toUnseen;
      });

    }
  }

  getUnseenCount(type: string): any[] {
    this.sideMenu[type]['toUnseen'] = 0;
    this.sideMenu[type]['unseenCount'] = 0;
    if (this.sideMenu[type].data) {
      this.sideMenu[type].data.forEach((item) => {
        const toUnseen = (typeof item['toUnseen'] === 'undefined') ? 0 : item['toUnseen'];
        const unseenCount = (typeof item['unseenCount'] === 'undefined') ? 0 : item['unseenCount'];
        this.sideMenu[type]['toUnseen'] += toUnseen;
        this.sideMenu[type]['unseenCount'] += unseenCount + toUnseen;
      });
    }
    return this.sideMenu[type];
  }

  redirectPage(event, data) {
    if (event) {
      this.router.navigate([this.checkPath(data)]);
    }
  }

  isLinkActive(data): boolean {
    const url = this.checkPath(data);
    const fragment = (this.activatedRoute.snapshot.fragment) ? '#' + this.activatedRoute.snapshot.fragment : '';
    const current = this.activatedRoute.snapshot.url.join('/') + fragment;
    return (current === url);
  }

  checkPath(data: any) {
    if (data.isNew) {
      return `/gr/gr0008/${data.id}`;
    } else {
      if (data.listToUnseen && data.listToUnseen.article.length > 0) {
        return `gr/detail/${data.id}/${data.listToUnseen.article[0]}`;
      } else if (data.listToUnseen && data.listToUnseen.comment.length > 0) {
        return `gr/detail/${data.id}/${data.listToUnseen.comment[0].articleId}/${data.listToUnseen.comment[0].commentId}`;
      } else {
        return `gr/gr0011/${data.id}`;
      }
    }
  }

}
