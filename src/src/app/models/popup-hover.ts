import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

/**
 * ダイアログを制御するパラメータ
 */
export class PopupHover {
  public title: string;
  public time: string;
  public user: string;
  public note: string;
  public place: string;
  public subject: Subject<PopupHoverResult>;
  public jsEvent: any;
  public holiday: boolean;
  public bntShow: boolean;
  public defaultView: string;

  constructor(title: string, time: string, user: string, note: string, place: string, jsEvent: any, holiday: boolean, bntShow,
              subject: Subject<PopupHoverResult>, defaultView: string) {
    this.title = title;
    this.time = time;
    this.user = user
    this.note = note;
    this.place = place;
    this.jsEvent = jsEvent;
    this.holiday = holiday;
    this.bntShow = bntShow;
    this.subject = subject;
    this.defaultView = defaultView;
  }
}

/**
 * ダイアログ返却値のコンテナ
 */
export class PopupHoverResult {
  public buttonName: string;
  public payload: any;

  constructor(buttonName: string) {
    this.buttonName = buttonName;
  }

  isClose() {
    return this.buttonName === 'close';
  }

  isDelete() {
    return this.buttonName === 'delete';
  }

  isEdit() {
    return this.buttonName === 'edit';
  }
}

export interface PopupHoverAdapter {
  params: PopupHover;

  onModalInit();

  /**
   * ダイアログ特有「の返却データを取得する
   */
  getPayload(): any;
}
