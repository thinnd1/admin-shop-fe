export class EventCreateSettingValidator {
  title: string;
  allDay: boolean;
  startDay: string;
  startTime: string;
  endDay: string;
  endTime: string;
  optionShare: string;
  userId: string;
  publishType: string;
  meetingPublishType: string;
  groupInside: string;
  groupOutside: string;

  constructor() {
    this.title = '';
    this.allDay = false;
    this.startDay = null;
    this.startTime = null;
    this.endDay = null;
    this.endTime = null;
    this.optionShare = 'MY';
    this.userId = '';
    this.publishType = 'VISIBLE';
    this.meetingPublishType = 'VISIBLE';
    this.groupInside = '';
    this.groupOutside = '';
  }
}
