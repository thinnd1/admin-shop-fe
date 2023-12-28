import { Injectable } from '@angular/core';
import {MeetingSettingDay} from '../models/me/metting-setting-day';
import {Helper} from './helper';
import {CalendarCommon} from './calendar-common';
import {EventMeeting} from '../models/me/event-meeting';
declare var moment: any;

export enum MeetingStatus {
  // 承認待ち
  NEW,
    // 確定
  FIXED,
    // 中止
  CANCELED,
    // 終了
  DONE,
}

export enum ModelInput {
  CHANG_TIME,
  PASS,
  FUTURE,
  DOCUMENT,
}

export enum SettingType {
  NONE,
  DISALLOW_ALL_DAY,
  SET_TIME
}

export enum SenderRequest {
  SENDER,
  RECEIVER
}

export enum FrameMeetingStatus {
  NEW,
  FIXED,
  CANCELED
}

@Injectable()
export class MeetingCommon {
  public SettingType: typeof SettingType = SettingType;
  public MeetingStatus: typeof MeetingStatus = MeetingStatus;

  constructor(private helper: Helper, private calendarCommon: CalendarCommon) {}

  convertEventMeeting(listEventCalendar: any, listEventMeeting: any, user: string, userRequest: string, mediator: string, receiver: string,
                      mediatorRequest: any) {
    let arrEventUser = new Array();
    let listEventMeetingFixed = new Array();

    if (listEventCalendar) {
      for (let i = 0; i < listEventCalendar.length; i++) {
        const eventMeeting = this.convertTitleEvenCalendar(listEventCalendar[i], user, mediatorRequest, userRequest);
        const list_event  = this.getEvent(eventMeeting, listEventCalendar[i], user);
        arrEventUser = arrEventUser.concat(list_event.listEvent);
      }
    }

    if (listEventMeeting) {
      for (let i = 0; i < listEventMeeting.length; i++) {
        const eventMeeting = this.convertTitleEventMeeting(listEventMeeting[i], user, userRequest, mediator, receiver, mediatorRequest);
        const list_event = this.getEvent(eventMeeting, listEventMeeting[i], user);
        if (!$.isEmptyObject(list_event.eventMeetingFixed)) {
          listEventMeetingFixed = listEventMeetingFixed.concat(list_event.eventMeetingFixed);
        }
        arrEventUser = arrEventUser.concat(list_event.listEvent);
      }
    }

    const data = {
      arrEventUser: arrEventUser,
      listEventMeetingFixed: listEventMeetingFixed
    };
    return data;
  }

  getEvent(eventMeeting: any, event: any, user: string) {
    const listEvent = new Array();
    let eventMeetingFixed = {};
    if (!$.isEmptyObject(eventMeeting)) {
      const obj = new EventMeeting();
      obj.title = eventMeeting.title;
      obj.backgroundColor =  eventMeeting.backgroundColor;
      obj.borderColor = eventMeeting.borderColor;
      obj.nameOffice = eventMeeting.nameOffice;
      obj.allDay = eventMeeting.allDay;
      obj.calendarType = eventMeeting.calendarType;
      obj.statusMeeting = eventMeeting.statusMeeting;
      obj.show = eventMeeting.show;
      obj.titlePopup = eventMeeting.titlePopup;
      obj.place = eventMeeting.place ? eventMeeting.place : 'なし';

      if (eventMeeting.calendarType === this.calendarCommon.calendarType.MEETING_DECIDED &&
        (this.MeetingStatus.NEW === eventMeeting.statusMeeting)) {
        const candidacyTimes = event.candidacyTimes;
        // event request meeting: status = new
        if (candidacyTimes) {
          for (let i = 0; i < candidacyTimes.length; i++) {
            let obj1 = {};
            obj1 = JSON.parse(JSON.stringify(obj));

            if (candidacyTimes[i].start && candidacyTimes[i].end) {
              obj1['start'] = moment(candidacyTimes[i].start).format('YYYY-MM-DDTHH:mm');
              obj1['end'] =  moment(candidacyTimes[i].end).format('YYYY-MM-DDTHH:mm');
              listEvent.push(obj1);
            }

          }
        }
      } else {
        // check meeting request fix + meeting frame
        if ((!event.allDay && event.start && event.end)) {
          obj['start'] = moment(event.start).format('YYYY-MM-DDTHH:mm');
          obj['end'] = moment(event.end).format('YYYY-MM-DDTHH:mm');
          if (eventMeeting.calendarType === this.calendarCommon.calendarType.MY) {
            obj['startEvent'] = moment(event.start).format('YYYY-MM-DDTHH:mm');
            obj['endEvent'] = moment(event.end).format('YYYY-MM-DDTHH:mm');
            if (moment(event.end).format('YYYYMMDDHHmm') === moment(event.start).format('YYYYMMDDHHmm')
              && moment(event.start).format('HH:mm') === '23:55') {
              obj['start'] = moment(event.start).add(-5, 'minutes').format('YYYY-MM-DDTHH:mm');
              obj['end'] = moment(event.start).add(5, 'minutes').format('YYYY-MM-DDTHH:mm');
            } else {
              if (moment(event.end).format('YYYYMMDD') === moment(event.start).format('YYYYMMDD')
                && moment(event.start).add(10, 'minutes').format('YYYYMMDDHHmm') > moment(event.end).format('YYYYMMDDHHmm')) {
                obj['end'] = moment(event.start).add(10, 'minutes').format('YYYY-MM-DDTHH:mm');
              } else {
                if (moment(event.start).format('HH:mm') === '23:55') {
                  obj['start'] = moment(event.start).add(-5, 'minutes').format('YYYY-MM-DDTHH:mm');
                }
                if (moment(event.end).format('HH:mm') === '00:05') {
                  obj['end'] = moment(event.end).add(5, 'minutes').format('YYYY-MM-DDTHH:mm');
                }
              }
            }
          }
          const data = this.checkMeetingRequestDone(obj, user);
          eventMeetingFixed = data.eventMeetingFixed;
          listEvent.push(data.event);
        }

        // event calendar all day
        if (event.allDay && event.start && event.end) {
          obj.start = moment(event.start).format('YYYY-MM-DD');
          obj.end =  moment(event.end).add(1, 'day').format('YYYY-MM-DD');
          listEvent.push(obj);
        }
      }
    }
    return {
      listEvent: listEvent,
      eventMeetingFixed: eventMeetingFixed
    };
  }

  checkMeetingRequestDone(event: any, user: string) {
    let date = new Date();
    date = moment(date).format();
    let eventMeetingFixed;

    if (user === 'sender' && event.calendarType === this.calendarCommon.calendarType.MEETING_DECIDED &&
      event.statusMeeting === this.MeetingStatus.FIXED) {
      // meeting fixed of sender
      if (moment(event.end).isSameOrBefore(date)) {
        event.statusMeeting = this.MeetingStatus.DONE;
      } else {
        eventMeetingFixed = {
          start: event.start,
          end: event.end
        };
      }
    } else {
      // frame meeting
      if (event.calendarType === this.calendarCommon.calendarType.MEETING_ACCEPTING) {
        eventMeetingFixed = {
          start: event.start,
          end: event.end
        };
      }
    }

    return {
      event: event,
      eventMeetingFixed: eventMeetingFixed
    };
  }

  convertTitleEvenCalendar(event: any, user: string, mediatorRequest: any, userRequest: string) {
    const eventMeeting = new EventMeeting();
    eventMeeting.title = (user === 'sender') ? event.title : '予定あり';
    if (user === 'sender') {
      eventMeeting.title = mediatorRequest ? 'カレンダーの予定' : event.title;
      eventMeeting.show = (mediatorRequest && userRequest === 'DR') ? false : true;
    } else {
      eventMeeting.show = false;
    }
    eventMeeting.titlePopup = eventMeeting.title;
    if (!event.allDay) {
      eventMeeting.backgroundColor = (user === 'sender') ? this.calendarCommon.convertColorHex(event.color) : '#D9D8D7';
      eventMeeting.borderColor = (user === 'sender') ? this.calendarCommon.convertColorHexOpacity(event.color, -0.2) :
        this.calendarCommon.hexToRgba('#D9D8D7', -0.2);
    } else {
      eventMeeting.backgroundColor = 'transparent';
      eventMeeting.borderColor = 'transparent';
    }
    eventMeeting.nameOffice = '';
    eventMeeting.allDay = event.allDay;
    eventMeeting.calendarType = this.calendarCommon.calendarType.MY;
    eventMeeting.statusMeeting = -1;
    eventMeeting['place'] = event.place;
    return eventMeeting;
  }

  convertTitleEventMeeting(event, user: string, userRequest: string, mediator: string, receiver: string, mediatorRequest: any) {
    let eventMeeting = new EventMeeting();
    if (user === 'sender') {
      switch (event.typeRequest) {
        case 'REQUEST':
          eventMeeting = this.convertEventTypeMeetingUserSent(event, userRequest, mediator, receiver);
          eventMeeting.allDay = false;
          break;
        case 'FRAME':
          if (user === 'sender') {
            eventMeeting.title = '面会リクエスト募集中!';
            eventMeeting.titlePopup = '面会リクエスト募集中!';
            eventMeeting.backgroundColor =  '#D9EDF7';
            eventMeeting.borderColor = this.calendarCommon.hexToRgba('#D9EDF7', -0.2);
            eventMeeting.nameOffice = '';
            eventMeeting.allDay = false;
            eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_ACCEPTING;
            eventMeeting.statusMeeting = -1;
            eventMeeting.show = true;
          }
          break;
        default:
          eventMeeting = this.convertEventTypeMeetingUserSent(event, userRequest, mediator, receiver);
          eventMeeting.allDay = false;
          break;
      }
    } else {
      eventMeeting = this.convertEventTypeMeetingUserReceive(event, userRequest, mediatorRequest);
    }
    eventMeeting['place'] = event.place;
    return eventMeeting;
  }

  convertEventTypeMeetingUserSent(event: any, userRequest: string, mediator: string, receiver: string) {
    const eventMeeting = new EventMeeting();
    eventMeeting.statusMeeting = this.MeetingStatus[event.status];
    if (eventMeeting.statusMeeting === this.MeetingStatus.NEW) {
      eventMeeting.nameOffice = event[receiver].officeName ? event[receiver].officeName : '';
      eventMeeting.title = event[receiver].lastName + ' ' + event[receiver].firstName;
      eventMeeting.titlePopup = eventMeeting.title + '(' + eventMeeting.nameOffice + ')'
        + ((event.senderType === userRequest || (mediator && mediator === event.senderType)) ? 'さんとの面会に応募中' : 'さんから面会リクエストあり');

      eventMeeting.title += (event.senderType === userRequest || (mediator && mediator === event.senderType)) ? 'さんとの面会に応募中'
        : 'さんから面会リクエストあり';
      eventMeeting.backgroundColor = '#FCF8E3';
      eventMeeting.borderColor = this.calendarCommon.hexToRgba('#FCF8E3', -0.2);
    } else if (eventMeeting.statusMeeting === this.MeetingStatus.FIXED || eventMeeting.statusMeeting === this.MeetingStatus.DONE) {
      eventMeeting.nameOffice = event[receiver].officeName ? event[receiver].officeName : '';
      eventMeeting.title = event[receiver].lastName + ' ' + event[receiver].firstName + 'さんとの面会';
      eventMeeting.titlePopup = event[receiver].lastName + ' ' + event[receiver].firstName + '(' + eventMeeting.nameOffice + ')'
        + 'さんとの面会';
      eventMeeting.backgroundColor = '#DFF0D8';
      eventMeeting.borderColor = this.calendarCommon.hexToRgba('#DFF0D8', -0.2);
    }
    eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_DECIDED;
    eventMeeting.show = true;
    return eventMeeting;
  }

  convertEventTypeMeetingUserReceive(event: any, userRequest: string, mediatorRequest) {
    const eventMeeting = (userRequest === 'DR') ? this.convertEventReceiveRequestOfDoctor(event) :
      this.convertEventReceiveRequestOfMR(event, mediatorRequest);
    return eventMeeting;
  }

  convertEventReceiveRequestOfDoctor(event: any) {
    const eventMeeting = new EventMeeting();
    switch (event.title) {
      case '0':
        // frame meeting
        eventMeeting.title = '面会リクエスト募集中!';
        eventMeeting.titlePopup = '面会リクエスト募集中!';
        eventMeeting.backgroundColor =  '#D9EDF7';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#D9EDF7', -0.2);
        eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_ACCEPTING;
        eventMeeting.statusMeeting = -1;
        eventMeeting.show = true;
        break;
      case '1':
        // Meeting fixed with MR#
        eventMeeting.title = '予定あり';
        eventMeeting.backgroundColor =  '#D9D8D7';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#D9D8D7', -0.2);
        eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_DECIDED;
        eventMeeting.statusMeeting = this.MeetingStatus.FIXED;
        eventMeeting.show = false;
        break;
      case '2':
        // Meeting fixed with MR is login
        eventMeeting.title = '自分との面会';
        eventMeeting.titlePopup = '自分との面会';
        eventMeeting.backgroundColor =  '#DFF0D8';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#DFF0D8', -0.2);
        eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_DECIDED;
        eventMeeting.statusMeeting = this.MeetingStatus.FIXED;
        eventMeeting.show = true;
        break;
      case '3':
        // request meeting with MR is login
        eventMeeting.title = '自分に面会リクエスト中';
        eventMeeting.titlePopup = '自分に面会リクエスト中';
        eventMeeting.backgroundColor =  '#FCF8E3';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#FCF8E3', -0.2);
        eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_DECIDED;
        eventMeeting.statusMeeting = this.MeetingStatus.NEW;
        eventMeeting.show = true;
        break;
      default:
        break;
    }
    eventMeeting.nameOffice = '';
    eventMeeting.allDay = false;
    return eventMeeting;
  }

  convertEventReceiveRequestOfMR(event: any, mediatorRequest: any) {
    const eventMeeting = new EventMeeting();
    switch (event.title) {
      case '0':
        // Meeting fixed with Doctor is login
        eventMeeting.title = '自分との面会';
        eventMeeting.titlePopup = (mediatorRequest) ? (mediatorRequest.lastName + ' ' + mediatorRequest.firstName + 'さんとの面会') : '自分との面会';
        eventMeeting.backgroundColor =  '#DFF0D8';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#DFF0D8', -0.2);
        eventMeeting.statusMeeting = this.MeetingStatus.FIXED;
        eventMeeting.show = true;
        break;
      case '1':
        // Meeting fixed with Doctor#
        eventMeeting.title = '予定あり';
        eventMeeting.backgroundColor =  '#D9D8D7';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#D9D8D7', -0.2);
        eventMeeting.statusMeeting = this.MeetingStatus.FIXED;
        eventMeeting.show = false;
        break;
      case '2':
        // request meeting with Doc tor is login
        eventMeeting.title = '自分に面会リクエスト中';
        eventMeeting.titlePopup = '自分に面会リクエスト中';
        eventMeeting.backgroundColor =  '#FCF8E3';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#FCF8E3', -0.2);
        eventMeeting.statusMeeting = this.MeetingStatus.NEW;
        eventMeeting.show = true;
        break;
      case '3':
        // request meeting with Doc tor is login
        // check request has frameId
        eventMeeting.title = '自分との面会に応募中';
        eventMeeting.titlePopup = '自分との面会に応募中';
        eventMeeting.backgroundColor =  '#FCF8E3';
        eventMeeting.borderColor = this.calendarCommon.hexToRgba('#FCF8E3', -0.2);
        eventMeeting.statusMeeting = this.MeetingStatus.NEW;
        eventMeeting.show = true;
        break;
      default:
        break;
    }
    eventMeeting.calendarType = this.calendarCommon.calendarType.MEETING_DECIDED;
    eventMeeting.nameOffice = '';
    eventMeeting.allDay = false;
    return eventMeeting;
  }

  /**
   * // setting meeting: sort ascending day in list settingDayList
   * @param setting
   * @returns {any}
   */
  sortSettingDayListMeeting(setting) {
    const settingDayList = setting.settingDayList;
    const maxDay = new Array(7);

    // check setting meeting
    if (settingDayList.length === 0) {
      for (let i = 0; i < maxDay.length; i++) {
        const settingDay = new MeetingSettingDay(i, new Array, this.SettingType.NONE);
        settingDayList.push(settingDay);
      }
    } else {
      for (let i = 0; i < settingDayList.length; i++) {
        if (i < settingDayList.length - 1) {
          for (let j = i + 1; j < settingDayList.length; j++) {
            if (settingDayList[i].day > settingDayList[j].day) {
              const tg = settingDayList[i];
              settingDayList[i] = settingDayList[j];
              settingDayList[j] = tg;
            } else {
              // do nothing
            }
          }
        }

        // sort data settingTimeList
        const settingTimeList = settingDayList[i].settingTimeList;
        for (let k = 0; k < settingTimeList.length - 1; k++) {
          for (let j = k + 1; j < settingTimeList.length; j++) {
            if (this.helper.convertTimeIso(settingTimeList[k].start) > this.helper.convertTimeIso(settingTimeList[j].start)) {
              const tg = settingTimeList[k];
              settingTimeList[k] = settingTimeList[j];
              settingTimeList[j] = tg;
            } else {
              // do nothing
            }
          }
        }

        settingDayList[i].settingType = this.SettingType[settingDayList[i].settingType];
      }
    }
    return setting;
  }
}
