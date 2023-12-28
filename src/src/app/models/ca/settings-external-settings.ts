/**
 * CA0010 外部カレンダー
 */
// export class SettingsExternalSettings {
//   public items: any[];
//   public accountName: string;
//   public calendarName: string;
//   public calendarReferenceId: string;
//   public color: number;
//   public externalCalendarId: string;
//   public provider_type: string;
//   public visible: boolean;
// }


namespace PROVIDER_TYPE {
  export const GOOGLE = "GOOGLE";
  export const OUTLOOK = "OUTLOOK";
  export const GAROON = "GAROON";
}


export namespace ExternalCalendar {

  /**
   * カレンダー情報
  */
  export interface Calendar {
    name: string;
    color: number;
    visible: boolean;
    calendarReferenceId: string;
  };

  /**
   * アカウント情報
  */
  export interface  Account {
    name: string;
    externalCalendarId: string;
    calendars: Calendar[];
    validToken: boolean;  // 同意が切れていないか
  };

  /**
   * カレンダー同期情報
   * constructor でフラットなデータから階層データに復元する
   * 階層 Settings - Account[] - Calendar[]
  */
  export class Settings {
    
    private _googles: Account[] = [];
    public get googles() {
      return  this._googles;
    }

    private _outlooks: Account[] = [];
    public get outlooks() {
      return  this._outlooks;
    }

    private _garoons: Account[] = [];
    public get garoons() {
      return  this._garoons;
    }

    private static _setAccount = (accounts: Account[], item: Object) => {
      for (let account of accounts) {
        if (account.name === item["accountName"]) {
          account.calendars.push({
            name: item["calendarName"],
            color: item["color"],
            visible: item["visible"],
            calendarReferenceId: item["calendarReferenceId"],
          });
          return;
        }
      }

      let account:Account = {
        name: item["accountName"],
        externalCalendarId: item["externalAuthorizationId"],
        calendars: [
          {
            name: item["calendarName"],
            color: item["color"],
            visible: item["visible"],
            calendarReferenceId: item["calendarReferenceId"],
          }
        ],
        validToken: item["validToken"]
      };
      accounts.push(account);
    }

    constructor(srcArray: Array<Object>) {
      for (let item of srcArray) {
        switch (item["provider_type"]) {
          case PROVIDER_TYPE.GOOGLE:
            Settings._setAccount(this._googles, item);
            break;
          case PROVIDER_TYPE.OUTLOOK:
            Settings._setAccount(this._outlooks, item);
            break;
          case PROVIDER_TYPE.GAROON:
            Settings._setAccount(this._garoons, item);
            break;
        }
      }
    }

  }
}