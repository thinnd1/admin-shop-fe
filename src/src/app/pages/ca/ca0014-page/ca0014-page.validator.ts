import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventCreateSettings} from '../../../models/ca/event-create-settings';
import {EventCreateSettingValidator} from '../../../models/ca/event-create-setting-validator';
import {TranslateService} from '@ngx-translate/core';
import {CalendarCommon} from '../../../common/calendar-common';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';

declare var moment: any;
@Injectable()
export class Ca0014PageValidator {
  valueShare = {'user': 'MY', 'insideHospital': 'INSIDE_GROUP', 'outsideHospital': 'OUTSIDE_GROUP'};
  ca0014Translate: any;
  userSession: UserSession;

  constructor(private formBuilder: FormBuilder,
              private translate: TranslateService,
              private calendarCommon: CalendarCommon,
              private sharedValue: SharedValueService ) {
    this.getTextTranslate();
    this.userSession = this.sharedValue.getUserSession();
  }

  createForm(model: EventCreateSettingValidator) {
    let form: FormGroup;
    form = this.formBuilder.group({
      'title': [model.title, Validators.maxLength(20)],
      'allDay': [model.allDay, Validators.maxLength(20)],
      'startDay': [model.startDay, [Validators.required]],
      'startTime': [model.startTime, [Validators.required]],
      'endDay': [model.endDay, [Validators.required]],
      'endTime': [model.endTime, [Validators.required]],
      'optionShare': [model.optionShare],
      'userId': [model.userId],
      'publishType': [model.publishType],
      'meetingPublishType': [model.meetingPublishType],
      'groupInside': [model.groupInside],
      'groupOutside': [model.groupOutside]
    });
    return form;
  }

  setValueForm(start, end, defaultView) {
    let checkAllDay = false;
    const form = new EventCreateSettingValidator();
    let selectLabel = false;

    if (defaultView === 'agendaWeek') {
      if (moment(start).format('HH:mm') === moment(end).format('HH:mm') && moment(end).format('HH:mm') === '00:00') {
        end = moment(end).add(-1, 'days').format();
        form.allDay = true;
        checkAllDay = true;
      } else {
        if (moment(start).clone().add(0.5, 'hours').format('YYYYMMDDHHmm') === moment(end).format('YYYYMMDDHHmm')) {
          selectLabel = true;
          end = moment(start).clone().add(1, 'hours').format();
        }
      }
    } else {
      if (moment(start).format('YYYYMMDD') === moment(end).add(-1, 'days').format('YYYYMMDD')) {
        const date = moment(start).format();
        const currentDate = new Date();
        const timeStart = moment(currentDate).format('HH:00:00');
        const timeEnd = moment(currentDate).clone().add(1, 'hours').format('HH:00:00');

        start = moment(date).format('YYYY-MM-DDT' + timeStart);
        end = moment(date).clone().add(1, 'hours').format('YYYY-MM-DDT' + timeEnd);
      } else {
        if (moment(start).format('HH:mm') === moment(end).format('HH:mm') && moment(end).format('HH:mm') === '00:00') {
          end = moment(end).add(-1, 'days').format();
          form.allDay = true;
          checkAllDay = true;
        }
      }
    }

    const createEventForm = this.createForm(form);
    const dateStart = moment(start).format('YYYY-MM-DD');
    const timeStart = moment(start).format('HH:mm');
    const dateEnd = moment(end).format('YYYY-MM-DD');
    const timeEnd = moment(end).format('HH:mm');

    createEventForm.controls.startDay.setValue(dateStart);
    createEventForm.controls.startTime.setValue(timeStart);
    createEventForm.controls.endDay.setValue(dateEnd);
    createEventForm.controls.endTime.setValue(timeEnd);

    return {
      'form': createEventForm,
      'checkAllDay': checkAllDay,
      'start': start,
      'end': end,
      'allDay': form.allDay,
      'selectLabel': selectLabel
    };
  }

  /*
   *check validate form after submit
   */
  checkValidate(createEventForm: FormGroup, validationError, formMessagesError) {

    if (!createEventForm) {
      return;
    }
    this.setDefaultError(validationError, formMessagesError);
    let messageValidatorError;
    messageValidatorError = this.getValidationMessages();
    const form = createEventForm;
    const allDay = form.get('allDay').value;
    const startDay = form.get('startDay').value;
    const startTime = form.get('startTime').value;
    const endDay = form.get('endDay').value;
    const endTime = form.get('endTime').value;
    if (form.get('title').value.trim() === '') {
      form.controls.title.setValue('');
    }
    const title = form.get('title').value;
    const groupInside = form.get('groupInside').value;
    const groupOutside = form.get('groupOutside').value;
    const optionShare = form.get('optionShare').value;
    if (title && title.length > 20) {
      validationError.title = true;
      formMessagesError.title = messageValidatorError.title.maxlength;
    }
    if (allDay) {
      if (moment(startDay).isAfter(endDay)) {
        validationError.startDay = true;
        formMessagesError.startDay = messageValidatorError.date.compare;
      }
    } else {
      if (moment(startDay).isAfter(endDay)) {
        validationError.startDay = true;
        formMessagesError.startDay = messageValidatorError.date.compare;
      } else {
        const start = this.calendarCommon.convertDateTime(startDay, startTime);
        const end = this.calendarCommon.convertDateTime(endDay, endTime);
        if (moment(start).isAfter(end)) {
          validationError.startTime = true;
          formMessagesError.startTime = messageValidatorError.time.compare;
        }
      }
    }

    if ((groupInside === '' || groupInside === null) && optionShare === 'INSIDE_GROUP') {
      validationError.groupInside = true;
      formMessagesError.groupInside = messageValidatorError.inside_group.required;

    }

    if ((groupOutside === '' || groupOutside === null) && optionShare === 'OUTSIDE_GROUP') {
      validationError.groupOutside = true;
      formMessagesError.groupOutside = messageValidatorError.outside_group.required;
    }
  }

  setDefaultError(validationError, formErrorMessage) {
    validationError.title = false;
    formErrorMessage.title = '';
    validationError.place = false;
    formErrorMessage.place = '';
    validationError.startDay = false;
    formErrorMessage.startDay = '';
    validationError.startTime = false;
    formErrorMessage.startTime = '';
    validationError.groupInside = false;
    formErrorMessage.groupInside = '';
    validationError.groupOutside = false;
    formErrorMessage.groupOutside = '';
  }

  getValidationMessages() {
    let messageValidationError;
    this.translate.get('CA004').subscribe((res) => {
      messageValidationError = {
        'title': {
          'maxlength': res.ERROR_VALIDATE.TITLE,
        },
        'place': {
          'maxlength': res.ERROR_VALIDATE.PLACE,
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
      };
    });
    return messageValidationError;
  }

  checkValidDataForm(validationError, formErrorMessage) {
    let content;
    content = '';
    if (validationError.title) {
      content += '<p>' + formErrorMessage.title + '</p>';
    }
    if (validationError.place) {
      content += '<p>' + formErrorMessage.place + '</p>';
    }
    if (validationError.startDay) {
      content += '<p>' + formErrorMessage.startDay + '</p>';
    }
    if (validationError.startTime) {
      content += '<p>' + formErrorMessage.startTime + '</p>';
    }
    if (validationError.groupInside) {
      content += '<p>' + formErrorMessage.groupInside + '</p>';
    }
    if (validationError.groupOutside) {
      content += '<p>' + formErrorMessage.groupOutside + '</p>';
    }
    return content;
  }

  getDataForm(createEventForm: FormGroup) {
    if (!createEventForm) {
      return false;
    }
    let data: any;
    data = createEventForm.value;
    return data;
  }

  // get text translate ja, en
  getTextTranslate() {
    this.translate.get('CA004').subscribe(response => {
      this.ca0014Translate = response;
    });
  }

  mapModel(formModel: EventCreateSettingValidator, model: EventCreateSettings) {
    this.translate.get('CA004').subscribe((response) => {
      console.log(formModel);
      model.id = '';
      model.title = formModel.title ? formModel.title : response.TITLE.DEFAULT_VALUE;
      model.allDay = formModel.allDay;
      if (formModel.allDay === true) {
        model.start = this.calendarCommon.convertDateTimeIsoAllDay(formModel.startDay);
        model.end = this.calendarCommon.convertDateTimeIsoAllDay(formModel.endDay);
      } else {
        model.start = this.calendarCommon.convertDateTime(formModel.startDay, formModel.startTime);
        model.end = this.calendarCommon.convertDateTime(formModel.endDay, formModel.endTime);
      }
      model.meetingPublishType = formModel.meetingPublishType;
      model.publishType = formModel.publishType;
      if (formModel.optionShare === this.valueShare.user) {
        model.userId = formModel.userId;
        model.groupId = '';
      } else if (formModel.optionShare === this.valueShare.insideHospital) {
        model.userId = '';
        model.groupId = formModel.groupInside;
      } else if (formModel.optionShare === this.valueShare.outsideHospital) {
        model.userId = '';
        model.groupId = formModel.groupOutside;
      }
      model.note = '';
      model.place = '';
      model.recursiveOption = 'THIS_EVENT';
      model.repeatParentId = '';
      model.repeatRule = '';
    });
  }
}


