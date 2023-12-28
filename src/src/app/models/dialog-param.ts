import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

/**
 * ダイアログを制御するパラメータ
 */
export class DialogParams {
  public componentType: Type<any>;
  public icon: string;
  public closeButton: boolean;
  public title: string;
  public message: string;
  public html: string;
  public positiveButton: string;
  public negativeButton: string;
  public subject: Subject<DialogResult>;
  public extraParams: any;
  public type: string; // class name（'bootstrap'）or null(swal)
  public size: string; // 'modal-lg' or 'modal-sm' or null

  constructor(componentType: Type<any>, icon: string, closeButton: boolean, title: string, message: string, html: string,
              positiveButton: string, negativeButton: string, subject: Subject<DialogResult>, extraParams: any,
              type: string, size: string ) {
    this.componentType = componentType;
    this.icon = icon;
    this.closeButton = closeButton;
    this.title = title;
    this.message = message;
    this.html = html;
    this.positiveButton = positiveButton;
    this.negativeButton = negativeButton;
    this.subject = subject;
    this.extraParams = extraParams;
    this.type = type;
    this.size = size;
  }
}

/**
 * ダイアログ返却値のコンテナ
 */
export class DialogResult {
  public buttonName: string;
  public payload: any;

  constructor(buttonName: string, payload: any) {
    this.buttonName = buttonName;
    this.payload = payload;
  }

  isOk() {
    return this.buttonName === 'ok';
  }

  isCancel() {
    return this.buttonName === 'cancel';
  }
}

/**
 * モーダルダイアログのコンポーネントが実装すべきインターフェイス
 */
export interface DialogAdapter {
  params: DialogParams;

  onModalInit();

  /**
   * ダイアログ特有「の返却データを取得する
   */
  getPayload(): any;
}
