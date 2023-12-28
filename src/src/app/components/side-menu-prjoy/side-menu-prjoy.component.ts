import { Component, OnInit, HostListener } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import { FirebaseDatabase } from '../../services/firebase/firebase.database';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DomSanitizer } from '@angular/platform-browser';
import { SideMenuService } from '../../services/sidemenu.service';
import { SideMenuMessage, SideMenuType } from '../../services/message.service';
import { LocalStorage } from '../../services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import {FirSideMenu} from '../../models/firebase/fir.sidemenu';

@Component({
  selector: 'app-side-menu-prjoy',
  templateUrl: './side-menu-prjoy.component.html',
  styleUrls: ['./side-menu-prjoy.component.scss']
})
export class SideMenuPrjoyComponent implements OnInit {
  // Sidemenu event
  sideMenuSubscription: Subscription;
  public sideMenu: any[] = [];
  private sideMenuToggle: object = {};

  userSession;

  public firstName: string;
  public lastName: string;
  public deptName: string;
  public userId: string;

  constructor(private sharedValueService: SharedValueService,
              private router: Router,
              private sidemenu: SideMenuService,
              private sidemenuMessage: SideMenuMessage,
              private localStorage: LocalStorage,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    if (! this.userSession) {
      // todo エラー処理必要か
      return;
    }

    this.firstName = this.userSession.firstName;
    this.lastName = this.userSession.lastName;
    this.deptName = this.userSession.deptName;
    this.userId = this.userSession.userId;

    // =================
    // サイドメニュー情報取得
    const orders = this.sidemenu.getVisibleAndOrders();
    console.log('*** reuse orders: ', orders);

    const data = this.sidemenu.reuseObjects();
    console.log('*** reuse data: ', data);
    // =================

    this.onGotSideMenuOrder(orders, data);
  }

  onGotSideMenuOrder(orders: string[], data: { [key: string]: FirSideMenu[] }) {
    this.sideMenuSubscription = this.sidemenuMessage.get().subscribe(res => {
      console.log('*** Sidememnu: ', res);
      switch (res.type) {
        case SideMenuType.Meeting:
          console.log('**** Meeting:', res.data);
          this.setData('meeting', res);
          break;
        case SideMenuType.OutsideChat:
          console.log('**** OutsideChat:', res.data);
          this.removeDupllicate(res.data);
          this.setData('outsideChat', res);
          break;
      }
    });

    this.getData(orders, data);
  }

  removeDupllicate(data) {
    const dupllicates = [];
    for (let i = data.length - 1; i >= 0; i--) {
      if (dupllicates.indexOf(data[i].id) > -1) {
        data.splice(i, 1);
      } else {
        dupllicates.push(data[i].id);
      }
    }
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
    const self = this;
    const localStorage = this.localStorage.getObject('sideMenu');
    const sideMenu = (localStorage) ? localStorage : {};
    this.sideMenu[type] = [];
    this.sideMenu[type] = data;
    this.sideMenu[type]['expanded'] = (typeof sideMenu[type] !== 'undefined') ? sideMenu[type] : true;
    this.sideMenuToggle[type] = this.sideMenu[type]['expanded'];
    const mergeSideMenu = Object.assign(sideMenu, this.sideMenuToggle);
    this.localStorage.setObject('sideMenu', mergeSideMenu);

    this.sideMenu[type]['unseenCount'] = 0;
    this.sideMenu[type].data = this.sideMenu[type].data.filter(v => v);
    this.sideMenu[type].data.forEach((item) => {
      const unseenCount = (typeof item['unseenCount'] === 'undefined') ? 0 : item['unseenCount'];
      const toUnseen = (typeof item['toUnseen'] === 'undefined') ? 0 : item['toUnseen'];
      this.sideMenu[type]['unseenCount'] += unseenCount + toUnseen;
    });

    let sideMenuBadge = 0;
    Object.keys(this.sideMenu).forEach(function(key) {
      sideMenuBadge += self.sideMenu[key]['unseenCount'];
    });
    this.sharedValueService.sideMenuBadge = sideMenuBadge;
  }

  clickSideMenuToggle(event: any, type: string) {
    const localStorage = this.localStorage.getObject('sideMenu');
    setTimeout(() => {
      localStorage[type] = ! localStorage[type];
      this.localStorage.setObject('sideMenu', localStorage);
      this.sideMenu[type]['expanded'] = localStorage[type];
    }, 500);
  }
}
