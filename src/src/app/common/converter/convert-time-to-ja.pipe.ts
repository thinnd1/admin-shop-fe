import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({
  name: 'convertTimeToJa',
  pure: false
})

export class ConvertTimeToJaPipe implements PipeTransform {
  private timer: any;

  constructor(private translate: TranslateService) {
  }

  transform(value: string, format: string) {
    let strDateTime = '';
    if (value) {
      value.toString();
      value = value.replace(' UTC', '');
      let d;
      d = moment(value).format();
      d = new Date(d);
      this.timer = {
        year: d.getFullYear(),
        month: ('0' + (d.getMonth() + 1)).slice(-2),
        date: ('0' + d.getDate()).slice(-2),
        day: d.toLocaleString(this.translate.currentLang, {weekday: 'short'}),
        hour: ('0' + d.getHours()).slice(-2),
        minute: ('0' + d.getMinutes()).slice(-2)
      };
      switch (format) {
        case "M/D H:S":
          this.translate.get('COMMON_LABEL').subscribe((msg) => {
            strDateTime = this.timer.month + msg.MONTH + this.timer.date + msg.DAY +
              '(' + this.timer.day + ')' + '　' + this.timer.hour + ':' + this.timer.minute;
          });
          return strDateTime;
        case "Y/M/D":
          this.translate.get('COMMON_LABEL').subscribe((msg) => {
            strDateTime = this.timer.year + msg.YEAR + this.timer.month + msg.MONTH + this.timer.date + msg.DAY +
              '(' + this.timer.day + ')';
          });
          return strDateTime;
        case "Y/M":
          this.translate.get('COMMON_LABEL').subscribe((msg) => {
            strDateTime = this.timer.year + msg.YEAR + this.timer.month + msg.MONTH;
          });
          return strDateTime;
        case "M/D":
          this.translate.get('COMMON_LABEL').subscribe((msg) => {
            strDateTime = this.timer.month + msg.MONTH + this.timer.date + msg.DAY +
              '(' + this.timer.day + ')';
          });
          return strDateTime;
        case "H:S":
          return this.timer.hour + ':' + this.timer.minute;
        case "YYYY/MM/DD":
          strDateTime = this.timer.year + '/' + this.timer.month + '/' + this.timer.date;
          return strDateTime;
        default:
          return value;
      }
    } else {
      return;
    }
  }
}
