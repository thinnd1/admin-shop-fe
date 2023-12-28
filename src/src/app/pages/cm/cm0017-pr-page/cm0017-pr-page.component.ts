import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedValueService } from '../../../services/shared-value.service';
import { SideMenuService } from '../../../services/sidemenu.service';
import { SideMenuMessage, SideMenuType } from '../../../services/message.service';
import { Subscription } from 'rxjs/Subscription';
import { FirSideMenu } from '../../../models/firebase/fir.sidemenu';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cm0017-pr-page',
  templateUrl: './cm0017-pr-page.component.html',
  styleUrls: ['./cm0017-pr-page.component.scss']
})
export class Cm0017PrPageComponent implements OnInit {

  public target: string;
  // Sidemenu event
  sideMenuSubscription: Subscription;
  public sideMenu: any[] = [];
  public title: string;

  userSession;

  constructor(
    private translate: TranslateService,
    private sharedValueService: SharedValueService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sidemenuMessage: SideMenuMessage,
    private sidemenu: SideMenuService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    if (! this.userSession) {
      return;
    }

    this.activatedRoute.params.subscribe((params: Params) => {
      switch (params['target']) {
        case 'outsideChat':
          this.target = params['target'];

          this.title = this.manualUppercase(this.target.replace(/([a-z])([A-Z])/g, '$1_$2'));
          this.title = this.translate.instant('CM0017PR.TITLE.' + this.title);
          this.titleService.setTitle(this.title);

          // =================
          // サイドメニュー情報取得
          const orders = this.sidemenu.getVisibleAndOrders();
          const data = this.sidemenu.reuseObjects();
          this.onGotSideMenuOrder(orders, data);
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

  onGotSideMenuOrder(orders: string[], data: { [key: string]: FirSideMenu[] }) {
    this.sideMenuSubscription = this.sidemenuMessage.get().subscribe(res => {
      switch (res.type) {
        case SideMenuType.OutsideChat:
          this.setData('outsideChat', res);
          break;
        default:
          break;
      }
    });

    this.getData(orders, data);
  }

  getData(orders: string[], data: any) {
    if (typeof orders === 'undefined' || orders.length === 0) {
      return;
    }
    Object.keys(data).forEach(key => {
      const reuseData = [];
      reuseData['data'] = data[key];
      this.setData(key, reuseData);
    });
  }

  setData(type: string, data: any) {
    this.sideMenu[type] = [];
    this.sideMenu[type] = data;

    this.sideMenu[type]['unseenCount'] = 0;
    this.sideMenu[type].data = this.sideMenu[type].data.filter(v => v);
    this.sideMenu[type].data.forEach((item) => {
      const unseenCount = (typeof item['unseenCount'] === 'undefined') ? 0 : item['unseenCount'];
      const toUnseen = (typeof item['toUnseen'] === 'undefined') ? 0 : item['toUnseen'];
      this.sideMenu[type]['unseenCount'] += unseenCount + toUnseen;
    });
  }

}
