import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {EventDetailsSettingValidator} from '../../../models/ca/event-details-setting-validator';
import {CalendarCommon} from '../../../common/calendar-common';
import {RRule, RRuleSet} from 'rrule';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class FrameMeetingPageRrule {
  monthOptionRepeat = {
    'BY_MONTH_DAY': 'BYMONTHDAY',
    'BY_DAY_OF_WEEK': 'BYDAYOFWEEK'
  };
  dayOfWeek = {
    'sunday': RRule.SU,
    'monday': RRule.MO,
    'tuesday': RRule.TU,
    'wednesday': RRule.WE,
    'thursday': RRule.TH,
    'friday': RRule.FR,
    'saturday': RRule.SA
  };
  repeatOption = {
    noRepeat: '0',
    daily: '1',
    weekdayOnly: '2',
    weekly: '3',
    monthly: '4',
    yearly: '5',
    importCalendar: '6'
  };
  endDate = {
    'none': 'NONE',
    'count_time': 'COUNT_TIME',
    'until_day': 'UNTIL_DAY'
  };

  constructor(private calendarCommon: CalendarCommon, private translate: TranslateService) {
  }

  getWeekOfMonth(dateTime) {
    let t;
    t = dateTime.clone();
    const firstDayOfWeek = t.startOf('month').isoWeekday() % 7;
    const fixedDate = dateTime.date() + firstDayOfWeek;
    const fixedEndDate = t.endOf('month').date() + firstDayOfWeek;
    const weekNum = Math.ceil(fixedDate / 7);
    const endWeekNum = Math.ceil(fixedEndDate / 7);

    if (weekNum === endWeekNum) {
      return -1;
    }
    return Math.floor((dateTime.date() - 1) / 7) + 1;
  }

  getWeekday(dateTime) {
    let days;
    days = [
      RRule.SU, // 6
      RRule.MO, // 0
      RRule.TU, // 1
      RRule.WE, // 2
      RRule.TH, // 3
      RRule.FR, // 4
      RRule.SA  // 5
    ];
    return days[dateTime.isoWeekday() % 7];
  }

  getCheckedDayOfWeek(rrule: any) {
    let days;
    days = [];
    for (const field in this.dayOfWeek) {
      if (this.dayOfWeek.hasOwnProperty(field)) {
        if (rrule[field]) {
          days.push(this.dayOfWeek[field]);
        }
      }
    }
    return days;
  }


  // config repeat rrule
  repeatRuleConfig(model: any, option, startDay) {
    startDay = moment(startDay);
    const rule: any = {};
    // rule.dtstart = new Date(startDay.format('YYYY-MM-DD'));
    switch (option) {
      case this.repeatOption.daily:
        rule.freq = RRule.DAILY;
        rule.interval = model.repeatInterval;
        break;
      case this.repeatOption.weekdayOnly:
        rule.freq = RRule.WEEKLY;
        rule.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
        rule.interval = 1;
        break;
      case this.repeatOption.weekly: // 毎週
        rule.freq = RRule.WEEKLY;
        rule.byweekday = this.getCheckedDayOfWeek(model);
        rule.interval = model.repeatInterval;
        break;
      case this.repeatOption.monthly: // 毎月
        rule.freq = RRule.MONTHLY;
        rule.interval = model.repeatInterval;
        if (model.monthRepeatOption === this.monthOptionRepeat.BY_MONTH_DAY) {
          rule.bymonthday = startDay.date();
        }
        if (model.monthRepeatOption === this.monthOptionRepeat.BY_DAY_OF_WEEK) {
          rule.byweekday = this.getWeekday(startDay);
          rule.bysetpos = this.getWeekOfMonth(startDay);
        }
        break;
      case this.repeatOption.yearly: // 毎年
        rule.freq = RRule.YEARLY;
        rule.interval = model.repeatInterval;
        break;
    }

    const finishType = model.endFrame;
    switch (finishType) {
      case this.endDate.none:
        break;
      case this.endDate.count_time:
        rule.count = model.countTime <= 100 ? model.countTime : 100;
        break;
      case this.endDate.until_day:
        rule.until = moment(model.untilDay).format();
        break;
    }
    return new RRule(rule);
  }

  getRepeatSummary(rrule) {
    let dayNames;
    dayNames = [
      '月曜',
      '火曜',
      '水曜',
      '木曜',
      '金曜',
      '土曜',
      '日曜'
    ];
    let summary = '';
    const options = rrule.options;
    switch (options.freq) {
      case RRule.DAILY:
        if (parseInt(options.interval, 0) === 1) {
          summary = '毎日 ';
        } else {
          summary = options.interval + '日ごと ';
        }
        break;
      case RRule.MONTHLY:
        if (parseInt(options.interval, 0) === 1) {
          summary = '毎月 ';
        } else {
          summary = options.interval + 'か月ごと ';
        }
        if (options.bymonthday.length === 1) {
          summary += options.bymonthday[0] + '日';
        } else if (dayNames[options.byweekday[0]]) {
          if (options.bysetpos[0] === -1) {
            summary += '最終' + dayNames[options.byweekday[0]] + '日';
          } else {
            summary += '第' + options.bysetpos[0] + dayNames[options.byweekday[0]] + '日';
          }
        }
        break;
      case RRule.WEEKLY:
        if (parseInt(options.interval, 0) === 1) {
          summary = '毎週 ';
        } else {
          summary = options.interval + ' 週間ごと ';
        }
        let weekdays;
        weekdays = [];
        if (options.byweekday && options.byweekday.length > 0) {
          // if (this.isOnlyWeekDay(options.byweekday)) {
          //   summary += '平日';
          //   break;
          // }
          for (let i = 0; i < options.byweekday.length; i++) {
            if (i === options.byweekday.length - 1) {
              summary += dayNames[options.byweekday[i]] + '日';
            } else {
              summary += dayNames[options.byweekday[i]] + '日, ';
            }
          }
        }
        break;
      case RRule.YEARLY:
        if (!options.interval || options.interval === 1) {
          summary = '毎年 ';
        } else {
          summary = '' + options.interval + '年ごと';
        }
        break;
    }
    return summary;
  }

  getEndFrameSummary(rrule, type?) {
    const options = rrule.options;
    let summary = '';
    if (options.count) {
      summary += options.count + '回 まで';
    }
    if (options.until && options.until !== 'Invalid date') {
      const date = this.calendarCommon.convertDatetime(options.until).date;
      if (!type) {
        summary += +date.year + '年 ' + date.month + '月 ' + date.day + '日まで';
      } else {
        summary += moment(options.until).format('YYYY/MM/DD') + ' まで';
      }
    }
    return summary;
  }

  // config summary
  getSummary(rrule) {
    if (!rrule) {
      return '';
    }
    let summary = this.getRepeatSummary(rrule);
    const endFrame = this.getEndFrameSummary(rrule);
    if (endFrame) {
      summary += ', ' + endFrame;
    }
    return this.translate.currentLang === 'ja' ? summary : rrule.toText();
  }

  private isOnlyWeekDay(options) {
    const weekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
    const result = weekdays.filter(function (item) {
      return options.indexOf(item.weekday) === -1;
    });
    return (result.length === 0) && (options.length === weekdays.length);
  }
}
