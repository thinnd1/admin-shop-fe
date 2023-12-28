import { Injectable } from '@angular/core';
import {UserSession} from '../models/ba/user-session';
import {SharedValueService} from '../services/shared-value.service';
declare var moment: any;

@Injectable()
export class CalendarCommon {
  public static VIEW_MONTH = 0;
  public static VIEW_WEEK = 1;
  public static VIEW_SUNDAY = 0;
  public static VIEW_MONDAY = 1;
  public calendarType = {
    'MY': 0,
    'STAFF': 1,
    'INSIDE_GROUP': 2,
    'OUTSIDE_GROUP': 3,
    'MEETING_DECIDED': 4,
    'MEETING_ACCEPTING': 5, // frame meeting
    'MEETING_MEDIATOR': 6,
    'BRIEFING': 7,
    'VISIT': 8,
    'SOCIETY': 9,
    'HOLIDAY': 10,
    'EXTERNAL': 11,
    'MEETING_REQUEST_MEDIATOR': 12,
    'UNRECOGNIZED': -1
  };

  public shareStatus = {
    'DENY': null,
    'SCHEDULE_ONLY': 'SCHEDULE_ONLY',
    'READ_ONLY': 'READ_ONLY',
    'EDITABLE': 'EDITABLE'
  };
  public userSession: UserSession;

  constructor(private sharedValueService: SharedValueService) {
    this.userSession = this.sharedValueService.getUserSession();
  }

  convertEvent(listEvent, defaultView) {
    const date = new Date();
    const currentDate = moment(date).format();

    const arrEvent = new Array();
    if (listEvent) {
      for (let i = 0; i < listEvent.length; i++) {
        let event = {};
        event['title'] = this.convertTitleEvent(listEvent[i], defaultView);
        event = this.setColorEvent(listEvent[i], currentDate, event, defaultView);
        event = this.setTimeEvent(listEvent[i], event, defaultView);
        event = this.setOrderEvent(listEvent[i], event);

        event['id'] = listEvent[i].id;
        event['titleRoot'] = listEvent[i].title;
        event['calendarType'] = listEvent[i].calendarType;
        event['calendarId'] = listEvent[i].calendarId;
        event['meetingId'] = listEvent[i].meetingId;
        event['visitId'] = listEvent[i].visitId;

        arrEvent.push(event);
      }
    }
    return arrEvent;
  }

  setColorEvent(event, currentDate, eventColor, defaultView) {
    let color: string;
    let border: string;
    let colorText: string;
    if (event.allDay || defaultView === 'agendaWeek') {
      if (moment(currentDate).format('YYYYMMDD') > moment(event.end).format('YYYYMMDD')) {
        color = this.convertColorHexOpacity(event.color, 0.3);
        border = this.convertColorHex(event.color);
        eventColor['textColor'] = '#666666';
      } else {
        color = this.convertColorHex(event.color);
        border = this.convertColorHexOpacity(event.color, -0.3);
        eventColor['textColor'] = '#212121';
      }
      eventColor['backgroundColor'] = color;
      eventColor['borderColor'] = border;
    } else {
      if (moment(currentDate).format('YYYYMMDD') >  moment(event.end).format('YYYYMMDD')) {
        color = this.convertColorHexOpacity(event.color, 0.3);
        border = this.convertColorHex(event.color);
        colorText = '#666666';
      } else {
        color = this.convertColorHex(event.color);
        border = this.convertColorHexOpacity(event.color, -0.3);
        colorText = '#212121';
      }

      if (moment(event.end).format('YYYYMMDD') !==  moment(event.start).format('YYYYMMDD')) {
        eventColor['backgroundColor'] = color;
        eventColor['borderColor'] = border;
        eventColor['textColor'] = colorText;
      } else {
        eventColor['backgroundColor'] = 'transparent';
        eventColor['borderColor'] = 'transparent';
        eventColor['textColor'] = color;
      }
    }
    return eventColor;
  }

  setTimeEvent(event, eventTime, defaultView: string) {
    if (event.allDay) {
      if (moment(event.end).format('YYYYMMDD') !==  moment(event.start).format('YYYYMMDD')) {
        eventTime['isMultipleDay'] = true;
        eventTime['start'] = moment(event.start).format('YYYY-MM-DD');
        eventTime['end'] = moment(event.end).clone().add(1, 'day').format('YYYY-MM-DD');
      } else {
        eventTime['isMultipleDay'] = false;
        eventTime['start'] = moment(event.start).format('YYYY-MM-DD');
        eventTime['end'] = moment(event.end).format('YYYY-MM-DD');
      }
      eventTime['allDay'] = event.allDay;
    } else {
      if (moment(event.end).format('YYYYMMDD') !== moment(event.start).format('YYYYMMDD')) {
        eventTime['isMultipleDay'] = true;
      } else {
        eventTime['isMultipleDay'] = false;
      }
      eventTime['allDay'] = event.allDay;
      eventTime['startEvent'] = moment(event.start).format();
      eventTime['endEvent'] = moment(event.end).format();
      eventTime['start'] = moment(event.start).format();
      eventTime['end'] = moment(event.end).format();

      if (defaultView === 'agendaWeek') {
        if (moment(event.start).add(0.25, 'hours').format('YYYYMMDDHHmm') > moment(event.end).format('YYYYMMDDHHmm') &&
          moment(event.end).format('YYYYMMDD') === moment(event.start).format('YYYYMMDD')) {
          if (moment(event.start).format('HH:mm') === '23:55' || moment(event.start).format('HH:mm') === '23:50') {
            eventTime['start'] = moment(event.start).format('YYYY-MM-DDT' + '23:45' + 'ZZ');
            eventTime['end'] = moment(event.start).add(1, 'days').format('YYYY-MM-DDT' + '00:00' + 'ZZ');
          } else {
            if (moment(event.start).add(0.25, 'hours').format('YYYYMMDD') === moment(event.end).format('YYYYMMDD')) {
              eventTime['end'] = moment(event.start).add(0.25, 'hours').format();
            }
          }
        }
        if (moment(event.end).format('YYYYMMDD') !== moment(event.start).format('YYYYMMDD')) {
          if (moment(event.start).format('HH:mm') === '23:55' || moment(event.start).format('HH:mm') === '23:50') {
            eventTime['start'] = moment(event.start).format('YYYY-MM-DDT' + '23:45' + 'ZZ');
          }
          if (moment(event.end).format('HH:mm') === '00:05' || moment(event.end).format('HH:mm') === '00:10') {
            eventTime['end'] = moment(event.end).format('YYYY-MM-DDT' + '00:15' + 'ZZ');
          }
        }
      }
    }
    return eventTime;
  }

  setOrderEvent(event, eventOrder) {
    switch (event.calendarType) {
      case this.calendarType.VISIT:
        eventOrder['order'] = 1;
        break;
      case this.calendarType.MY:
        eventOrder['order'] = 2;
        break;
      case this.calendarType.EXTERNAL:
        eventOrder['order'] = 2;
        break;
      case this.calendarType.STAFF:
        eventOrder['order'] = 3;
        break;
      case this.calendarType.HOLIDAY:
        eventOrder['order'] = 4;
        break;
      case this.calendarType.INSIDE_GROUP:
        eventOrder['order'] = 5;
        break;
      case this.calendarType.OUTSIDE_GROUP:
        eventOrder['order'] = 6;
        break;
      case this.calendarType.MEETING_ACCEPTING:
        eventOrder['order'] = 7;
        break;
      case this.calendarType.MEETING_MEDIATOR:
        eventOrder['order'] = 7;
        break;
      case this.calendarType.MEETING_DECIDED:
        eventOrder['order'] = 8;
        break;
      case this.calendarType.MEETING_REQUEST_MEDIATOR:
        eventOrder['order'] = 8;
        break;
      case this.calendarType.BRIEFING:
        eventOrder['order'] = 9;
        break;
      case this.calendarType.SOCIETY:
        eventOrder['order'] = 10;
        break;
      default:
        eventOrder['order'] = 11;
        break;
    }
    return eventOrder;
  }

  convertColorHex(color: number) {
    const colorHex = this.convertMaxLengthHex(color);
    return '#' + colorHex;
  }

  convertMaxLengthHex(color: number) {
    const maxLengthHex = 6;
    let text = '';
    const colorHex = color.toString(16);
    if (colorHex.length < 6) {
      for (let i = 0; i < (maxLengthHex - colorHex.length); i++) {
        text += '0';
      }
    }
    return text + colorHex;
  }

  convertColorHexOpacity(color: number, alpha: number) {
    return this.hexToRgba(this.convertMaxLengthHex(color), alpha);
  }

  hexToRgba(hex, alpha: number) {
    const colors1 = hex.match(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);

    if (colors1) {
      const r1 = parseInt(colors1[1], 16);
      const g1 = parseInt(colors1[2], 16);
      const b1 = parseInt(colors1[3], 16);

      let r = Math.floor((1 + alpha) * r1);
      let g = Math.floor((1 + alpha) * g1);
      let b = Math.floor((1 + alpha) * b1);

      r = (r > 255) ? r1 : r;
      g = (g > 255) ? g1 : g;
      b = (b > 255) ? b1 : b;

      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    } else {
      return null;
    }
  }

  convertTitleEvent(event, defaultView: string) {
    let title: string;
    switch (event.calendarType) {
      case this.calendarType.MEETING_ACCEPTING:
        title = '[面会枠]' + this.getTimeEventMonth(event) + ' ' + event.title;
        break;
      case this.calendarType.MEETING_DECIDED:
        title = '[面会]' + this.getTimeEventMonth(event) + ' ' + event.title;
        break;
      case this.calendarType.MEETING_REQUEST_MEDIATOR:
        title = '[面会]' + this.getTimeEventMonth(event) + ' ' + event.title;
        break;
      case this.calendarType.SOCIETY:
        title = event.title;
        // title = (defaultView === 'month') ? ('[学会]' + this.getTimeEventMonth(event) + ' ' + event.title) : ('[学会]' + event.title);
        break;
      case this.calendarType.VISIT:
        // title = event.title;
        title = (defaultView !== 'month') ? ('[訪問]' + this.getTimeEventMonth(event) + '\n' + event.title + 'さん来訪') : ('[訪問]' + event.title + 'さん来訪');
        break;
      case  this.calendarType.STAFF:
        title = (defaultView === 'month') ? (this.checkAllDayGetTitle(event) + ' ' + event.title) : event.title;
        break;
      case this.calendarType.MY:
        title = (defaultView === 'month') ? (this.checkAllDayGetTitle(event) + ' ' +  event.title) : event.title;
        break;
      case this.calendarType.MEETING_MEDIATOR:
        title = '[面会枠]' + this.getTimeEventMonth(event) + ' ' + event.title;
        break;
      case this.calendarType.INSIDE_GROUP:
        title = (defaultView === 'month') ? (this.checkAllDayGetTitle(event) + ' ' +  event.title) : event.title;
        break;
      case this.calendarType.OUTSIDE_GROUP:
        title = (defaultView === 'month') ? (this.checkAllDayGetTitle(event) + ' ' +  event.title) : event.title;
        break;
      case this.calendarType.EXTERNAL:
        title = (defaultView === 'month') ? (this.checkAllDayGetTitle(event) + ' ' +  event.title) : event.title;
        break;
      default:
        title =  (defaultView === 'month') ? (this.checkAllDayGetTitle(event)  + ' ' + event.title) : event.title;
        break;
    }
    return title;
  }

  getTimeEventMonth(event) {
    let begin: string;
    let end: string;
    let time: string;

    switch (event.calendarType) {
      case this.calendarType.MEETING_ACCEPTING:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        end = event.end ? moment(event.end).format('H:mm') : null;
        time = begin + '-' + end;
        break;
      case this.calendarType.MEETING_DECIDED:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        time = begin;
        break;
      case this.calendarType.MEETING_REQUEST_MEDIATOR:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        time = begin;
        break;
      case this.calendarType.VISIT:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        end = event.end ? moment(event.end).format('H:mm') : null;
        time = begin + '-' + end;
        break;
      case this.calendarType.SOCIETY:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        end = event.end ? moment(event.end).format('H:mm') : null;
        time = begin + '-' + end;
        break;
      case this.calendarType.MY:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        end = event.end ? moment(event.end).format('H:mm') : null;
        time = begin + '-' + end;
        break;
      case this.calendarType.MEETING_MEDIATOR:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        end = event.end ? moment(event.end).format('H:mm') : null;
        time = begin + '-' + end;
        break;
      default:
        begin = event.start ? moment(event.start).format('H:mm') : null;
        time = begin;
        break;
    }
    return time;
  }

  checkAllDayGetTitle(event) {
    let title: string;
    if (event.allDay) {
      title = '';
    } else {
      const time = event.start ? moment(event.start).format('H:mm') : null;
      title = time;
    }
    return title;
  }

  getTimeEvent(event) {
    let begin: string;
    let end: string;
    let time: string;
    if (event.allDay) {
      begin = this.dateConvert(event.start, event.allDay);
      if (event.end && (moment(event.end).format('YYYYMMDD') !== moment(event.start).format('YYYYMMDD'))) {
        end = this.dateConvert(event.end, event.allDay);
      } else {
        end = null;
      }
    } else {
      begin = this.dateConvert(event.start, event.allDay);
      if (event.end && moment(event.start).format('YYYYMMDD') !== moment(event.end).format('YYYYMMDD')) {
        // end = event.end ? moment(event.end).format('M月D日' + '\(' + this.getWeekdayJapanese(event.end) + 'H:mm') : null;
        end = this.dateConvert(event.end, event.allDay);
      } else {
        end = event.end ? moment(event.end).format('H:mm') : null;
      }
    }

    time = begin;
    if (end) {
      time += '〜' + end;
    }

    return time;
  }

  dateConvert(time, allday: boolean) {
    let month: string;
    let hours: string;
    let dateConvert = null;

    if (time) {
      month = moment(time).format('M月D日');
      if (!allday) {
        hours = moment(time).format('H:mm');
        dateConvert = month + this.getWeekdayJapanese(time) + hours;
      } else {
        dateConvert = month + this.getWeekdayJapanese(time);
      }
    }

    return dateConvert;
  }

  getWeekdayJapanese(m) {
    const days = [
      '(日)',
      '(月)',
      '(火)',
      '(水)',
      '(木)',
      '(金)',
      '(土)',
    ];

    return days[moment(m).isoWeekday() % 7];
  }

  convertDatetime(datetime: any) {
    let date;
    let dateData;
    dateData = moment(datetime).format();
    dateData = new Date(dateData);
    const year = dateData.getFullYear();
    const month = dateData.getMonth() + 1;
    const day = dateData.getDate();
    const hour = moment(datetime).format('HH:mm');

    const dateFull = {'year': year, 'month' : month, 'day': day};
    date = {
      'date': dateFull,
      'time': hour
    };
    return date;
  }

  convertDataMapDatepicker(datetime: any) {
    let date;
    const hour = moment(datetime).format('HH:mm');
    const dateFull = moment(datetime).format('YYYY-MM-DD');
    date = {
      'date': dateFull,
      'time': hour
    };
    return date;
  }

  convertDateTimeIso(date: any, time: any) {
    let fullTime;
    const day = parseInt(date.day, 0);
    const month = parseInt(date.month , 0) - 1;
    const year = parseInt(date.year, 0);
    const Time = time.split(':');
    const hour = parseInt(Time[0], 0 );
    const minutes = parseInt(Time[1], 0);
    fullTime = new Date(year, month, day, hour, minutes);
    fullTime = moment(fullTime).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
    return fullTime;
  }

  convertDateTime(date: string, time: any) {
    let fullTime;
    const day =  parseInt(moment(date).format('DD') , 0);
    const month = parseInt(moment(date).format('MM') , 0) - 1;
    const year = parseInt(moment(date).format('YYYY'), 0);
    const Time = time.split(':');
    const hour = parseInt(Time[0], 0 );
    const minutes = parseInt(Time[1], 0);
    fullTime = new Date(year, month, day, hour, minutes);
    fullTime = moment(fullTime).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
    return fullTime;
  }


  convertDateTimeIsoAllDay(date: string) {
    let fullTime;
    const day = parseInt(moment(date).format('DD'), 0);
    const month = parseInt(moment(date).format('MM') , 0) - 1;
    const year = parseInt(moment(date).format('YYYY'), 0);
    fullTime = new Date(year, month, day);
    fullTime = moment(moment(fullTime).format('YYYY-MM-DD')).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
    return fullTime;
  }

  genTimePicker(timePicker) {
    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j < 60; j += 5) {
        let a = '';
        if (i < 10) {
          if (j < 10) {
            a = '0' + i.toString() + ':0' + j.toString();
          } else {
            a = '0' + i.toString() + ':' + j.toString();
          }
        } else {
          if (j < 10) {
            a = i.toString() + ':0' + j.toString();
          } else {
            a = i.toString() + ':' + j.toString();
          }
        }
        timePicker.push(a);
      }
    }
  }

  isAllDay(date) {
    if (moment(date).format('HH:ss') === '00:00') {
      return true;
    } else {
      return false;
    }
  }

  genSlots(timeLimit) {
    const slots = [5, 10, 15, 30, 45, 60];
    const result = slots.filter(slot => slot === 5 || slot <= timeLimit);
    return result;
  }

}
