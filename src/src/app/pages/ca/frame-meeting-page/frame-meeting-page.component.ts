///<reference path="../../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {FrameMeetingPageValidator} from './frame-meeting-page.validator';
import {FrameMeetingPageRrule} from './frame-meeting-page.rrule';
import {SharedValueService} from '../../../services/shared-value.service';
import {LocalStorage} from '../../../services/local-storage.service';
import {CalendarCommon} from '../../../common/calendar-common';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserSession} from '../../../models/ba/user-session';
import {VisitEntrySettings} from '../../../models/me/visit-entry-settings';
import {HttpError} from '../../../common/error/http.error';
import {MeetingService} from '../../../services/meeting.service';
import {FrameMeetingEditSetting} from '../../../models/ca/frame-meeting-edit-setting';
import {DialogResult} from '../../../models/dialog-param';
import {EventDetailsSettingsSaveResult} from '../../../models/ca/event-details-settings-save-result';
import {CalendarService} from '../../../services/calendar.service';
import {Location} from '@angular/common';
import {Helper} from '../../../common/helper';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-frame-meeting-page',
  templateUrl: './frame-meeting-page.component.html',
  styleUrls: ['./frame-meeting-page.component.scss'],
  providers: [FrameMeetingPageValidator, FrameMeetingPageRrule],
})
export class FrameMeetingPageComponent implements OnInit, OnDestroy {
  userSession: UserSession;
  dataStore: any = {};
  const: any = {};
  page_to_display: any;
  formModel: any = new FrameMeetingEditSetting();
  dayOfWeek: any = {};
  confirmDisplayObject: any = {};
  isMediator: boolean;
  private msgStore: any;
  private slots: number[];
  private formErrors: any;
  private frameMeetingId: any;
  private submitData: any = {};
  private meetingSettingTemp: any = {};
  I18N_VALUES = {
    'ja': {
      weekdays: ['日', '月', '火', '水', '木', '金', '土'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    'en': {
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
  };
  public frameMeetingModel;

  constructor(private localStorage: LocalStorage, private activatedRoute: ActivatedRoute, private router: Router, private location: Location,
              private frameMeetingPageValidator: FrameMeetingPageValidator, private frameMeetingPageRRule: FrameMeetingPageRrule,
              private calendarCommon: CalendarCommon, private helper: Helper,
              private dialogService: DialogService, private translate: TranslateService, private sharedValueService: SharedValueService,
              private meetingService: MeetingService, private calendarService: CalendarService) {
    this.setConstant();
    moment.locale(this.translate.currentLang, {
      weekdaysShort: this.I18N_VALUES['ja'].weekdays,
      monthsShort: this.I18N_VALUES['ja'].months
    });
  }

  ngOnInit() {
    this._onInit();
    if (this.page_to_display === this.const.pageFlag.form) {
      this.initForm();
    } else {
      this.initConfirm();
    }
  }

  ngOnDestroy() {
    this.localStorage.remove('ca0004_frame');
  }

  _onInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((param: any) => {
      this.frameMeetingId = param['event_id'];
    });
    let confirmParam: boolean;
    this.activatedRoute.queryParams.subscribe(params => {
      confirmParam = params['display'] || false;
    });
    this.translate.get('CA0004_PAGE').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getVisitableUsersSettings(this.userSession.userId, this.userSession.officeId, 1).subscribe(
      (settings: VisitEntrySettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dataStore.listMediator = this.formatCurrentUserName(settings.users);
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingSetting(this.userSession.userId, this.userSession.officeId, 1).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dataStore.meetingSetting = res;
        this.formModel.ignoreHoliday = this.getIgnoreHoliday();
        this.meetingSettingTemp[this.userSession.userId] = res;
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
    const page = confirmParam ? confirmParam : this.const.pageFlag.form;
    this.changePage(page);
  }

  setConstant() {
    this.const = {
      pageFlag: {
        form: 0,
        confirmEdit: 'edit',
        confirmCreate: 'create',
        confirmDelete: 'delete',
      },
      frameType: {
        spot: 'SPOT',
        slots: 'SLOTS'
      },
      acceptRequest: {
        yes: true,
        no: false
      },
      errorType: {
        unavailableTime: 'EXPECT',
        duplicateFrame: 'MEETING_FRAME',
        duplicateEvent: 'EVENT'
      },
      slots: this.calendarCommon.genSlots(60),
      timePicker: [],
      repeatFlag: this.frameMeetingPageRRule.repeatOption,
      repeatInterval: [],
      dayOfWeek: this.frameMeetingPageRRule.dayOfWeek,
      monthRepeatOption: this.frameMeetingPageRRule.monthOptionRepeat,
      endDate: this.frameMeetingPageRRule.endDate
    };
    for (let i = 0; i < 30; i++) {
      this.const.repeatInterval.push(i + 1);
    }
    this.calendarCommon.genTimePicker(this.const.timePicker);
  }

  /**-------------------------------------------------------------*/
  initForm() {
    // get default form value
    this.formErrors = this.frameMeetingPageValidator.formErrors;
    // if one has FP_7 right then he will have mediator right
    this.isMediator = this.userSession.funcAuthority.FP_7;
    if (this.frameMeetingId) {

    } else {
      this.getDataFromLocalStorage();
      const startMoment = moment(this.formModel.start);
      this.formModel.startTime = startMoment.format('HH:mm');
      this.formModel.endTime = moment(this.formModel.end).format('HH:mm');
      this.formModel[Object.keys(this.const.dayOfWeek)[startMoment.weekday()]] = true;
      // generate slot from startTime and endTime
      this.triggerChangeSlot(moment(this.formModel.start), moment(this.formModel.end));
    }
    this.getRRule();
  }

  formatCurrentUserName(userList) {
    //  change the name of current user
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].userId === this.userSession.userId) {
        this.translate.get('CA004').subscribe((response) => {
          userList[i].lastName = '';
          userList[i].firstName = response.SHARE_USER.VALUE_DEFAULT;
        });
        break;
      }
    }
    return userList;
  }


  getDataFromLocalStorage() {
    // populate data from local storage to form/page
    const model = this.localStorage.getObject('ca0004_frame');
    if (!model) {
      this.formModel.slots = 30;
      this.formModel.start = moment(new Date()).add(1, 'days').format('YYYY-MM-DDTHH:00');
      this.formModel.end = moment(this.formModel.start).add(0.5, 'hours').format('YYYY-MM-DDTHH:mm');
      this.formModel.officeUserId = this.userSession.officeUserId;
      this.formModel.userId = this.userSession.userId;
      this.formModel.place = '';
      this.formModel.frameType = 'SLOTS';
      this.formModel.officeId = this.userSession.officeId;
      this.userOnChange(this.userSession.officeUserId);
    } else {
      this.dataStore.ca0004Frame = model;
      this.formModel.slots = model.slots;
      this.formModel.start = model.start;
      this.formModel.end = model.end;
      this.formModel.officeUserId = model.officeUserId;
      this.formModel.userId = model.userId;
      this.formModel.place = model.place;
      this.formModel.frameType = model.frameType;
      this.formModel.officeId = model.officeId;
      this.userOnChange(model.officeUserId);
    }
  }

  getFullTime(startDay, startTime) {
    const format = 'YYYY/MM/DD HH:mm';
    const time = $('#' + startDay + '').val() + ' ' + $('#' + startTime).val();
    if (moment(time, format).isValid()) {
      return moment(time, format);
    } else {
      return;
    }
  }

  acceptRequestOnClick(value) {
    // show confirm dialog when click acceptRequest button
    if (value !== this.formModel.acceptRequest) {
      const html = value ? this.msgStore.DIALOG.ACCEPT_REQUEST.NOT_ACCEPT : this.msgStore.DIALOG.ACCEPT_REQUEST.ACCEPT;
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (dialogResult: DialogResult) => {
          if (dialogResult.isOk()) {
            this.formModel.acceptRequest = value;
          }
        }
      );
    }
  }

  userOnChange(officeUserId) {
    // user is changed then reload accept Request and meeting setting
    if (officeUserId) {
      let user: any;
      if (this.dataStore.listMediator) {
        user = this.helper.findByField(this.dataStore.listMediator, 'officeUserId', officeUserId);
      } else {
        user = this.formModel;
      }
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const data = {userId: user.userId, officeId: user.officeId};
      this.getMeetingSetting(data, () => {
        this.formModel.ignoreHoliday = this.getIgnoreHoliday();
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.getAcceptRequest(data);
      });
    }
  }

  getAcceptRequest(user) {
    const officeUserId = user.officeUserId;
    if (!this.dataStore.acceptRequest) {
      this.dataStore.acceptRequest = {};
    }
    if (this.dataStore.acceptRequest.hasOwnProperty(officeUserId)) {
      this.formModel.acceptRequest = this.dataStore.acceptRequest[officeUserId];
    } else {
      this.calendarService.getAcceptRequest(user.userId, user.officeId).subscribe(
        (data) => {
          this.dataStore.acceptRequest[officeUserId] = data.acceptRequest;
          this.formModel.acceptRequest = this.dataStore.acceptRequest[officeUserId];
        }, (error: HttpError) => {
          const ret = error.message;
          if (ret === 'DR not setting meeting') {
            this.dataStore.acceptRequest[officeUserId] = false;
            this.formModel.acceptRequest = this.dataStore.acceptRequest[officeUserId];
          } else {
            this.dialogService.showError('MSG.ERROR');
          }
        });
    }
  }

  frameMeetingTimeOnChange(date: any) {
    const start = this.getFullTime('startDay', 'startTime');
    const end = this.getFullTime('endDay', 'endTime');
    this.formModel.start = start.format();
    this.formModel.end = end.format();
    if (start && end) {
      // if selected date/time changes then update slot and rrule
      this.triggerChangeSlot(start, end);
      this.getRRule();
    }
  }

  triggerChangeSlot(start, end) {
    // recalculate slot
    const timeLimit = end.diff(start, 'minutes');
    this.slots = this.calendarCommon.genSlots(timeLimit);
    if (this.slots.indexOf(parseInt(this.formModel.slots, 10)) === -1) {
      // set default slot value = max slot value possible
      this.formModel.slots = this.slots[this.slots.length - 1];
    }
  }

  updateRRuleObject() {
    // recalculate rrule based on updated data
    let valueRRule;
    let optionRRule;
    const editEventForm = this.makeFormGroup();
    valueRRule = editEventForm.get('repeatRule').value;
    optionRRule = editEventForm.get('repeatOption').value;
    const startDay = this.formModel.start;
    return this.frameMeetingPageRRule.repeatRuleConfig(valueRRule, optionRRule, startDay);
  }

  getRRule() {
    if (this.formModel.isRepeat) {
      setTimeout(() => {
        this.preventInputNumber();
      }, 0);
    } else {
      this.formModel.ignoreHoliday = this.getIgnoreHoliday();
    }
    if (this.formModel.endFrame !== this.const.endDate.count_time) {
      this.formModel.countTime = '';
    }
    if (this.formModel.endFrame !== this.const.endDate.until_day) {
      this.formModel.untilDay = '';
    }
    const rrule = this.updateRRuleObject();
    this.formModel.summary = this.frameMeetingPageRRule.getSummary(rrule);
    this.formModel.repeat = rrule.toString();
  }

  makeFormGroup() {
    const formGroup = this.frameMeetingPageValidator.createForm(this.formModel);
    if (!this.formModel.isRepeat) {
      formGroup.patchValue(
        {'repeatOption': this.const.repeatFlag.noRepeat});
    }
    return formGroup;
  }

  getUntilDayOnChange(date: any) {
    date = moment(date).format('YYYY-MM-DDT23:59:59Z');
    if (date !== this.formModel.untilDay) {
      this.formModel.untilDay = date;
      this.getRRule();
    }
  }

  preventInputNumber() {
    $('#countTime').on('keydown', this.helper.numericOnly);
    this.helper.numbericOnlyPaste('countTime');
  }

  /** validate both form
   *
   * @returns {boolean}
   */
  checkError(): boolean {
    const editEventForm = this.makeFormGroup();
    const errorList = this.frameMeetingPageValidator.checkValidate(editEventForm);
    this.formErrors = errorList;
    for (const key in errorList) {
      if (errorList.hasOwnProperty(key) && errorList[key]) {
        this.dialogService.showError(errorList[key]);
        return false;
      }
    }
    return true;
  }

  /**
   * validate edit form and move to confirm page if no errors
   */
  updateOrCreateNewMeetingFrameSubmit() {
    if (this.formModel.repeatOption !== this.const.repeatFlag.noRepeat
      && this.formModel.endFrame === this.const.endDate.until_day && !this.formModel.untilDay) {
      this.getUntilDayOnChange(this.formModel.start);
    }
    const validate = this.checkError();
    if (validate) {
      this.makeConfirmEditPage();
      this.changePage(this.const.pageFlag.confirmEdit);
    }
  }

  /**-------------------------------------------------------------*/
  makeConfirmEditPage() {
    const rrule = this.updateRRuleObject();
    let endFrameSummary = this.frameMeetingPageRRule.getEndFrameSummary(rrule, true);
    endFrameSummary = endFrameSummary ? endFrameSummary : 'なし（最大 100回 まで）';
    this.confirmDisplayObject = {
      repeatRuleJap: this.frameMeetingPageRRule.getRepeatSummary(rrule).trim(),
      endFrameJap: endFrameSummary
    };
    this.loadConfirm(this.formModel);
  }

  submitForm() {
    this.submit();
  }

  backCA0002(start?: string) {
    let date;
    this.frameMeetingModel = this.localStorage.getObject('ca0004_frame');
    if (start) {
      if (this.frameMeetingModel && (moment(start).format('YYYYMMDD') >= moment(this.frameMeetingModel.startDateCalendar).format('YYYYMMDD')) &&
        (moment(start).format('YYYYMMDD') <= moment(this.frameMeetingModel.endDateCalendar).format('YYYYMMDD'))) {
        if (this.frameMeetingModel.defaultView === 'month') {
          date = moment(this.frameMeetingModel.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.frameMeetingModel.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarDr', {date: date, defaultView: this.frameMeetingModel.defaultView});
      } else {
        this.localStorage.setObject('goToDateCalendarDr', {date: start, defaultView: this.frameMeetingModel.defaultView});
      }
    } else {
      if (this.frameMeetingModel) {
        if (this.frameMeetingModel.defaultView === 'month') {
          date = moment(this.frameMeetingModel.startDateCalendar).add(21, 'days');
        } else {
          date = moment(this.frameMeetingModel.startDateCalendar).add(3, 'days');
        }
        this.localStorage.setObject('goToDateCalendarDr', {date: date, defaultView: this.frameMeetingModel.defaultView});
      }
    }
    this.router.navigate(['ca/ca0002']);
  }

  changePage(page) {
    this.page_to_display = page;
  }

  callPutApi(data) {
    this.calendarService.putMeetingFrame(data).subscribe((response: EventDetailsSettingsSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('MSG.SAVED').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.backCA0002(data.start);
          }
        }
      );
    }, (error) => {
      let msg = this.mapError(error.json());
      msg = msg ? msg : 'MSG.ERROR';
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError(msg);
    });
  }

  submitToServer(data) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.calendarService.validateMeetingFrame(data).subscribe((response) => {
      if (response.allow === true) {// pass validate
        this.callPutApi(data);
      }
      if (response.allow === false) { // not pass
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.showMsg(response);
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  mapError(body) {
    const ret = body.message;
    let msg = '';
    if (ret === 'The start time must be greater than now') {
      msg = this.msgStore.ERROR_VALIDATE.DATE_IN_THE_PAST;
    }
    return msg;
  }

  showMsg(response) {
    let msg = '';
    switch (response.type) {
      case this.const.errorType.unavailableTime:
        this.getMeetingSetting(this.submitData, () => {
          const list = this.getUnavailableTime(response.items);
          msg = this.msgStore.ERROR_VALIDATE.SERVER.UNAVAILABLE_TIME + '<br/>';
          for (let i = 0; i < 3; i++) {
            if (list[i]) {
              msg += moment(list[i].day).format('YYYY年MM月DD(ddd) ') + list[i].start + '〜' + list[i].end + '<br/>';
            }
          }
          msg += this.msgStore.ERROR_VALIDATE.SERVER.ERROR_DUPLICATE_TIME_DETAIL;
          this.dialogService.showMessage('error', false, null, null, msg, 'MSG.OK', null);
        });
        break;
      case this.const.errorType.duplicateFrame:
        msg = this.msgStore.ERROR_VALIDATE.SERVER.DUPLICATE_TIME_FRAME + '<br/>';
        msg += this.printList(response.items);
        msg += this.msgStore.ERROR_VALIDATE.SERVER.ERROR_DUPLICATE_TIME_DETAIL;
        this.dialogService.showMessage('error', false, null, null, msg, 'MSG.OK', null);
        break;
      case this.const.errorType.duplicateEvent:
        msg = this.msgStore.ERROR_VALIDATE.SERVER.DUPLICATE_EVENT + '<br/>';
        msg += this.printList(response.items);
        msg += this.msgStore.ERROR_VALIDATE.SERVER.ERROR_DUPLICATE_TIME_DETAIL;
        this.dialogService.showMessage('error', false, null, null, msg, 'MSG.OK', null);
        break;
    }
  }

  printList(list) {
    let msg = '';
    for (let i = 0; i < 3; i++) {
      if (list[i]) {
        msg += moment(list[i].start).format('YYYY年MM月DD(ddd) HH:mm') + '〜' + moment(list[i].end).format('HH:mm') + '<br/>';
      }
    }
    return msg;
  }

  getUnavailableTime(listViolated) {
    let listUnavailableTime: any[];
    const settingOfWeek = this.frameMeetingPageValidator.settingOfWeek(
      this.dataStore.meetingSetting.selfSetting, this.dataStore.meetingSetting.hospitalSetting);
    let display = [];
    for (let i = 0; i < listViolated.length; i++) {
      const day = moment(listViolated[i].start); // add time zone
      listUnavailableTime = this.frameMeetingPageValidator.getUnavailableTimeInDay(settingOfWeek[day.weekday()], day.format());
      display = display.concat(this.frameMeetingPageValidator.getSpecificViolatedTime(listUnavailableTime, listViolated[i]));
      if (display.length > 2) {
        break;
      }
    }
    return display;
  }

  getMeetingSetting(data, callback?) {
    this.dataStore.meetingSetting = {};
    if (this.meetingSettingTemp[data.userId]) {
      this.dataStore.meetingSetting = this.meetingSettingTemp[data.userId];
      if (callback) {
        callback();
      }
    } else {
      this.meetingService.getMeetingSetting(data.userId, data.officeId, 1).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dataStore.meetingSetting = res;
          this.meetingSettingTemp = {};
          this.meetingSettingTemp[data.userId] = res;
          if (callback) {
            callback();
          }
        },
        (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }

  backPreviousPage() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    const html = '<span>' + this.msgStore.CHANGE_PAGE_WARNING + '</span>';
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.backCA0002();
        }
      }
    );
  }

  /**-------------------------------------------------------------*/

  initConfirm() {
    this.getDataFromLocalStorage();
    this.loadConfirm(this.dataStore.ca0004Frame);
  }

  loadConfirm(data) {
    const startTime = data.start;
    const endTime = data.end;
    if (data.frameType === this.const.frameType.slots && data.slots) {
      this.confirmDisplayObject.frameList = this.generateFrameList(data.slots, startTime, endTime);
    }
  }

  generateFrameList(slots, startTime, endTime) {
    const frameList = [];
    startTime = moment(startTime);
    endTime = moment(endTime);
    const frameTotal = Math.floor(endTime.diff(startTime, 'minutes') / slots);
    for (let i = 0; i < frameTotal; i++) {
      frameList.push({
        start: startTime.format('HH:mm'),
        end: startTime.add(slots, 'minute').format('HH:mm')
      });
    }
    return frameList;
  }

  submit() {
    const user = this.helper.findByField(this.dataStore.listMediator, 'officeUserId', this.formModel.officeUserId);
    this.formModel.userId = user.userId;
    this.formModel.officeId = user.officeId;
    const data = this.frameMeetingPageValidator.mapDataToSend(this.formModel, this.userSession);
    if (!this.formModel.isRepeat) {
      data.repeat = '';
    }
    const rule = this.updateRRuleObject();
    if (data.repeat && !rule.options.count && !rule.options.until) {
      rule.options.count = 100;
      data.repeat = rule.toString();
    }
    if (data.repeat) {
      data.repeat = 'RRULE:' + data.repeat;
    }
    data.frameType = data.frameType === this.const.frameType.spot ? '0' : '1';
    // format time to ISO
    data.start = moment(data.start).format('YYYY-MM-DDTHH:mm:ssZZ');
    data.end = moment(data.end).format('YYYY-MM-DDTHH:mm:ssZZ');
    // send userId by the name of officeUserId
    data.officeUserId = data.userId;
    this.submitData = data;
    this.submitToServer(data);
  }

  createFrame() {
    const validate = this.checkError();
    if (validate) {
      this.getRRule();
      this.submit();
    }
  }

  ignoreHolidayOnChange(e) {
    if (this.getIgnoreHoliday()) {
      this.formModel.ignoreHoliday = this.getIgnoreHoliday();
      return false;
    }
  }

  getIgnoreHoliday() {
    return !this.dataStore.meetingSetting.allowHolidayVisitOffice || !this.dataStore.meetingSetting.allowHolidayVisitUser;
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
      this.formModel.countTime = 100;
    }

    if (parseInt(valueInput, 0) === 0) {
      this.formModel.countTime = 1;
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if (this.page_to_display === this.const.pageFlag.confirmCreate) {
  //       this.createFrame();
  //     } else if (this.page_to_display || this.page_to_display === this.const.pageFlag.form) {
  //       this.updateOrCreateNewMeetingFrameSubmit();
  //     }
  //   }
  // }
}
