import { Component, OnInit, HostListener } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import { FirebaseDatabase } from '../../services/firebase/firebase.database';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DomSanitizer } from '@angular/platform-browser';
import { SideMenuService } from '../../services/sidemenu.service';
import {LoginUserInfoMessage, SideMenuMessage, SideMenuOrderMessage, SideMenuType} from '../../services/message.service';
import { LocalStorage } from '../../services/local-storage.service';
import { DialogService } from '../../services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import {FirGroupMember} from '../../models/gr/firebase/fir.group';
import {FirSideMenu} from '../../models/firebase/fir.sidemenu';

declare const $: any;

@Component({
  selector: 'app-side-menu-drjoy',
  templateUrl: './side-menu-drjoy.component.html',
  styleUrls: ['./side-menu-drjoy.component.scss']
})
export class SideMenuDrjoyComponent implements OnInit {
  // Sidemenu event
  sideMenuSubscription: Subscription;
  sideMenuOrderSubscription: Subscription;
  public sideMenu: any[] = [];
  public sideMenuOrder: any[];
  public sideMenuVisible: object = {};

  private sideMenuToggle: object = {};
  private lastOrder = 0;

  private tmpPool = [];

  userSession;

  public keyword: string;
  public searchKeyword = '';
  loginUserInfoMessageSubscription: Subscription;
  disableMeeting = false;

  constructor(private sharedValueService: SharedValueService,
              private router: Router,
              private route: ActivatedRoute,
              private sidemenuOrderMessage: SideMenuOrderMessage,
              private sidemenuMessage: SideMenuMessage,
              private localStorage: LocalStorage,
              private dialogService: DialogService,
              private sidemenu: SideMenuService,
              private translate: TranslateService,
              private firebaseDatabase: FirebaseDatabase,
              private loginUserInfoMessage: LoginUserInfoMessage) {
    this.loginUserInfoMessageSubscription = this.loginUserInfoMessage.get().subscribe(res => {
      this.disableMeeting = res.authorities.FP_1;
    });
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    const self = this;
    this.userSession = this.sharedValueService.getUserSession();
    this.disableMeeting = this.userSession.funcAuthority.FP_1;
    if (! this.userSession) {
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.searchKeyword = this.keyword;
    });

    // =================
    // サイドメニュー情報取得
    let orders = this.sidemenu.getVisibleAndOrders();
    console.log('*** reuse orders: ', orders);

    let data = this.sidemenu.reuseObjects();
    console.log('*** reuse data: ', data);

    this.sideMenuOrderSubscription = this.sidemenuOrderMessage.get().subscribe(res => {
      console.log('*** Order: ', res);
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
  }

  onChengedSidemenu(res: any) {
    console.log('*** Sidememnu: ', res);
    switch (res.type) {
      case SideMenuType.Meeting:
        console.log('*** Meeting:', res.data);
        this.setData('meeting', res);
        break;
      case SideMenuType.InsideGroup:
        console.log('*** InsideGroup:', res.data);
        this.setData('insideGroup', res);
        break;
      case SideMenuType.OutsideGroup:
        console.log('*** OutsideGroup:', res.data);
        this.setData('outsideGroup', res);
        break;
      case SideMenuType.InsideChat:
        console.log('*** InsideChat:', res.data);
        this.removeDupllicate(res.data);
        this.setData('insideChat', res);
        break;
      case SideMenuType.OutsideChat:
        console.log('*** OutsideChat:', res.data);
        this.removeDupllicate(res.data);
        this.setData('outsideChat', res);
        break;
    }
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
    const self = this;
    if (this.sideMenuOrder.indexOf(type) === -1) {
      return;
    }

    const localStorage = this.localStorage.getObject('sideMenu');
    const sideMenu = (localStorage) ? localStorage : {};

    this.sideMenu[type] = [];
    this.sideMenu[type] = data;
    this.sideMenu[type]['expanded'] = (typeof sideMenu[type] !== 'undefined') ? sideMenu[type] : true;
    this.sideMenuToggle[type] = this.sideMenu[type]['expanded'];
    const mergeSideMenu = Object.assign(sideMenu, this.sideMenuToggle);
    this.localStorage.setObject('sideMenu', mergeSideMenu);

    const order = this.sideMenuOrder.indexOf(type);
    this.sideMenu[type]['order'] = order;
    this.lastOrder = (this.lastOrder < order) ? order : this.lastOrder;
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

      let sideMenuBadge = 0;
      Object.keys(this.sideMenu).forEach(function(key) {
        sideMenuBadge += self.sideMenu[key]['unseenCount'];
      });
      this.sharedValueService.sideMenuBadge = sideMenuBadge;
    }
  }

  clickSideMenuToggle(event: any, type: string) {
    const localStorage = this.localStorage.getObject('sideMenu');
    setTimeout(() => {
      localStorage[type] = ! localStorage[type];
      this.localStorage.setObject('sideMenu', localStorage);
      this.sideMenu[type]['expanded'] = localStorage[type];
    }, 500);
  }

  // 院外グループ作成
  clickAddOutsideChat(event: any) {
    let html = '';
    this.translate.get('SIDE_MENU.OUTSIDE_CHAT_DIALOG').subscribe((msg) => {
      html += '<div class="outside-chat-dialog">';
      html += '<p>' + msg.COPY + '</p>';
      html += '<dl>';
      html += '<dt><label class="custom-control custom-radio"><input type="radio" name="outside_chat_dialog" value="1" class="custom-control-input" checked="checked"><span class="custom-control-indicator"></span><span class="custom-control-description">' + msg.LABEL1 + '</span></label></dt>';
      html += '<dd class="pl-4">' + msg.NOTE1 + '</dd>';
      html += '<dt><label class="custom-control custom-radio"><input type="radio" name="outside_chat_dialog" value="2" class="custom-control-input"><span class="custom-control-indicator"></span><span class="custom-control-description">' + msg.LABEL2 + '</span></label></dt>';
      html += '<dd class="pl-4">' + msg.NOTE2 + '</dd>';
      html += '</dl>';
      html += '</div>';
    });
    this.dialogService.showMessage(null, false, 'SIDE_MENU.OUTSIDE_CHAT_DIALOG.TITLE', null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
      (res) => {
        if (res.isOk()) {
          const outsideChatDialogVal = (<any>$('[name="outside_chat_dialog"]:checked')).val();
          const path = (outsideChatDialogVal === '1') ? 'me/me0005' : 'ch/ch0005';
          this.router.navigate([path]);
        }
      }
    );
  }

  /**
   * 全文検索(CM0013)を実行する
   */
  searchAll() {
    this.router.navigate(['cm/cm0013'], {queryParams: {keyword: this.searchKeyword}});
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
    if (event && !event.ctrlKey) {
      this.router.navigate([this.checkPath(data)]);
    } else if (event && event.ctrlKey) {
      window.open(this.checkPath(data));
    }
  }

  isLinkActive(data): boolean {
    const url = this.checkPath(data);
    const fragment = (this.route.snapshot.fragment) ? '#' + this.route.snapshot.fragment : '';
    const current = this.route.snapshot.url.join('/') + fragment;
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

  redirectUnseenToPage(condition, path) {
    if (condition) {
      setTimeout(() => {
        this.router.navigated = false;
        this.router.navigate([path]);
      });
    }
  }
}
