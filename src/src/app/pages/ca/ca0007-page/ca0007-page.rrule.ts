import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {EventDetailsSettingValidator} from '../../../models/ca/event-details-setting-validator';
import {CalendarCommon} from '../../../common/calendar-common';
@Injectable()
export class Ca0007PageRrule {
  monthOptionRepeat = {
    'BY_MONTH_DAY': 'BYMONTHDAY',
    'BY_DAY_OF_WEEK': 'BYDAYOFWEEK'
  };
  dayOfWeek = {
    'sunday': 'SU',
    'monday': 'MO',
    'tuesday': 'TU',
    'wednesday': 'WE',
    'thursday': 'TH',
    'friday': 'FR',
    'saturday': 'SA'
  };
  repeatOption = {
    'no_repeat': 'NONE',
    'week': 'WEEKLY',
    'month': 'MONTHLY'
  };
  endDate = {
    'none': 'NONE',
    'count_time': 'COUNT_TIME',
    'until_day': 'UNTIL_DAY'
  };

  constructor(private calendarCommon: CalendarCommon) {}

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
    const RRule = require('rrule').RRule;
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

  getCheckDayOfWeek(rrule: any) {
    const RRule = require('rrule').RRule;
    let days;
    days = [];
    if (rrule.sunday) { days.push(RRule.SU); }
    if (rrule.monday) { days.push(RRule.MO); }
    if (rrule.tuesday) { days.push(RRule.TU); }
    if (rrule.wednesday) { days.push(RRule.WE);}
    if (rrule.thursday) { days.push(RRule.TH);}
    if (rrule.friday) { days.push(RRule.FR); }
    if (rrule.saturday) { days.push(RRule.SA); }
    return days;
  }


  // config rrule repeat week
  configRRuleWeek(rrule: any, startDay) {
    let rule, days, untilDay;
    const RRule = require('rrule').RRule;
    days = this.getCheckDayOfWeek(rrule);
    const currentDate = moment(startDay);
    if (rrule.endDate === this.endDate.none) {
      rule = new RRule({
        freq: RRule.WEEKLY,
        interval: rrule.repeatInterval,
        byweekday: days
      });
    } else if (rrule.endDate === this.endDate.count_time) {
      if (rrule.countTime !== null && rrule.countTime !== '') {
        rule = new RRule({
          freq: RRule.WEEKLY,
          interval: rrule.repeatInterval,
          byweekday: days,
          count: parseInt(rrule.countTime, 0)
        });
      }else {
        rule = new RRule({
          freq: RRule.WEEKLY,
          interval: rrule.repeatInterval,
          byweekday: days,
        });
      }
    } else if (rrule.endDate === this.endDate.until_day) {
      if (rrule.untilDay !== null && rrule.untilDay !== '') {
        untilDay = moment(rrule.untilDay).format('YYYY-MM-DDTHH:mm:ss' + '+0000');
        untilDay = moment(untilDay).format();
        rule = new RRule({
          freq: RRule.WEEKLY,
          interval: rrule.repeatInterval,
          byweekday: days,
          until: untilDay
        });
        console.log(rule);
      }else {
        untilDay = currentDate.format('YYYY-MM-DDTHH:mm:ss' + '+0000');
        untilDay = moment(untilDay).format();
        rule = new RRule({
          freq: RRule.WEEKLY,
          interval: rrule.repeatInterval,
          byweekday: days,
          until: untilDay
        });
      }
    }
    return rule;
  }

  // config rrule repeat month
  configRRuleMonth(rrule: any, startDay: any) {
    let rule, untilDay;
    const RRule = require('rrule').RRule;
    const currentDate = moment(startDay);
    if (rrule.monthRepeatOption === this.monthOptionRepeat.BY_MONTH_DAY) {
      if (rrule.endDate === this.endDate.none) {
        rule = new RRule({
          freq: RRule.MONTHLY,
          interval: rrule.repeatInterval,
          bymonthday: [currentDate.format('D')]
        });
      } else if (rrule.endDate === this.endDate.count_time) {
        if (rrule.countTime !== null && rrule.countTime !== '') {
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bymonthday: [currentDate.format('D')],
            count:  parseInt(rrule.countTime, 0)
          });
        }else {
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bymonthday: [currentDate.format('D')],
          });
        }
      } else if (rrule.endDate === this.endDate.until_day) {
        if (rrule.untilDay !== null && rrule.untilDay !== '') {
          untilDay = moment(rrule.untilDay).format('YYYY-MM-DDTHH:mm:ss' + '+0000');
          untilDay = moment(untilDay).format();
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bymonthday: [currentDate.format('D')],
            until: untilDay
          });
        }else {
          untilDay = currentDate.format('YYYY-MM-DDTHH:mm:ss' + '+0000');
          untilDay = moment(untilDay).format();
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bymonthday: [currentDate.format('D')],
            until: untilDay
          });
        }
      }
    } else if (rrule.monthRepeatOption === this.monthOptionRepeat.BY_DAY_OF_WEEK) {
      let weekOfMonth;
      let weekDay;
      weekOfMonth = this.getWeekOfMonth(moment(currentDate));
      weekDay = this.getWeekday(moment(currentDate));
      if (rrule.endDate === this.endDate.none) {
        rule = new RRule({
          freq: RRule.MONTHLY,
          interval: rrule.repeatInterval,
          bysetpos: weekOfMonth,
          byweekday: weekDay
        });
      } else if (rrule.endDate === this.endDate.count_time) {
        if (rrule.countTime !== null && rrule.countTime !== '') {
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bysetpos: weekOfMonth,
            byweekday: weekDay,
            count: parseInt(rrule.countTime, 0)
          });
        }else {
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bysetpos: weekOfMonth,
            byweekday: weekDay,
          });
        }
      } else if (rrule.endDate === this.endDate.until_day) {
        if (rrule.untilDay !== null && rrule.untilDay !== '') {
          untilDay = moment(rrule.untilDay).format('YYYY-MM-DDTHH:mm:ss' + '+0000');
          untilDay = moment(untilDay).format();
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bysetpos: weekOfMonth,
            byweekday: weekDay,
            until: untilDay
          });
        } else {
          untilDay = currentDate.format('YYYY-MM-DDTHH:mm:ss' + '+0000');
          untilDay = moment(untilDay).format();
          rule = new RRule({
            freq: RRule.MONTHLY,
            interval: rrule.repeatInterval,
            bysetpos: weekOfMonth,
            byweekday: weekDay,
            until: untilDay
          });
        }
      }
    }
    return rule;
  }


  // config repeat rrule
  repeatRuleConfig(rrule: any, option: string, startDay) {
    let rRuleObject;
    rRuleObject = {
      'RRULE_STRING': '',
      'RRULE_SUMARY': ''
    };
    if (option === this.repeatOption.no_repeat) {
      rRuleObject.RRULE_STRING = '';
      rRuleObject.RRULE_SUMARY = '';
    } else if (option === this.repeatOption.week) {
      let rule;
      rule = this.configRRuleWeek(rrule, startDay);
      rRuleObject.RRULE_STRING = rule.toString();
      rRuleObject.RRULE_SUMARY = this.getSummary(rule);
    } else if (option === this.repeatOption.month) {
      let rule;
      rule = this.configRRuleMonth(rrule, startDay);
      rRuleObject.RRULE_STRING = rule.toString();
      rRuleObject.RRULE_SUMARY = this.getSummary(rule);
    }
    return rRuleObject;
  }

  // config summary
  getSummary(rrule) {
    if (!rrule) {
      return '';
    }
    const RRule = require('rrule').RRule;
    let options;
    let summary = '';
    let dayNames;
    options = rrule.options;
    dayNames = [
      '月曜',
      '火曜',
      '水曜',
      '木曜',
      '金曜',
      '土曜',
      '日曜'
    ];
    switch (options.freq) {
      case 1:
        if (parseInt(options.interval, 0) === 1) {
          summary = '毎月 ';
        } else {
          summary = options.interval + 'か月ごと ' +
            ' ';
        }
        if (options.bymonthday.length === 1) {
          summary += options.bymonthday[0] + '日';
        } else {
          if (options.bysetpos[0] === -1) {
            summary += '最終' + dayNames[options.byweekday[0]] + '日';
          } else {
            summary += '第' + options.bysetpos[0] + dayNames[options.byweekday[0]] + '日';
          }
        }
        if (options.count !== null && !isNaN(options.count)) {
          summary += ' ' + options.count + '回';
        }
        if (options.until !== null) {
          const date = this.calendarCommon.convertDatetime(options.until).date;
          summary += ', ' + date.year + '年 ' + date.month + '月 ' + date.day + '日まで';
        }
        break;
      case 2:
        if (parseInt(options.interval, 0) === 1) {
          summary = '毎週 ';
        } else {
          summary = options.interval + ' 週間ごと ';
        }
        let weekdays;
        weekdays = [];
        if (options.byweekday && options.byweekday.length > 0) {
          for (let i = 0; i < options.byweekday.length; i++) {
            if ( i === options.byweekday.length - 1) {
              summary += dayNames[options.byweekday[i]] + '日';
            }else {
              summary += dayNames[options.byweekday[i]] + '日, ';
            }
          }
        }
        if (options.count !== null && !isNaN(options.count)) {
          summary += ' ' + options.count + '回';
        }
        if (options.until !== null) {
          const date = this.calendarCommon.convertDatetime(options.until).date;
          summary += ', ' + date.year + '年 ' + date.month + '月 ' + date.day + '日まで';
        }
        break;
    }
    return summary;
  }

  // map rrule inform edit event
  mapRRuleInForm(rrule: any, formModel: EventDetailsSettingValidator) {
    let options;
    const rrulestr = require('rrule').rrulestr;
    formModel.summary = this.getSummary(rrulestr(rrule));
    options = rrulestr(rrule).options;
    options.until = moment(options.until).format('YYYY-MM-DD');
    switch (options.freq) {
      case 1:
        formModel.repeatOption = this.repeatOption.month;
        formModel.repeatInterval = options.interval;
        if (options.bysetpos !== null) {
          formModel.monthRepeatOption = this.monthOptionRepeat.BY_DAY_OF_WEEK;
        }else {
          formModel.monthRepeatOption = this.monthOptionRepeat.BY_MONTH_DAY;
        }
        if ( options.count !== null) {
          formModel.endDate = this.endDate.count_time;
          formModel.countTime = options.count;
        }else if (options.until !== null) {
          formModel.endDate = this.endDate.until_day;
          formModel.untilDay = options.until;
        }else {
          formModel.endDate = this.endDate.none;
        }
        break;
      case 2:
        formModel.sunday = false;
        formModel.repeatOption = this.repeatOption.week;
        formModel.repeatInterval = options.interval;
        for (let i = 0; i < options.byweekday.length; i++) {
          if ( options.byweekday[i] === 6) { formModel.sunday = true; }
          if ( options.byweekday[i] === 0) { formModel.monday = true; }
          if ( options.byweekday[i] === 1) { formModel.tuesday = true; }
          if ( options.byweekday[i] === 2) { formModel.wednesday = true; }
          if ( options.byweekday[i] === 3) { formModel.thursday = true; }
          if ( options.byweekday[i] === 4) { formModel.friday = true; }
          if ( options.byweekday[i] === 5) { formModel.saturday = true; }
        }
        if (options.count !== null) {
          formModel.endDate = this.endDate.count_time;
          formModel.countTime = options.count;
        }else if (options.until !== null) {
          formModel.endDate = this.endDate.until_day;
          formModel.untilDay = options.until;
        }else {
          formModel.endDate = this.endDate.none;
        }
        break;
    }
  }
}
