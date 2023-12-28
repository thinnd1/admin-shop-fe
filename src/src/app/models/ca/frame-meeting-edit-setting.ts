export class FrameMeetingEditSetting {
  userId: string;
  officeUserId: string;
  start: string;
  end: string;
  frameType: string;
  place: string;
  registeredOfficeId: string;
  registeredUserId: string;
  slots: number;
  repeat: string;
  acceptRequest: boolean;
  ignoreHoliday: boolean;
  repeatOption: any;
  public isRepeat: boolean;
  public repeatInterval: number;
  public sunday: boolean;
  public monday: boolean;
  public tuesday: boolean;
  public wednesday: boolean;
  public thursday: boolean;
  public friday: boolean;
  public saturday: boolean;
  public endFrame: string;
  public countTime: number;
  public untilDay: string;
  public monthRepeatOption: string;

  constructor() {
    this.userId = null;
    this.officeUserId = null;
    this.start = null;
    this.end = null;
    this.frameType = 'SLOTS';
    this.place = '';
    this.registeredOfficeId = null;
    this.registeredUserId = null;
    this.slots = 5;
    this.repeat = '';
    this.acceptRequest = false;
    this.ignoreHoliday = false;
    this.repeatOption = '1';
    this.repeatInterval = 1;
    this.isRepeat = false;
    this.sunday = false;
    this.monday = false;
    this.tuesday = false;
    this.wednesday = false;
    this.thursday = false;
    this.friday = false;
    this.saturday = false;
    this.endFrame = 'NONE';
    this.countTime = null;
    this.untilDay = null;
    this.monthRepeatOption = 'BYMONTHDAY';
  }

}

