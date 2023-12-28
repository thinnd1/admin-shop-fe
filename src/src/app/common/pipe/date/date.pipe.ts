import { Pipe, PipeTransform } from '@angular/core';
import { CalendarCommon } from '../../../common/calendar-common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({ name: 'hoursMinutesStartEnd' })
// date format 11:00~12:00
export class HoursMinutesStartEnd implements PipeTransform {
  transform(value: any): string {
    const time = Object.keys(value).map(function (key) { return value[key]; });
    time[0] = time[0].replace(' UTC', '+00:00');
    time[1] = time[1].replace(' UTC', '+00:00');
    const date = moment(time[0]).format('HH:mm') + '〜' + moment(time[1]).format('HH:mm');
    return date;
  }
}

@Pipe({
  name: 'timePipe',
  pure: true
})
// date format 11:00~12:00
export class TimePipe implements PipeTransform {

  constructor(private calendarCommon: CalendarCommon) { }
  transform(value: string, format: string) {
    let time = '';
    if (moment(value).isValid()) {
      switch (format) {
        case 'MM月DD日(date)':
          time = moment(value).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'M月D日(date)':
          time = moment(value).format('M月D日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'M月D日 HH:mm':
          time = moment(value).format('M月D日 HH:mm');
          break;
        case 'YYYY年MM月DD日(date)':
          time = moment(value).format('YYYY年MM月DD日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'YYYY年M月D日(date)':
          time = moment(value).format('YYYY年M月D日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'YYYY年MM月DD日':
          time = moment(value).format('YYYY年MM月DD日');
          break;
        case 'YYYY年M月D日':
          time = moment(value).format('YYYY年MM月DD日');
          break;
        case 'YYYY/MM/DD':
          time = moment(value).format('YYYY/MM/DD');
          break;
        case 'HH:mm:ss':
          time = moment(value).format('HH:mm:ss');
          break;
        case 'HH:mm':
          time = moment(value).format('HH:mm');
          break;
        case 'HH:mm ~':
          time = moment(value).format('HH:mm') + ' 〜 ' + moment(value).add( moment.duration(30, 'm')).format('HH:mm');
          break;
        default:
          time = moment(value).format(format);
      }
    }
    return time;
  }
}

