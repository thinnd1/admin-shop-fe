import {Component, OnInit, Injectable, EventEmitter, OnDestroy, HostListener} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { Ca0007PageValidator } from './ca0007-page.validator';
import { Ca0007PageRrule } from './ca0007-page.rrule';
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
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {EventCreateSettingValidator} from '../../../models/ca/event-create-setting-validator';

@Component({
  selector: 'app-ca0007-page',
  templateUrl: './ca0007-page.component.html',
  styleUrls: ['./ca0007-page.component.scss'],
  providers: [Ca0007PageValidator, Ca0007PageRrule],
})
export class Ca0007PageComponent implements OnInit, OnDestroy {
  editEventForm: FormGroup;
  model = new EventDetailsSettings();
  modelInput = new EventCreateSettings();
  formModel = new EventDetailsSettingValidator();
  eventId: any;
  status: boolean;
  listStaff = new Array();
  listGroup = new Array();
  listGroupInside = new Array();
  listGroupOutside = new Array();
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
    {'value': 'VISIBLE', 'key': 'HOSPITAL_VALUE_1'},
    {'value': 'INVISIBLE', 'key': 'HOSPITAL_VALUE_2'}
  ];
  recursiveOption = {
    'ONE': 'THIS_EVENT',
    'MORE': 'FOLLOWING_EVENT'
  };
  valueShare = {
    'user': 'MY',
    'insideHospital': 'INSIDE_GROUP',
    'outsideHospital': 'OUTSIDE_GROUP',
    'external': 'EXTERNAL',
  };
  repeatInterval = [];
  repeatOption: any;
  dayOfWeek: any;
  ca0007Translate: any;
  timePicker = [];
  monthOptionRepeat: any;
  endDate: any;
  userSession;
  isDisableUntilDay = true;
  showPublishType = true;
  rrule_init: string = null;
  isExternalEvent = false;
  public ca0004Model;

  constructor(private translate: TranslateService, private ca0007PageValidator: Ca0007PageValidator,
              private ca0007PageRRule: Ca0007PageRrule, private calendarService: CalendarService,
              private localStorage: LocalStorage, private activatedRoute: ActivatedRoute,
              private dialogService: DialogService, private router: Router,
              private calendarCommon: CalendarCommon,
              private sharedValueService: SharedValueService) {
    this.repeatOption = this.ca0007PageRRule.repeatOption;
    this.dayOfWeek = this.ca0007PageRRule.dayOfWeek;
    this.monthOptionRepeat = this.ca0007PageRRule.monthOptionRepeat;
    this.endDate = this.ca0007PageRRule.endDate;
    this.getRepeatInterval();
    this.editEventForm = this.ca0007PageValidator.createForm(this.formModel);
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.calendarCommon.genTimePicker(this.timePicker);
    this.getStaffUser();
    this.getListGroup();
    this.getTextTranslate();
    this.activatedRoute.params.subscribe((param: any) => {
      this.eventId = param['event_id'];
    });
    this.ca0004Model = this.localStorage.getObject('ca0004');

    if (this.eventId !== '' && this.eventId !== null && this.eventId !== undefined) {
      setTimeout(() => {
        this.calendarService.getEventDetailsSettings(this.eventId).subscribe((settings: EventDetailsSettings) => {
          if (settings.repeatRule) {
            this.ca0007PageRRule.mapRRuleInForm(settings.repeatRule, this.formModel);
            this.rrule_init = settings.repeatRule;
          }
          this.ca0007PageValidator.mapModelCallApi(settings, this.formModel);
          this.mapOptionShare(settings, this.formModel);
          if (this.formModel.userId === this.userSession.userId) {
            this.formModel.userId = '';
          }
          this.checkAllDay = this.formModel.allDay;
          this.disableOptionRepeat(this.formModel.endDate);
          this.displayOption(this.formModel.optionShare);
          if (this.formModel.optionShare === 'INSIDE_GROUP') {
            this.formModel.groupInside = settings.groupId;
            this.showPublishType = false;
          } else if (this.formModel.optionShare === 'OUTSIDE_GROUP') {
            this.formModel.groupOutside = settings.groupId;
            this.showPublishType = false;
          }
          this.editEventForm = this.ca0007PageValidator.createForm(this.formModel);
          this.showHideRRule(this.formModel.repeatOption);
          this.modelInput.repeatParentId = settings.repeatParentId;
          this.modelInput.id = this.eventId;
        }, (error: HttpStatus) => {
          this.dialogService.showError('CA0007.MSG.CA0007.E001_1');
        });
      }, 1000);
    } else {
      setTimeout(() => {
        if (this.ca0004Model) {
          this.ca0007PageValidator.mapModelCa0004(this.ca0004Model, this.formModel);
          if (this.ca0004Model.optionShare === 'INSIDE_GROUP') {
            this.formModel.groupInside = this.ca0004Model.groupInside;
            this.showPublishType = false;
          } else if (this.ca0004Model.optionShare === 'OUTSIDE_GROUP') {
            this.formModel.groupOutside = this.ca0004Model.groupOutside;
            this.showPublishType = false;
          }
        } else {
          const now = moment(new Date()).format('YYYY-MM-DDTHH:00');
          const model = new EventCreateSettingValidator();
          model.startDay = moment(now).format('YYYY-MM-DD');
          model.startTime = moment(now).format('HH:mm');
          model.endDay = moment(now).format('YYYY-MM-DD');
          model.endTime = moment(now).add(1, 'hours').format('HH:mm');
          this.ca0007PageValidator.mapModelCa0004(model, this.formModel);
        }
        this.checkAllDay = this.formModel.allDay;
        this.displayOption(this.formModel.optionShare);
        this.editEventForm = this.ca0007PageValidator.createForm(this.formModel);
        this.showHideRRule(this.formModel.repeatOption);
        this.modelInput.id = '';
        this.modelInput.repeatParentId = '';
      });
      this.disableOptionRepeat(this.formModel.endDate);
    }
  }

  ngOnDestroy() {
    this.localStorage.remove('ca0004');
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
      this.ca0007Translate = response;
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
    this.ca0007PageValidator.checkValidate(this.editEventForm, this.validationError, this.formErrorMessage);
    const checkValue = this.ca0007PageValidator.checkValidDataForm(this.validationError, this.formErrorMessage);
    if (this.editEventForm.valid && checkValue === '') {
      this.ca0007PageValidator.mapModelInput(this.modelInput, this.editEventForm.value, this.ca0007Translate);
      // check create event || edit event
      if (this.eventId !== '' && this.eventId !== null && this.eventId !== undefined) {
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
              this.backCA0002(this.modelInput.start);
            }
          }
        );
      }, (error: HttpStatus) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError(this.ca0007Translate['MSG']['CA0007.E001_2']);
      });
    }
  }

  /*
   * dialog confirm repeat when submit save
   * */
  confirmEditEventRepeatRule() {
    const object = {
      'check': false,
      'confirmText': '   ' + this.ca0007Translate.MODAL_EDIT.EDIT_CONFIRM_4,
      'isConfirm': false,
      'disablePositive': false
    };
    const html = '<p>' + this.ca0007Translate.MODAL_EDIT.EDIT_CONFIRM_1 + '</p>'
      + '<p>' + this.ca0007Translate.MODAL_EDIT.EDIT_CONFIRM_2 + '</p>'
      + '<p>' + this.ca0007Translate.MODAL_EDIT.EDIT_CONFIRM_3 + '</p>';

    this.dialogService.showCheckboxDialog(null, false, null, null, html, 'MSG.OK', 'MSG.CANCEL', object, null, 'modal-lg').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          const recursiveOption = res.payload.isChecked ? this.recursiveOption.MORE : this.recursiveOption.ONE;
          this.modelInput.recursiveOption = recursiveOption;
          setTimeout(() => {
            this.calendarService.postEventCreateSettings(this.modelInput).subscribe((response: EventDetailsSettingsSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showSuccess('MSG.SAVED').subscribe(
                (dialogResult: DialogResult) => {
                  if (dialogResult.isOk()) {
                    this.backCA0002(this.modelInput.start);
                  }
                }
              );
            }, (error: HttpStatus) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError(this.ca0007Translate['MSG']['CA0007.E001_2']);
            });
          }, 1000);
        }
      }
    );
  }

  // create new event
  postCreateEvent() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.modelInput.recursiveOption = this.recursiveOption.ONE;
    this.calendarService.postEventCreateSettings(this.modelInput).subscribe((response: EventDetailsSettingsSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('MSG.SAVED').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.backCA0002(this.modelInput.start);
          }
        }
      );
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      const ret = error.message;
      let msg = 'CA0007.MSG.CA0007.E001_2';
      if (ret === 'Sharing level of the staff\'s calendar has been changed') {
        msg = 'CA004.MSG.CA0007.E001_2';
      }
      this.dialogService.showError(msg);
    });
  }

  /*
  * get list staff user
  * */
  getStaffUser() {
    this.calendarService.getEventCreateSettings('STAFF').subscribe((settings: EventCreateSettings) => {
      this.listStaff = Object.keys(settings).map(key => settings[key]);
      this.listStaff = this.listStaff[0];
      const staffArr = this.listStaff;
      this.listStaff = [];
      for (let i = 0; i < staffArr.length; i++) {
        if (staffArr[i].shareStatus === 'EDITABLE') {
          this.listStaff.push(staffArr[i]);
        }
      }
      this.addStaff();
    }, error => {
      this.addStaff();
    });
  }

  addStaff() {
    this.listStaff.splice(0, 0, {
      'userId': '',
      'firstName': this.ca0007Translate.SHARE_OPTION.USER.USER_DEFAULT,
      'lastName': ''
    });
  }

  // get listGroup inside and outside
  getListGroup() {
    this.calendarService.getListGroupByUser().subscribe((settings: any) => {
      this.listGroup = settings;
      this.addGroup();
      if (this.listGroup) {
        for (let i = 0; i <= this.listGroup.length; i++) {
          if (this.listGroup[i] !== undefined) {
            if (this.listGroup[i].type === 'INSIDE') {
              this.listGroupInside.push(this.listGroup[i]);
            } else {
              this.listGroupOutside.push(this.listGroup[i]);
            }
          }
        }
      }
    }, error => {
      this.addGroup();
    });
  }

  addGroup() {
    this.listGroupInside.unshift({
      'id': '',
      'name': this.ca0007Translate.SHARE_OPTION.GROUP_INSIDE_HOSPITAL,
      'type': 'INSIDE'
    });
    if (this.userSession.personalFlag === true) {
      this.listGroupOutside.unshift({
        'id': '',
        'name': this.ca0007Translate.SHARE_OPTION.GROUP,
        'type': 'OUTSIDE'
      });
    }else {
      this.listGroupOutside.unshift({
        'id': '',
        'name': this.ca0007Translate.SHARE_OPTION.GROUP_OUTSIDE_HOSPITAL,
        'type': 'OUTSIDE'
      });
    }

  }

  /*
  * map option share
  */
  mapOptionShare(model: any, formModel: EventDetailsSettingValidator) {
    // model.providerType: 'OUTLOOK' or 'GOOGLE'
    if (!model.providerType && (model.userId || (model.userId === '' && model.groupId === ''))) {
      formModel.optionShare = 'MY';
      formModel.userId = model.userId;
    } else if (model.providerType && model.externalEmail) {
      formModel.optionShare = 'EXTERNAL';
      formModel.externalEmail = model.externalEmail;
      formModel.externalSummary = model.externalSummary;
      formModel.providerType = model.providerType;
      this.isExternalEvent = true;
    }
    if (model.groupId) {
      if (this.listGroup) {
        if (this.checkItemIsArrayListGroup(model.groupId, this.listGroupInside)) {
          formModel.userId = '';
          this.formModel.groupInside = model.groupId;
          formModel.optionShare = 'INSIDE_GROUP';
        } else if (this.checkItemIsArrayListGroup(model.groupId, this.listGroupOutside)) {
          this.formModel.groupOutside = model.groupId;
          formModel.userId = '';
          formModel.optionShare = 'OUTSIDE_GROUP';
        }
      }
    }
  }

  checkItemIsArrayListGroup(value, arrListGroup) {
    for (let i = 0; i < arrListGroup.length; i++) {
      if (arrListGroup[i].id === value) {
        return true;
      }
    }
    return false;
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
    this.validationError.week = false;
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
  * config display share option
  * */
  displayOption(value) {
    this.validationError.groupInside = false;
    this.validationError.groupOutside = false;
    if (!value) {
      if (this.formModel.userId) {
        value = this.valueShare.user;
      } else {
        value = this.valueShare.insideHospital;
      }
    }
    this.formModel.optionShare = value;
    this.editEventForm.controls.optionShare.setValue(value);

    let show = false;
    if (this.formModel.optionShare === this.valueShare.user) {
      show = true;
    }

    // publishType after optionShareGroup
    setTimeout(() => {
      this.showPublishType = show;
    }, 200);
  }

  checkUserIsStaff() {
    const userId = this.editEventForm.controls.userId.value;
    if (userId) {
      const staff = this.listStaff.filter((item) => (item.userId === userId));

      // if length array staff = 0, => user edit: my
      if (staff.length === 0 && userId === this.userSession.userId) {
        this.editEventForm.controls.userId.setValue('');
      }
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
      obj = this.ca0007PageRRule.repeatRuleConfig(valueRRule, optionRRule, startDay);
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
    obj = this.ca0007PageRRule.repeatRuleConfig(valueRRule, optionRRule, startDay);
    this.formModel.summary = obj.RRULE_SUMARY;
    this.model.repeatRule = obj.RRULE_STRING;
  }

  backCA0002(start?: string) {
    let date;
    if (start) {
      if (this.ca0004Model && (moment(start).format('YYYYMMDD') >= moment(this.ca0004Model.startDateCalendar).format('YYYYMMDD')) &&
        (moment(start).format('YYYYMMDD') <= moment(this.ca0004Model.endDateCalendar).format('YYYYMMDD'))) {
        if (this.ca0004Model.defaultView === 'month') {
          date = moment(this.ca0004Model.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.ca0004Model.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarDr', {date: date, defaultView: this.ca0004Model.defaultView});
      } else {
        this.localStorage.setObject('goToDateCalendarDr', {date: start, defaultView: this.ca0004Model.defaultView});
      }
    } else {
      if (this.ca0004Model) {
        if (this.ca0004Model.defaultView === 'month') {
          date = moment(this.ca0004Model.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.ca0004Model.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarDr', {date: date, defaultView: this.ca0004Model.defaultView});
      }
    }

    this.router.navigate(['ca/ca0002']);
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar) && event.charCode != '0') {
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

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.postEventDetailSettings();
  //   }
  // }
}
