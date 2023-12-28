import { FirInformation } from './../../models/firebase/fir.information';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import {Component, OnInit, OnDestroy, DoCheck, KeyValueDiffers} from '@angular/core';
import { Router } from '@angular/router';
import { SharedValueService } from '../../services/shared-value.service';
import { AuthenticationService } from '../../services/authentication.service';
import { InformationService } from '../../services/information.service';
import { DateConverter } from '../../common/converter/date.converter';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent implements OnInit, OnDestroy, DoCheck {
  private lang: string;
  private today = new Date();
  private yesterday = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 1);
  objectKeys = Object.keys;

  firInfoObjects: FirInformation[][] = [];
  differ: any = {};
  intervalTime = 200;

  constructor(
    private router: Router, private sharedValue: SharedValueService,
    private _authenticationService: AuthenticationService,
    private information: InformationService,
    private dateConverter: DateConverter,
    private translate: TranslateService,
    private keyValueDiffers: KeyValueDiffers
  ) {
    this.lang = this.translate.getDefaultLang();
    this.firInfoObjects = this.information.objects();
    this._interval = Observable
      .interval(this.intervalTime)
      .subscribe(() => {
        this.timer();
      });
  }

  unsubscribe() {
    if (this._interval) {
      this._interval.unsubscribe();
      this._interval = null;
    }
  }

  timer() {
    this.firInfoObjects = this.information.objects();
    if (!this.information.isFirst) {
      this.differ = {};
      this.differ['firInfoObjects'] = this.keyValueDiffers.find(this.firInfoObjects).create(null);
      Object.keys(this.firInfoObjects).forEach((value) => {
        this.differ[value] = this.keyValueDiffers.find(this.firInfoObjects[value]).create(null);
      });
      this.unsubscribe();
    }
  }

  ngDoCheck() {
    if (Object.keys(this.differ).length && Object.keys(this.firInfoObjects).length) {
      let count = 0;
      const firInfoObjectsChange = this.differ['firInfoObjects'].diff(this.firInfoObjects);
      if (firInfoObjectsChange) {
        count++;
      }
      Object.keys(this.firInfoObjects).forEach((value) => {
        if (this.differ[value]) {
          const change = this.differ[value].diff(this.firInfoObjects[value]);
          if (change) {
            count++;
          }
        }
      });
      if (count) {
        this._getObjects();
      }
    }
  }

  /**
   * お知らせ情報
   */
  private _replaceObjects: FirInformation[][] = [];
  public get replaceObjects() {
    return this._replaceObjects;
  }

  /**
   * 取得ポーリング用
   */
  private _interval: Subscription = null;

  /**
   * お知らせ情報取得
   */
  private _getObjects() {
    const objects: FirInformation[][] = this.firInfoObjects;

    const check1 = [], check2 = [], replaceObjects = [];
    objects.forEach((object) => {
      object.forEach((item) => {
        const date = this.dataConvert(item.sentAt.toISOString(), 'YYYY-MM-DD');
        if (check1.indexOf(date) === -1) {
          check2.push(date);
          replaceObjects[date] = [];
        }
        check1.push(date);
        item['path'] = this.pathCheck(item);
        replaceObjects[date].push(item);
      });
    });
    // console.log('###info###', replaceObjects);

    this._replaceObjects = replaceObjects;
    // return replaceObjects;
  }

  dataConvert(date: string, format: string) {
    return this.dateConverter.moment(date, format);
  }

  isSame(baseDate: string, compareDate: string, format: string) {
    return this.dateConverter.isSame(baseDate, compareDate, format);
  }

  pathCheck(item: any): string {
    let path = '';
    switch (item['notificationId']) {
      // （あなた宛の投稿）
      case 'GR003':
      // （自分が投稿した）記事の「確認しました」が押下された時
      case 'GR005':
      // To宛先に自分が含まれた記事が投稿された場合
      case 'GR010':
        path = `/gr/detail/${item.groupInfo.groupId}/${item.groupInfo.articleId}`;
        break;
      // （自分が投稿した記事にメンバーが）コメント投稿時
      case 'GR004':
      // （自分が投稿した）コメントの「確認しました」が押下された時
      case 'GR006':
      // To宛先に自分が含まれたコメントが投稿された場合
      case 'GR011':
        path = `/gr/detail/${item.groupInfo.groupId}/${item.groupInfo.articleId}/${item.groupInfo.commentId}`;
        break;
      // アンケート回答期限前日のAM9:00
      case 'GR008':
        path = '';
        break;
      // CSVファイルダウンロード準備完了時
      case 'GR009':
        path = '';
        break;
      // 院内グループのスケジュールが登録された時
      case 'CA003':
        path = '';
        break;
      // 院内グループのスケジュールが変更された時
      case 'CA004':
        path = '';
        break;
      // 院内グループのスケジュールが削除された時
      case 'CA005':
        path = '';
        break;
      case 'ME006':
        path = '';
        break;
      case 'ME008':
        path = '';
        break;
    }
    return path;
  }

  clickInfoItem(event: any, path: string) {
    if (!path) {
      return;
    }
    this.router.navigate([path]);
  }

  scrollEvent(event: any) {
    const self = this;
    const scrollTop = event.target.scrollTop;
    const offsetHeight = event.target.offsetHeight;
    $('.info-panel-list-item').not('.info-panel-list-item-read').each(function(i, e){
      const o = e.offsetTop;
      const h = e.clientHeight;
      const pos = o + h - scrollTop;
      if (offsetHeight >= pos) {
        const id = $(this).attr('id');
        self.information.seen([id]);
        $(this).addClass('info-panel-list-item-read');
      }
    });
  }

  ngOnInit() {
    const self = this,
      $body = $('body'),
      $contentWrap = $('.content-wrap'),
      $sideMenu = $('.side-menu'),
      $infoPanel = $('.info-panel'),
      $infoPanelList = $('.info-panel-list'),
      $infoPanelInner = $('.info-panel-inner');

    $infoPanel.on('show.bs.collapse', function () {
      const breakPointSm = $(window).width() < 400;
      const property = (breakPointSm) ? 'auto' : '';
      $infoPanelInner.css('min-width', property);
    }).on('shown.bs.collapse', function () {
      const infoPanelH = $(this).height();
      const infoPanelListH = $infoPanelList.height();
      if (infoPanelH > infoPanelListH) {
        self.information.seenAll();
      } else {
        let sumH = 0;
        const ids = [];
        $('.info-panel-list-day,.info-panel-list-item').each(function(i, e){
          sumH += $(this).height();
          if (sumH < infoPanelH && $(this).hasClass('info-panel-list-item') && !$(this).hasClass('info-panel-list-item-read')) {
            const id = $(this).attr('id');
            ids.push(id);
            $(this).addClass('info-panel-list-item-read');
          }
        });
        if (ids.length) {
          self.information.seen(ids);
        }
      }
      const breakPointbDownSm = $(window).width() < 767;
      if (breakPointbDownSm) {
        $body.css('overflow-y', 'hidden');
      }
      const breakpointOnlyMd = $(window).width() > 767 && $(window).width() < 992;
      if (breakpointOnlyMd) {
        $contentWrap.removeClass('push');
      } else {
        $contentWrap.removeClass('push').addClass('pull');
      }
      $sideMenu.removeClass('side-menu-show').addClass('side-menu-hide');
    }).on('hide.bs.collapse', function () {
      $contentWrap.removeClass('pull');
    }).on('hidden.bs.collapse', function () {
      if ($sideMenu.hasClass('side-menu-show')) {
      } else {
        $body.css('overflow-y', 'scroll');
      }
    });

    $contentWrap.click(function () {
      $infoPanel.collapse('hide');
    });

  }

  ngOnDestroy() {
    this.unsubscribe();
  }

}
