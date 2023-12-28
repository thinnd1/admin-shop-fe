export class MeetingSettingDay {
  public day: number;
  public settingTimeList: any[];
  public settingType: number;

  constructor(day: number, settingTimeList: any[], settingType: number) {
    this.day = day;
    this.settingTimeList = settingTimeList;
    this.settingType = settingType;
  }
}
