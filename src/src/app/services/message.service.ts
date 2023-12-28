import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {FirSideMenu} from '../models/firebase/fir.sidemenu';
import {DrjoyInfoAlert} from '../models/cm/drjoy-info-alert';
import {FirUserInfo} from "../models/firebase/fir.userinfo";

/**
 * @author k.sumi 2017/09/23
 */
export abstract class Message<T> {

  // Subject
  protected subject = new Subject<T>();

  /** Send message */
  send(msg: T) {
    this.subject.next(msg);
  }

  /** Get message */
  get(): Observable<T> {
    return this.subject.asObservable();
  }

  /** Clear message */
  clear() {
    this.subject.next();
  }
}

/**
 * Authenticate Message.
 *
 * @author k.sumi 2017/09/23
 */
@Injectable()
export class AuthenticationMessage extends Message<AuthenticationMessage.Type> {
}

/**
 * Authenticate Message Type.
 */
export namespace AuthenticationMessage {
  export enum Type {
    // ログイン時
    Loginin,
    // ログアウト時
    Logout,
    // セッション情報更新時
    Refresh,
  }
}

/**
 * メッセージアイテム.
 */
export enum SideMenuType {
  // 面会
  Meeting,
  // 院内グループ
  InsideGroup,
  // 院外グループ
  OutsideGroup,
  // 院内メッセージ
  InsideChat,
  // 院外メッセージ
  OutsideChat,
}

/**
 * サイドメニュー表示設定、並び順変更メッセージ.
 */
@Injectable()
export class SideMenuOrderMessage extends Message<String[]> {
}

/**
 * サイドメニュー変更メッセージ.
 */
@Injectable()
export class SideMenuMessage extends Message<SideMenuMessage.SideMenu> {
}

export namespace SideMenuMessage {
  /**
   * サイドメニュー更新データ.
   */
  export class SideMenu {
    // メッセージアイテム
    type: SideMenuType;
    // 更新データ
    data: FirSideMenu[];

    // Constructor
    constructor(type: SideMenuType, data: FirSideMenu[]) {
      this.type = type;
      this.data = data;
    }
  }
}

/**
 * Firebase準備完了メッセージ.
 */
@Injectable()
export class FirebaseReadyMessage extends Message<boolean> {
}

/**
 * Dr.JOYからのお知らせ.
 */
@Injectable()
export class DrjoyInfoAlertMessage extends Message<DrjoyInfoAlert> {
}

/**
 * Firebase上のログイン中のユーザー情報が変更された時.
 */
@Injectable()
export class LoginUserInfoMessage extends Message<FirUserInfo> {
}
