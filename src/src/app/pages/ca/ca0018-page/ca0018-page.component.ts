import {Component, OnInit, Injectable, EventEmitter, OnDestroy} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { EventDetailsSettings } from '../../../models/ca/event-details-settings';
import { EventDetailsSettingValidator } from '../../../models/ca/event-details-setting-validator';
import { CalendarService } from '../../../services/calendar.service';
import { EventCreateSettings } from '../../../models/ca/event-create-settings';
import { LocalStorage } from '../../../services/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventDetailsSettingsSaveResult } from '../../../models/ca/event-details-settings-save-result';
import { HttpStatus } from '../../../common/http.status';
import { CalendarCommon } from '../../../common/calendar-common';
import { SharedValueService } from '../../../services/shared-value.service';
import * as moment from 'moment';
import {Ca0018PageValidator} from './ca0018-page.validator';
import {Ca0018PageRrule} from './ca0018-page.rrule';
import {UserSession} from '../../../models/ba/user-session';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {EventCreateSettingValidator} from '../../../models/ca/event-create-setting-validator';

@Component({
  selector: 'app-ca0018-page',
  templateUrl: './ca0018-page.component.html',
  styleUrls: ['./ca0018-page.component.scss'],
  providers: [Ca0018PageValidator, Ca0018PageRrule],
})
export class Ca0018PageComponent implements OnInit, OnDestroy {
  editEventForm: FormGroup;
  model = new EventDetailsSettings();
  modelInput = new EventCreateSettings();
  formModel = new EventDetailsSettingValidator();
  eventId: any;
  checkAllDay: boolean;
  validationError = {
    'title': false,
    'place': false,
    'note': false,
    'countTime': false,
    'startDay': false,
    'startTime': false,
    'week': false,
    'groupInside': false,
    'groupOutside': false
  };
  formErrorMessage = {
    'title': '',
    'place': '',
    'note': '',
    'startDay': '',
    'startTime': '',
    'week': '',
    'countTime': '',
    'groupInside': '',
    'groupOutside': '',
  };
  checkOptionRRlue = {
    'week': true,
    'month': true
  };
  options = [
    { 'value': 'VISIBLE', 'key': 'HOSPITAL_VALUE_1' },
    { 'value': 'INVISIBLE', 'key': 'HOSPITAL_VALUE_2' }
  ];
  recursiveOption = {
    'ONE': 'THIS_EVENT',
    'MORE': 'FOLLOWING_EVENT'
  };
  repeatInterval = [];
  repeatOption: any;
  dayOfWeek: any;
  ca0018Translate: any;
  timePicker = [];
  monthOptionRepeat: any;
  endDate: any;
  userSession: UserSession;
  isDisableUntilDay = true;
  public ca0014Model;
  public rrule_init;

  constructor(private translate: TranslateService, private ca0018PageValidator: Ca0018PageValidator,
              private ca0018PageRRule: Ca0018PageRrule, private calendarService: CalendarService,
              private localStorage: LocalStorage, private activatedRoute: ActivatedRoute,
              private dialogService: DialogService, private router: Router,
              private calendarCommon: CalendarCommon,
              private sharedValueService: SharedValueService) {
    this.repeatOption = this.ca0018PageRRule.repeatOption;
    this.dayOfWeek = this.ca0018PageRRule.dayOfWeek;
    this.monthOptionRepeat = this.ca0018PageRRule.monthOptionRepeat;
    this.endDate = this.ca0018PageRRule.endDate;
    this.getRepeatInterval();
    this.editEventForm = this.ca0018PageValidator.createForm(this.formModel);
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    const userName = this.userSession.lastName + ' ' + this.userSession.firstName;
    this.calendarCommon.genTimePicker(this.timePicker);
    this.getTextTranslate();
    this.activatedRoute.params.subscribe((param: any) => {
      this.eventId = param['event_id'];
    });

    this.ca0014Model = this.localStorage.getObject('ca0014');
    if (this.eventId) {
      setTimeout(() => {
        this.calendarService.getEventDetailsSettings(this.eventId).subscribe((settings: EventDetailsSettings) => {
          if (settings.repeatRule) {
            this.ca0018PageRRule.mapRRuleInForm(settings.repeatRule, this.formModel);
            this.rrule_init = settings.repeatRule;
          }
          this.ca0018PageValidator.mapModelCallApi(settings, this.formModel);
          if (this.formModel.userId === this.userSession.userId) {
            this.formModel.userId = '';
          }
          this.checkAllDay = this.formModel.allDay;
          this.disableOptionRepeat(this.formModel.endDate);

          this.editEventForm = this.ca0018PageValidator.createForm(this.formModel);
          this.showHideRRule(this.formModel.repeatOption);
          this.modelInput.repeatParentId = settings.repeatParentId;
          this.modelInput.id = this.eventId;
        }, (error: HttpStatus) => {
          this.dialogService.showError('CA0007.MSG.CA0007.E001_1');
        });
      }, 1000);
    } else {
      setTimeout(() => {
        if (this.ca0014Model) {
          this.ca0018PageValidator.mapModelCa0004(this.ca0014Model, this.formModel);
        } else {
          const now = moment(new Date()).format('YYYY-MM-DDTHH:00');
          const model = new EventCreateSettingValidator();
          model.startDay = moment(now).format('YYYY-MM-DD');
          model.startTime = moment(now).format('HH:mm');
          model.endDay = moment(now).format('YYYY-MM-DD');
          model.endTime = moment(now).add(1, 'hours').format('HH:mm');
          this.ca0018PageValidator.mapModelCa0004(model, this.formModel);
        }
        this.checkAllDay = this.formModel.allDay;

        this.editEventForm = this.ca0018PageValidator.createForm(this.formModel);
        this.showHideRRule(this.formModel.repeatOption);
        this.modelInput.id = '';
        this.modelInput.repeatParentId = '';
      });
      this.disableOptionRepeat(this.formModel.endDate);
    }
  }

  ngOnDestroy() {
    this.localStorage.remove('ca0018');
    this.localStorage.remove('ca0014');
  }

  startDateChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.editEventForm.controls.startDay.setValue(date);
    this.formModel.startDay = date;
  }

  endDateChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.editEventForm.controls.endDay.setValue(date);
    this.formModel.endDay = date;
  }

  /*
   * get text translate ja, en
   * */
  getTextTranslate() {
    this.translate.get('CA0007').subscribe(response => {
      this.ca0018Translate = response;
    });
  }

  /*
   * get default repeat interval
   * */
  getRepeatInterval() {
    for (let i = 0; i < 4; i++) {
      this.repeatInterval.push(i + 1);
    }
  }

  /*
   * create or edit event
   * */
  postEventDetailSettings() {
    this.ca0018PageValidator.checkValidate(this.editEventForm, this.validationError, this.formErrorMessage);
    const checkValue = this.ca0018PageValidator.checkValidDataForm(this.validationError, this.formErrorMessage);
    if (this.editEventForm.valid && checkValue === '') {
      this.ca0018PageValidator.mapModelInput(this.modelInput, this.editEventForm.value, this.ca0018Translate);
      // check create event || edit event
      if (this.eventId) {
        this.postEditEvent();
      } else {
        this.postCreateEvent();
      }
    } else {
      this.dialogService.showMessage('error', false, null, null, checkValue, 'MSG.OK', null);
    }
  }

  // edit event
  postEditEvent() {
    if (this.modelInput.repeatRule && this.rrule_init) {
      this.confirmEditEventRepeatRule();
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.calendarService.postEventCreateSettings(this.modelInput).subscribe((response: EventDetailsSettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED').subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              this.backCA0014(this.modelInput.start);
            }
          }
        );
      }, (error: HttpStatus) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError(this.ca0018Translate['MSG']['CA0007.E001_2']);
      });
    }
  }

  /*
   * dialog confirm repeat when submit save
   * */
  confirmEditEventRepeatRule() {
    const object = {
      'check': false,
      'confirmText': '   ' + this.ca0018Translate.MODAL_EDIT.EDIT_CONFIRM_4,
      'isConfirm': false,
      'disablePositive': false
    };
    const html = '<p>' + this.ca0018Translate.MODAL_EDIT.EDIT_CONFIRM_1 + '</p>'
      + '<p>' + this.ca0018Translate.MODAL_EDIT.EDIT_CONFIRM_2 + '</p>'
      + '<p>' + this.ca0018Translate.MODAL_EDIT.EDIT_CONFIRM_3 + '</p>';

    this.dialogService.showCheckboxDialog(null, false, null, null, html, 'MSG.OK', 'MSG.CANCEL', object, null, 'modal-lg').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          const recursiveOption = res.payload.isChecked ? this.recursiveOption.MORE : this.recursiveOption.ONE;
          this.modelInput.recursiveOption = recursiveOption;
          setTimeout(() => {
            this.calendarService.postEventCreateSettingsPr(this.modelInput).subscribe((response: EventDetailsSettingsSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showSuccess('MSG.SAVED').subscribe(
                (dialogResult: DialogResult) => {
                  if (dialogResult.isOk()) {
                    this.backCA0014(this.modelInput.start);
                  }
                }
              );
            }, (error: HttpStatus) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError(this.ca0018Translate['MSG']['CA0007.E001_2']);
            });
          }, 1000);
        }
      }
    );
  }

  // create new event
  postCreateEvent() {
    this.modelInput.recursiveOption = this.recursiveOption.ONE;
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.calendarService.postEventCreateSettingsPr(this.modelInput).subscribe((response: EventDetailsSettingsSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('MSG.SAVED').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.backCA0014(this.modelInput.start);
          }
        }
      );
    }, (error: HttpStatus) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError(this.ca0018Translate['MSG']['CA0007.E001_2']);
    });
  }

  /*
   * check allDay & show hide checkox AllDay
   * */
  isAllDay() {
    this.checkAllDay = !this.checkAllDay;
  }

  /*
   * config display repeat option
   * */
  showHideRRule(value) {
    this.getRRule();
    this.validationError.countTime = false;
    if (value === this.repeatOption.no_repeat) {
      this.checkOptionRRlue.week = true;
      this.checkOptionRRlue.month = true;
    } else if (value === this.repeatOption.week) {
      this.checkOptionRRlue.week = false;
      this.checkOptionRRlue.month = true;
      const dayOfWeek = moment(this.formModel.startDay).weekday();
      if (this.formModel.sunday === false && this.formModel.monday === false
        && this.formModel.tuesday === false && this.formModel.wednesday === false
        && this.formModel.thursday === false && this.formModel.friday === false
        && this.formModel.saturday === false) {
        switch (dayOfWeek) {
          case 0:
            this.formModel.sunday = true;
            this.editEventForm.get('repeatRule.sunday').setValue(true);
            break;
          case 1:
            this.formModel.monday = true;
            this.editEventForm.get('repeatRule.monday').setValue(true);
            break;
          case 2:
            this.formModel.tuesday = true;
            this.editEventForm.get('repeatRule.tuesday').setValue(true);
            break;
          case 3:
            this.formModel.wednesday = true;
            this.editEventForm.get('repeatRule.wednesday').setValue(true);
            break;
          case 4:
            this.formModel.thursday = true;
            this.editEventForm.get('repeatRule.thursday').setValue(true);
            break;
          case 5:
            this.formModel.friday = true;
            this.editEventForm.get('repeatRule.friday').setValue(true);
            break;
          case 6:
            this.formModel.saturday = true;
            this.editEventForm.get('repeatRule.saturday').setValue(true);
            break;
        }
        this.getRRule();
      }
    } else if (value === this.repeatOption.month) {
      this.checkOptionRRlue.week = true;
      this.checkOptionRRlue.month = false;
    } else {
      this.checkOptionRRlue.week = true;
      this.checkOptionRRlue.month = true;
    }
  }

  /*
   * set enable, disable for item end date repeat rule
   * */
  disableAndResetItem(itemName, isDisable) {
    this.editEventForm.get(itemName).setValue(null, itemName);
    if (isDisable === true) {
      this.editEventForm.get(itemName).disable();
    } else {
      this.editEventForm.get(itemName).enable();
    }
  }

  disableOptionRepeat(value) {
    this.validationError.countTime = false;
    if (value === this.endDate.none) {
      this.disableAndResetItem('repeatRule.countTime', true);
      this.isDisableUntilDay = true;
      this.formModel.untilDay = '';
    } else if (value === this.endDate.count_time) {
      this.disableAndResetItem('repeatRule.countTime', false);
      this.isDisableUntilDay = true;
      this.formModel.untilDay = '';
    } else if (value === this.endDate.until_day) {
      this.disableAndResetItem('repeatRule.countTime', true);
      this.isDisableUntilDay = false;
    }
  }

  getValueUntilDay(date: any) {
    if (date !== null && date !== '') {
      let obj;
      let valueRRule;
      let optionRRule;
      this.formModel.untilDay = date;
      valueRRule = this.editEventForm.get('repeatRule').value;
      optionRRule = this.editEventForm.get('repeatOption').value;
      valueRRule.untilDay = date;
      const startDay = this.formModel.startDay;
      obj = this.ca0018PageRRule.repeatRuleConfig(valueRRule, optionRRule, startDay);
      this.formModel.summary = obj.RRULE_SUMARY;
      this.model.repeatRule = obj.RRULE_STRING;
    }
  }

  /*
   * config rrule to object repeat rule
   * */
  getRRule() {
    let obj;
    let valueRRule;
    let optionRRule;
    valueRRule = this.editEventForm.get('repeatRule').value;
    optionRRule = this.editEventForm.get('repeatOption').value;
    const startDay = this.formModel.startDay;
    obj = this.ca0018PageRRule.repeatRuleConfig(valueRRule, optionRRule, startDay);
    this.formModel.summary = obj.RRULE_SUMARY;
    this.model.repeatRule = obj.RRULE_STRING;
  }

  backCA0014(start?: string) {
    let date;
    if (start) {
      if (this.ca0014Model && (moment(start).format('YYYYMMDD') >= moment(this.ca0014Model.startDateCalendar).format('YYYYMMDD')) &&
        (moment(start).format('YYYYMMDD') <= moment(this.ca0014Model.endDateCalendar).format('YYYYMMDD'))) {
        if (this.ca0014Model.defaultView === 'month') {
          date = moment(this.ca0014Model.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.ca0014Model.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarPr', {date: date, defaultView: this.ca0014Model.defaultView});
      } else {
        this.localStorage.setObject('goToDateCalendarPr', {date: start, defaultView: this.ca0014Model.defaultView});
      }
    } else {
      if (this.ca0014Model) {
        if (this.ca0014Model.defaultView === 'month') {
          date = moment(this.ca0014Model.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.ca0014Model.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarPr', {date: date, defaultView: this.ca0014Model.defaultView});
      }
    }

    this.router.navigate(['ca/ca0014']);
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar) && event.charCode !== '0') {
      event.preventDefault();
    }
  }

  keyUp(event: any) {
    const valueInput = event.target.value;
    if (parseInt(valueInput, 0) > 100) {
      this.editEventForm.get('repeatRule.countTime').setValue('100');
    }

    if (parseInt(valueInput, 0) === 0) {
      this.editEventForm.get('repeatRule.countTime').setValue('1');
    }
  }
}

