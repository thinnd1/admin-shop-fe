import {Injectable} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {CalendarCommon} from '../../../common/calendar-common';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Helper} from '../../../common/helper';
import {FrameMeetingPageRrule} from './frame-meeting-page.rrule';
import {MeetingCommon, SettingType} from '../../../common/meeting-common';

@Injectable()
export class FrameMeetingPageValidator {
  formErrors = {
    framePeriod: '',
    repeatRule: '',
    place: ''
  };
  private ca0004FormGroup: FormGroup;
  private SettingType: typeof SettingType = SettingType;

  constructor(private formBuilder: FormBuilder, private calendarCommon: CalendarCommon,
              private frameMeetingPageRRule: FrameMeetingPageRrule,
              private translate: TranslateService, private helper: Helper) {

  }

  createForm(model: any) {
    let form: FormGroup;
    form = this.formBuilder.group({
      'place': [model.place, [Validators.maxLength(20)]],
      'officeUserId': [model.officeUserId],
      'framePeriod': this.formBuilder.group({
        'start': [model.start],
        'end': [model.end]
      }, {
        validator: (formGroup: FormGroup) => {
          return this.validateFramePeriod();
        }
      }),
      'frameType': [model.frameType, Validators.compose([Validators.required])],
      'slots': [model.slots],
      'acceptRequest': [model.acceptRequest],
      'repeatOption': [model.repeatOption],
      'ignoreHoliday': [model.ignoreHoliday],
      'repeatRule': this.formBuilder.group({
        'endFrame': [model.endFrame],
        'repeatInterval': [model.repeatInterval],
        'sunday': [model.sunday],
        'monday': [model.monday],
        'tuesday': [model.tuesday],
        'wednesday': [model.wednesday],
        'thursday': [model.thursday],
        'friday': [model.friday],
        'saturday': [model.saturday],
        'endDate': [model.endDate],
        'countTime': [model.countTime, Validators.max(100)],
        'untilDay': [model.untilDay],
        'monthRepeatOption': [model.monthRepeatOption],
      }, {
        validator: (formGroup: FormGroup) => {
          return this.validateDays(formGroup);
        }
      })
    });
    return form;
  }

  /*
  *check validate form after submit
  */
  checkValidate(formModel) {
    let validationMessages;
    validationMessages = this.getValidationMessages();
    this.ca0004FormGroup = formModel;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.markTouch(formModel, field);
        this.formErrors[field] = this.helper.validateForm(this.ca0004FormGroup, field, validationMessages[field]);
      }
    }
    return this.formErrors;
  }

  markTouch(formModel, field) {
    if (formModel.controls.hasOwnProperty(field)) {
      const group = formModel.get(field);
      for (const inner in group.controls) {
        if (group.controls.hasOwnProperty(inner)) {
          group.get(inner).markAsTouched();
          group.get(inner).updateValueAndValidity();
        }
      }
      formModel.get(field).markAsTouched();
      formModel.get(field).updateValueAndValidity();
    }
  }

  getValidationMessages() {
    let messageValidationError;
    this.translate.get(['CA0004_PAGE']).subscribe((res) => {
      const ca0004 = res.CA0004_PAGE;
      messageValidationError = {
        'place': {
          'maxlength': ca0004.ERROR_VALIDATE.PLACE_LENGTH
        },
        'framePeriod': {
          'time_required': ca0004.ERROR_VALIDATE.TIME_REQUIRED,
          'not_in_past': ca0004.ERROR_VALIDATE.DATE_IN_THE_PAST,
          'not_today': ca0004.ERROR_VALIDATE.INVALID_DAY,
          'date_compare': ca0004.ERROR_VALIDATE.DATE_COMPARE,
          'time_compare': ca0004.ERROR_VALIDATE.TIME_COMPARE,
          'not_same_day': ca0004.ERROR_VALIDATE.NOT_SAME_DAY
        },
        'repeatRule': {
          'dayOfWeek_required': ca0004.ERROR_VALIDATE.RRULE_WEEK_DAY_OF_WEEK_NONE,
          'countTime_required': ca0004.ERROR_VALIDATE.COUNT_TIME_NONE,
          'untilDay_required': ca0004.ERROR_VALIDATE.UNTIL_DAY
        }
      };
    });
    return messageValidationError;
  }

  validateDays(formGroup: FormGroup) {
    const formValid: any = {};
    if (this.ca0004FormGroup && this.ca0004FormGroup.get('repeatOption').value !== this.frameMeetingPageRRule.repeatOption.noRepeat) {

      if (this.ca0004FormGroup.get('repeatOption').value === this.frameMeetingPageRRule.repeatOption.weekly) {
        const repeatRule = formGroup.value;
        if (!(repeatRule.monday || repeatRule.tuesday || repeatRule.wednesday || repeatRule.thursday
            || repeatRule.friday || repeatRule.saturday || repeatRule.sunday)) {
          formValid['dayOfWeek_required'] = {valid: false};
        }
      }
      if (formGroup.get('endFrame').value === this.frameMeetingPageRRule.endDate.count_time) {
        if (!formGroup.get('countTime').value) {
          formValid.countTime_required = {valid: false};
        }
      }
      if (formGroup.get('endFrame').value === this.frameMeetingPageRRule.endDate.until_day) {
        if (!formGroup.get('untilDay').value) {
          formValid.untilDay_required = {valid: false};
        }
      }
      return formValid;
    }

  }

  validateFramePeriod() {
    const formValid: any = {};
    if (this.ca0004FormGroup) {
      const startDay = this.ca0004FormGroup.get('framePeriod.start').value;
      const endDay = this.ca0004FormGroup.get('framePeriod.end').value;
      const startDay_moment = moment(startDay);
      const endDay_moment = moment(endDay);
      if (startDay && endDay) {
        if (startDay_moment.isBefore(moment(), 'day')) {
          formValid.not_in_past = {valid: false};
        } else {
          if (startDay_moment.isSame(moment(), 'day')) {
            formValid.not_today = {valid: false};
          }
          if (startDay_moment.isAfter(endDay_moment, 'day')) {
            formValid.date_compare = {valid: false};
          } else {
            if (startDay_moment.isSame(endDay_moment, 'day')) {
              if (startDay_moment.isSameOrAfter(endDay_moment)) {
                formValid.time_compare = {valid: false};
              }
              // OK
            } else {
              formValid.not_same_day = {valid: false};
            }
          }
        }
      } else {
        formValid.time_required = {valid: false};
      }
      return formValid;
    }

  }

  getUnavailableTimeInDay(settingOfWeekday, day) {
    const frameList = [];
    let startTime = moment('00:00', 'HH:mm');
    switch (settingOfWeekday.settingType) {
      case this.SettingType.NONE:
        break;
      case this.SettingType.SET_TIME:
        const timeList = settingOfWeekday.settingTimeList;
        for (let i = 0; i < timeList.length; i++) {
          const nextStart = moment(timeList[i].start, 'HH:mm');
          if (!nextStart.isSameOrBefore(startTime)) {
            frameList.push({
              day: day,
              start: startTime.format('HH:mm'),
              end: nextStart.format('HH:mm')
            });
          }
          startTime = moment(timeList[i].end, 'HH:mm');
        }
        frameList.push({
          day: day,
          start: startTime.format('HH:mm'),
          end: '23:59'
        });
        break;
      case this.SettingType.DISALLOW_ALL_DAY:
        frameList.push({
          day: day,
          start: '00:00',
          end: '23:59'
        });
        break;
    }
    return frameList;
  }

  settingOfWeek(selfSetting, hospitalSetting) {
    const settingDayList = selfSetting.settingDayList;
    for (let i = 0; i < settingDayList.length; i++) {
      if (settingDayList[i].settingType === 'NONE') {
        // if selfSetting is not set then take setting value of hospitalSetting
        const settingType = hospitalSetting.settingDayList[i].settingType;
        settingDayList[i].settingType = hospitalSetting.settingDayList[i].settingType;
        settingDayList[i].settingTimeList = hospitalSetting.settingDayList[i].settingTimeList;
        if (settingType === 'NONE') {
          // if both is not "SET_TIME" then empty settingTimeList
          settingDayList[i].settingTimeList = [];
        }
      }
    }
    // ???
    for (let i = 0; i < settingDayList.length; i++) {
      if (typeof settingDayList[i].settingType === 'string') {
        settingDayList[i].settingType = <any>this.SettingType[settingDayList[i].settingType];
      }
      settingDayList[i].settingTimeList = this.helper.sort('start', settingDayList[i].settingTimeList);
    }
    return settingDayList;
  }

  getSpecificViolatedTime(listSettingRule, violated) {
    const listTimePeriod = [];
    for (let i = 0; i < listSettingRule.length; i++) {
      const startDay = moment(violated.start).format('YYYY-MM-DD');
      const startTime = moment(violated.start).format('HH:mm');
      const endTime = moment(violated.end).format('HH:mm');
      if (endTime >= listSettingRule[i].start && startTime < listSettingRule[i].end) {
        listTimePeriod.push({
          day: startDay,
          start: startTime < listSettingRule[i].start ? listSettingRule[i].start : startTime,
          end: endTime < listSettingRule[i].end ? endTime : listSettingRule[i].end
        });
      }
    }
    return listTimePeriod;
  }

  mapDataToSend(model, userSession) {
    return {
      userId: model.userId,
      officeUserId: model.officeUserId,
      officeId: model.officeId,
      start: model.start,
      end: model.end,
      frameType: model.frameType,
      place: model.place !== null ? model.place : '',
      registeredOfficeId: userSession.officeId,
      registeredUserId: userSession.userId,
      slots: model.slots !== null ? model.slots : 0,
      repeat: model.repeat !== null ? model.repeat : '',
      acceptRequest: model.acceptRequest,
      ignoreHoliday: model.ignoreHoliday,
      repeatDescription: model.summary
    };
  }
}


