/**
 * Me0014 初回登録
 */
export class SettingTimeDay {
  none: boolean;
  disallowAllDay: boolean;
  time: boolean;
  settingTimeList: any[];
  oldSetting: any[];

  constructor(none: boolean, disallowAllDay: boolean, time: boolean, settingTimeList: any[], oldSetting: any[]) {
    this.none = none;
    this.disallowAllDay = disallowAllDay;
    this.time = time;
    this.settingTimeList = settingTimeList;
    this.oldSetting = oldSetting;
  }
}
