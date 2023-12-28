import {Component, Input, Output, EventEmitter, Injectable, ElementRef, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbDatepickerConfig, NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

const I18N_VALUES = {
  'ja': {
    weekdays: ['月', '火', '水', '木', '金', '土', '日'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  'en': {
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }
};

@Injectable()
export class I18n {
  constructor(private translate: TranslateService){
  }
  language = this.translate.currentLang;
}

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: DateInputComponent}]
})
export class DateInputComponent extends NgbDatepickerI18n implements OnInit {
  model;
  @Input() date: string;
  @Input() isDisable: boolean;
  @Input() showIcon: boolean;
  @Input() hasDanger: boolean;
  @Input() dateInputOptions: any = {
    id: null,
    name: null,
    placeholder: null,
    minDate: null,
    maxDate: null,
    outsideDays: false,
    weekendsDisable: false
  };
  @Output() dateChanged = new EventEmitter<any>();
  public datepickerConfig: any;

  constructor(private _i18n: I18n, private translate: TranslateService, config: NgbDatepickerConfig, private eref: ElementRef) {
    super();
    this.datepickerConfig = config;
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }

  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  setDatepicker() {
    const config = this.datepickerConfig;
    const options = this.dateInputOptions;
    if (options.outsideDays) {
      config.outsideDays = 'hidden';
    }
    if (options.weekendsDisable) {
      config.markDisabled = (date: NgbDateStruct) => {
        const d = new Date(date.year, date.month - 1, date.day);
        return d.getDay() === 0 || d.getDay() === 6;
      };
    }
  }

  ngOnInit() {
    this.setDatepicker();
    // this.model = this.dateConvert(this.date, true);
  }

  @Input('date')
  set value(date: string) {
    this.model = date ? date : '';
    this.model = this.dateConvert(this.model, true);
  }

  dateConvert(date: any, flag: boolean) {
    if (flag) {
      // Input
      if (!moment(date, 'YYYY-MM-DD').isValid()) {
        return false;
      }
      const m = moment(date);
      const obj = m.toObject();
      return { year: obj.years, month: obj.months + 1, day: obj.date };
    } else {
      date.month -= 1;
      return moment(date).format();
    }
  }

  changeFields() {
    const val = this.dateConvert(this.model, false);
    this.dateChanged.emit(val);
  }
}
