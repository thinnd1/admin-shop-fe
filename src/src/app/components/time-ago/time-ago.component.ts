import {Component, Input, OnInit, DoCheck} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
declare const moment: any;

@Component({
  selector: 'app-time-ago',
  templateUrl: './time-ago.component.html',
  styleUrls: ['./time-ago.component.scss'],
  preserveWhitespaces: false
})
export class TimeAgoComponent implements OnInit, DoCheck {
  @Input('editDate') editDate: Date;
  @Input() isEdit: boolean;
  editDateText: string;
  lastTime: Date;

  @Input('editDate')
  set date(v: any) {
    if (v) {
      this.editDate = v;
    }
  }

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.timeAgo(this.editDate);
  }

  ngDoCheck() {
    // moment(date) doesn't working in IE => moment(new Date(date))
    if (!moment(new Date(this.editDate)).isSame(new Date(this.lastTime))) {
      this.lastTime = this.editDate;
      this.timeAgo(this.lastTime);
    }
  }

  getDisplayedText(key: string) {
    let text = '';
    this.translate.get('GR0013.TIME_AGO').subscribe(msg => {
      text = msg[key];
    });
    return text;
  }

  timeAgo(editDate: Date) {
    if (editDate) {
      const currentDateTime = new Date();
      this.lastTime = new Date(editDate);
      const seconds = Math.round(Math.abs((currentDateTime.getTime() - this.lastTime.getTime()) / 1000));
      const minutes = Math.floor(Math.abs(seconds / 60));
      const hours = Math.floor(Math.abs(minutes / 60));
      const days = Math.floor(Math.abs(hours / 24));
      const months = Math.floor(Math.abs(days / 30.416));
      const years = Math.floor(Math.abs(days / 365));
      if (Number.isNaN(seconds)) {
        return '';
      } else if (seconds <= 59) {
        this.editDateText =  seconds + this.getDisplayedText('SECONDS');
      } else if (minutes <= 59) {
        this.editDateText = minutes + this.getDisplayedText('MINUTES');
      } else if (hours <= 23) {
        this.editDateText = hours + this.getDisplayedText('HOURS');
      } else if (days <= 30) {
        this.editDateText = days + this.getDisplayedText('DAYS');
      } else if (days <= 364) {
        this.editDateText = months + this.getDisplayedText('MONTHS');
      } else {
        this.editDateText = years + this.getDisplayedText('YEARS');
      }
    }
  }

}
