import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventCreateSettings } from '../../../models/ca/event-create-settings';
import { EventDetailsSettings } from '../../../models/ca/event-details-settings';
import { EventDetailsSettingValidator } from '../../../models/ca/event-details-setting-validator';
import { EventCreateSettingValidator } from '../../../models/ca/event-create-setting-validator';
import { Ca0007PageRrule } from './ca0007-page.rrule';
import { CalendarCommon } from '../../../common/calendar-common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
@Injectable()
export class Ca0007PageValidator {
  repeatOption: any;
  recursiveOption = {
    'ONE': 'THIS_EVENT',
    'MORE': 'FOLLOWING_EVENT'
  };
  constructor(private formBuilder: FormBuilder,
    private ca0007PageRrule: Ca0007PageRrule,
    private calendarCommon: CalendarCommon,
    private translate: TranslateService,
    private ca0007PageRRule: Ca0007PageRrule) {
    this.repeatOption = this.ca0007PageRRule.repeatOption;
  }

  createForm(model: EventDetailsSettingValidator) {
    let form: FormGroup;
    form = this.formBuilder.group({
      'title': [model.title, Validators.maxLength(20)],
      'place': [model.place, Validators.maxLength(20)],
      'allDay': [model.allDay],
      'startDay': [model.startDay, Validators.required],
      'startTime': [model.startTime, Validators.required],
      'endDay': [model.endDay, Validators.required],
      'endTime': [model.endTime, Validators.required],
      'repeatOption': [model.repeatOption],
      'repeatRule': this.formBuilder.group({
        'summary': [model.summary],
        'repeatInterval': [model.repeatInterval],
        'sunday': [model.sunday],
        'monday': [model.monday],
        'tuesday': [model.tuesday],
        'wednesday': [model.wednesday],
        'thursday': [model.thursday],
        'friday': [model.friday],
        'saturday': [model.saturday],
        'endDate': [model.endDate],
        'countTime': [model.countTime],
        'untilDay': [model.untilDay],
        'monthRepeatOption': [model.monthRepeatOption],
      }),
      'optionShare': [model.optionShare],
      'userId': [model.userId],
      'publishType': [model.publishType],
      'meetingPublishType': [model.meetingPublishType],
      'groupInside': [model.groupInside],
      'groupOutside': [model.groupOutside],
      'note': [model.note, Validators.maxLength(3000)]
    });
    return form;
  }

  /*
  *check validate form after submit
  */
  checkValidate(editEventForm: FormGroup, validationError, formErrorMessage) {
    if (!editEventForm) {
      return;
    }
    this.setDefaultError(validationError, formErrorMessage);
    let messageValidatorError;
    messageValidatorError = this.getValidationMessages();
    const allDay = editEventForm.get('allDay').value;
    const repeatOption = editEventForm.get('repeatOption').value;
    const endDate = editEventForm.get('repeatRule.endDate').value;
    const countTime = editEventForm.get('repeatRule.countTime').value;
    const startDay = editEventForm.get('startDay').value;
    const startTime = editEventForm.get('startTime').value;
    const endDay = editEventForm.get('endDay').value;
    const endTime = editEventForm.get('endTime').value;
    if (editEventForm.get('title').value.trim() === '') {
      editEventForm.controls.title.setValue('');
    }
    const title = editEventForm.get('title').value;
    const place = editEventForm.get('place').value;
    const note = editEventForm.get('note').value;
    const repeatRule = editEventForm.get('repeatRule').value;
    const groupInside = editEventForm.get('groupInside').value;
    const groupOutside = editEventForm.get('groupOutside').value;
    const optionShare = editEventForm.get('optionShare').value;
    if (title && title.length > 20) {
      validationError.title = true;
      formErrorMessage.title = messageValidatorError.title.maxlength;
    }

    if (place && place.length > 20) {
      validationError.place = true;
      formErrorMessage.place = messageValidatorError.place.maxlength;
    }

    if (note && note.length > 3000) {
      validationError.note = true;
      formErrorMessage.note = messageValidatorError.note.maxlength;
    }

    if (allDay) {
      if (moment(startDay).isAfter(endDay)) {
        validationError.startDay = true;
        formErrorMessage.startDay = messageValidatorError.date.compare;
      }
    } else {
      if (moment(startDay).isAfter(endDay)) {
        validationError.startDay = true;
        formErrorMessage.startDay = messageValidatorError.date.compare;
      } else {
        const start = this.calendarCommon.convertDateTime(startDay, startTime);
        const end = this.calendarCommon.convertDateTime(endDay, endTime);
        if (moment(start).isAfter(end)) {
          validationError.startTime = true;
          formErrorMessage.startTime = messageValidatorError.time.compare;
        }
      }
    }

    if (repeatOption !== this.ca0007PageRrule.repeatOption.no_repeat && endDate === this.ca0007PageRrule.endDate.count_time) {
      if (countTime === null || countTime === '' || isNaN(countTime)) {
        validationError.countTime = true;
        formErrorMessage.countTime = messageValidatorError.count_time.required;
      }
    }

    if (repeatOption === this.ca0007PageRrule.repeatOption.week) {
      if (repeatRule.monday === false && repeatRule.tuesday === false && repeatRule.wednesday === false && repeatRule.thursday === false
        && repeatRule.friday === false && repeatRule.saturday === false && repeatRule.sunday === false) {
        validationError.week = true;
        formErrorMessage.week = messageValidatorError.day_of_week.required;
      }
    }

    if ((groupInside === '' || groupInside === null) && optionShare === 'INSIDE_GROUP') {
      validationError.groupInside = true;
      formErrorMessage.groupInside = messageValidatorError.inside_group.required;

    }

    if ((groupOutside === '' || groupOutside === null) && optionShare === 'OUTSIDE_GROUP') {
      validationError.groupOutside = true;
      formErrorMessage.groupOutside = messageValidatorError.outside_group.required;
    }
  }

  setDefaultError(validationError, formErrorMessage) {
    validationError.title = false;
    formErrorMessage.title = '';
    validationError.place = false;
    formErrorMessage.place = '';
    validationError.note = false;
    formErrorMessage.note = '';
    validationError.startDay = false;
    formErrorMessage.startDay = '';
    validationError.startTime = false;
    formErrorMessage.startTime = '';
    validationError.countTime = false;
    formErrorMessage.countTime = '';
    validationError.week = false;
    formErrorMessage.week = '';
    validationError.groupInside = false;
    formErrorMessage.groupInside = '';
    validationError.groupOutside = false;
    formErrorMessage.groupOutside = '';
  }

  getValidationMessages() {
    let messageValidationError;
    this.translate.get('CA0007').subscribe((res) => {
      messageValidationError = {
        'title': {
          'maxlength': res.ERROR_VALIDATE.TITLE,
        },
        'place': {
          'maxlength': res.ERROR_VALIDATE.PLACE,
        },
        'note': {
          'maxlength': res.ERROR_VALIDATE.NOTE,
        },
        'inside_group': {
          'required': res.ERROR_VALIDATE.INSIDE_GROUP
        },
        'outside_group': {
          'required': res.ERROR_VALIDATE.OUTSIDE_GROUP
        },
        'date': {
          'compare': res.ERROR_VALIDATE.DATE_COMPARE
        },
        'time': {
          'compare': res.ERROR_VALIDATE.TIME_COMPARE
        },
        'day_of_week': {
          'required': res.ERROR_VALIDATE.RRULE_WEEK_DAY_OF_WEEK_NONE
        },
        'count_time': {
          'required': res.ERROR_VALIDATE.COUNT_TIME_NONE
        }
      };
    });
    return messageValidationError;
  }

  checkValidDataForm(validationError, formErrorMessage) {
    let content;
    content = '';
    if (validationError.title) content += '<p>' + formErrorMessage.title + '</p>'
    if (validationError.place) content += '<p>' + formErrorMessage.place + '</p>'
    if (validationError.note) content += '<p>' + formErrorMessage.note + '</p>'
    if (validationError.startDay) content += '<p>' + formErrorMessage.startDay + '</p>'
    if (validationError.startTime) content += '<p>' + formErrorMessage.startTime + '</p>'
    if (validationError.week) content += '<p>' + formErrorMessage.week + '</p>'
    if (validationError.countTime) content += '<p>' + formErrorMessage.countTime + '</p>'
    if (validationError.groupInside) content += '<p>' + formErrorMessage.groupInside + '</p>'
    if (validationError.groupOutside) content += '<p>' + formErrorMessage.groupOutside + '</p>'
    return content;
  }

  /*
  * map data from ca0004 local storage to ca0007
  * */
  mapModelCa0004(model: EventCreateSettingValidator, formModel: EventDetailsSettingValidator) {
    formModel.title = model.title;
    formModel.allDay = model.allDay;
    formModel.startDay = model.startDay;
    formModel.startTime = model.startTime;
    formModel.endDay = model.endDay;
    formModel.endTime = model.endTime;
    formModel.optionShare = model.optionShare;
    if (model.userId) {
      formModel.userId = model.userId;
    } else {
      formModel.userId = '';
    }
    formModel.groupInside = model.groupInside;
    formModel.groupOutside = model.groupOutside;
    formModel.publishType = model.publishType;
    formModel.meetingPublishType = model.meetingPublishType;
    formModel.userCreated = '';
    formModel.userUpdated = '';
}

  /*
  * map data form call api to form ca0007
  * */
  mapModelCallApi(model: EventDetailsSettings, formModel: EventDetailsSettingValidator) {
    const dateTimeStart = this.calendarCommon.convertDataMapDatepicker(model.start);
    const dateTimeEnd = this.calendarCommon.convertDataMapDatepicker(model.end);
    formModel.title = model.title;
    formModel.place = model.place;
    formModel.allDay = model.allDay;
    formModel.note = model.note;
    formModel.startDay = dateTimeStart.date;
    formModel.startTime = dateTimeStart.time;
    formModel.endDay = dateTimeEnd.date;
    formModel.endTime = dateTimeEnd.time;
    formModel.userId = model.userId ? model.userId : '';
    formModel.note = model.note;
    formModel.publishType = model.publishType;
    formModel.meetingPublishType = model.meetingPublishType;
    formModel.groupInside = '';
    formModel.groupOutside = '';
    formModel.userCreated = model.createdUserId.lastName + ' ' + model.createdUserId.firstName;
    formModel.userUpdated = model.modifiedUserId.lastName + ' ' + model.modifiedUserId.firstName;
  }

  /*
  * map data from form ca0007 to model
  * */
  mapModelInput(modelInput: EventCreateSettings, formModel, translate) {
    modelInput.title = formModel.title;
    if (modelInput.title === null || modelInput.title === '') {
      modelInput.title = translate.TITLE_DEFAULT_VALUE;
    }
    modelInput.place = formModel.place ? formModel.place : '';
    modelInput.allDay = formModel.allDay ? true : false;
    if (modelInput.allDay) {
      modelInput.start = this.calendarCommon.convertDateTimeIsoAllDay(formModel.startDay);
      modelInput.end = this.calendarCommon.convertDateTimeIsoAllDay(formModel.endDay);
    } else {
      modelInput.start = this.calendarCommon.convertDateTime(formModel.startDay, formModel.startTime);
      modelInput.end = this.calendarCommon.convertDateTime(formModel.endDay, formModel.endTime);
    }
    const valueRRule = formModel.repeatRule ? formModel.repeatRule : '';
    const optionRRule = formModel.repeatOption;
    const obj = this.ca0007PageRrule.repeatRuleConfig(valueRRule, optionRRule, formModel.startDay);
    modelInput.repeatRule = obj.RRULE_STRING ? ('RRULE:' + obj.RRULE_STRING) : '';
    modelInput.meetingPublishType = formModel.meetingPublishType;
    modelInput.publishType = formModel.publishType;
    if (formModel.repeatOption === this.repeatOption.no_repeat) {
      modelInput.recursiveOption = this.recursiveOption.ONE;
    } else {
      modelInput.recursiveOption = this.recursiveOption.MORE;
    }
    modelInput.userId = '';
    modelInput.groupId = '';
    if (formModel.optionShare === 'MY') {
      modelInput.userId = formModel.userId;
    } else if (formModel.optionShare === 'INSIDE_GROUP') {
      modelInput.groupId = formModel.groupInside;
    } else if (formModel.optionShare === 'OUTSIDE_GROUP') {
      modelInput.groupId = formModel.groupOutside;
    }
    modelInput.note = formModel.note ? formModel.note : '';
  }
}


