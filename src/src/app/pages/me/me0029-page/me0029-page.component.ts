import {ChangeDetectorRef, Component, HostListener, Injectable, OnDestroy, OnInit} from '@angular/core';
import { CalendarCommon } from '../../../common/calendar-common';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import 'fullcalendar';
declare var moment: any;

import {LocalStorage} from '../../../services/local-storage.service';
import {MeetingService} from '../../../services/meeting.service';
import {TranslateService} from '@ngx-translate/core';
import {Me0029PageValidator} from './me0029-page.validator';
import {CreateEventMeeting} from '../../../models/me/create-event-meeting';

import {NgbDatepickerI18n} from '@ng-bootstrap/ng-bootstrap';
import {InfoUserRequest} from '../../../models/me/info-user-request';
import {GroupPurposes} from '../../../models/me/group-purposes';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';
import {MeetingCommon, ModelInput, SettingType} from '../../../common/meeting-common';
import {EventNoMeeting} from '../../../models/me/event-no-meeting';
import {OriginalRequest} from '../../../models/me/original-request';
import {DialogService} from '../../../services/dialog.service';
import {MasterService} from '../../../services/master.service';
import {CalendarService} from '../../../services/calendar.service';
import {Title} from '@angular/platform-browser';

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
  language;
  constructor(private translate: TranslateService) {
    this.language = this.translate.currentLang;
  }
}

@Component({
  selector: 'app-me0029-page',
  templateUrl: './me0029-page.component.html',
  styleUrls: ['./me0029-page.component.scss'],
  providers: [Me0029PageValidator, I18n, {provide: NgbDatepickerI18n, useClass: Me0029PageComponent}]
})
export class Me0029PageComponent extends NgbDatepickerI18n implements OnInit, OnDestroy {
  public ModelInput: typeof ModelInput = ModelInput;
  public modelInput = ModelInput.FUTURE;
  public senderRequest: InfoUserRequest;
  public receiverRequest: InfoUserRequest;
  public userSession: UserSession;
  public listEventMeetingFixedDoctor = [];
  public listEventMeetingFixedMR = [];
  public listEventOfSender = [];
  public listEventOfReceiver = [];
  public listEventHoliday = [];

  public originalRequest = new OriginalRequest();
  public lang: any;
  public currentDate: string;
  public dateCalendar: string;
  public tomorrow: string;
  public datePicker;
  public endDate: any;
  public information;
  public groupPurposesRequester = {
    'DOCTOR': '',
    'MR': '',
  };
  public groupPurposes: GroupPurposes[];
  public formCreateMeeting: CreateEventMeeting;
  public errorValidateForm = {
    date: '',
    listDate: [],
    purposeId: '',
    productName: '',
    numberVisitors: '',
    place: '',
    note: ''
  };

  public selectTime = false;
  public maxMeetingAddPass = 1;
  public maxMeetingAddFuture = 5;
  public confirmCreateMeeting: boolean;
  public stringNameProduct: string;

  // search doctor
  public options: any;
  public indexCalendar: number;

  // setting meeting
  public hospitalSetting: any;
  public selfSetting: any;
  public SettingType: typeof SettingType = SettingType;
  public settingHolidayMeeting = false;
  public listEventNoMeeting = [];

  // public industryType = true;
  public msgME0029: any;

  // setting meeting
  public flagMeeting: boolean;

  // set position popup hover
  public showTop = true;
  public showPopover = false;
  public popup = {
    title: '',
    time: '',
    place: '',
    showTime: false
  };

  public listEventViewNoMeeting: any[];
  public productType = '';
  public htmlNameProduct: string;
  public temporaryRegister = false;

  public countFullCalendar = 0;
  public temporaryListTimeSelect = []; // add temporaryListTimeSelect while wait api getMeetingSetting
  public nowIsHoliday: boolean;
  public inputAddTimeSelect = false;

  public listEventCalendar1 = [];
  public listEventCalendar2 = [];
  public loadEventTimeSelectCalendar1 = false;
  public loadEventTimeSelectCalendar2 = false;

  constructor(private meetingService: MeetingService, private dialogService: DialogService, private calendarCommon: CalendarCommon,
              private translate: TranslateService, private router: Router, private localStorage: LocalStorage,
              private me0029PageValidator: Me0029PageValidator, private activatedRoute: ActivatedRoute,
              private _i18n: I18n, private sharedValueService: SharedValueService, private helper: Helper,
              private meetingCommon: MeetingCommon, private masterService: MasterService, private calendarService: CalendarService,
              private cd: ChangeDetectorRef, private titleService: Title) {
    super();
    this.confirmCreateMeeting = false;
    this.lang = this.translate.getDefaultLang();
    this.senderRequest = new InfoUserRequest('', '', '', '', '', '', '', '');
    this.receiverRequest = new InfoUserRequest('', '', '', '', '', '', '', '');
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

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.titleService.setTitle(this.translate.instant('DOC_TITLE.ME0029'));
    const date = new Date();
    this.currentDate = moment(date).format('YYYY-MM-DD');
    this.dateCalendar = moment(this.currentDate).add(1, 'days').format('YYYY-MM-DD');
    this.tomorrow = this.dateCalendar;
    this.datePicker = this.calendarCommon.convertDatetime(this.dateCalendar).date;

    $('#calendar1').css( 'visibility', 'hidden' );
    $('#calendar2').css( 'visibility', 'hidden' );
    setTimeout(() => {
      this.createCalendar('calendar1');
      this.createCalendar('calendar2');
    });

    this.formCreateMeeting = new CreateEventMeeting('MR');
    this.hide_popover_detail_event();
    this.userSession = this.sharedValueService.getUserSession();
    this.getInfoParams();
    this.translate.get('ME0029.ME0029').subscribe(
      (res) => {
        this.msgME0029 = res;
      }
    );
  }

  getInfoParams() {
    this.activatedRoute.params.subscribe((param: any) => {

      if (!$.isEmptyObject(param)) {
        this.receiverRequest = new InfoUserRequest('', '', '', '', param.officeId, param.userId, '', '');
        this.getTimeSettingMeeting();
        this.senderRequest = new InfoUserRequest('', this.userSession.officeName, this.userSession.firstName,
          this.userSession.lastName, this.userSession.officeId, this.userSession.userId, '', '');

        this.modelInput = param.modelInput ? parseInt(param.modelInput, 10) : ModelInput.FUTURE;
        const requestId = param['requestId'] ? param['requestId'] : '';
        this.getScreenMeetingRequest(param.userId, param.officeId, requestId);
      }

    });
  }

  ngOnDestroy() {
    this.localStorage.remove('me0006OriginalRequest');
  }

  getScreenMeetingRequest(userIdReceiveRequest: string, officeIdReceiveRequest: string, requestId: string) {
    this.meetingService.getScreenMeetingRequestOfMR(userIdReceiveRequest, officeIdReceiveRequest, requestId).subscribe(
      (res) => {
        if (!$.isEmptyObject(res)) {
          this.information = res;
          const receiverRequest = this.information.receiverRequest;
          this.temporaryRegister = receiverRequest.provisional;
          this.senderRequest.industryType = this.information.industryType;

          if (requestId) {
            this.originalRequest = (this.information.meetingRequest.meetingRequests.length > 0) ?
              this.information.meetingRequest.meetingRequests[0] : {};
            this.originalRequest.requestId = requestId;
            if (!$.isEmptyObject(this.originalRequest)) {
              this.receiverRequest = new InfoUserRequest(this.originalRequest.dr.avatar, this.originalRequest.dr.officeName,
                this.originalRequest.dr.firstName, this.originalRequest.dr.lastName, this.originalRequest.dr.drOfficeId,
                this.originalRequest.dr.dr, '', '');
            }
            this.convertListCommentOriginRequest();
            this.convertStringNameProduct();
          } else {
            this.receiverRequest = new InfoUserRequest(receiverRequest.avatar, receiverRequest.officeName, receiverRequest.firstName,
              receiverRequest.lastName, officeIdReceiveRequest, userIdReceiveRequest, '', '');
          }
          // this.filterGroupPurposes(this.information.masterMeetingPurpose.groups);
          this.getInfoCalendar();
          this.getListGroupPurposes();
        }
      },
      (error) => {
        this.getInfoCalendar();
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  changeRequester(event) {
    this.formCreateMeeting = event;
    this.getListGroupPurposes();
  }

  getListGroupPurposes() {
    // userType: DR: 0 , MR: 2
    if (!this.groupPurposesRequester[this.formCreateMeeting.request]) {
      const userType = (this.formCreateMeeting.request === 'MR') ? 2 : 0;
      this.meetingService.getMeetingPurpose(userType, this.isPharmaceuticalCompany()).subscribe(
        (res) => {
          this.filterGroupPurposes(res.groups);
          if (!$.isEmptyObject(res)) {
            this.groupPurposesRequester[this.formCreateMeeting.request] = res.groups;
          }
        }
      );
    } else {
      this.filterGroupPurposes(this.groupPurposesRequester[this.formCreateMeeting.request]);
    }
  }

  convertListCommentOriginRequest() {
    const length = this.originalRequest.comments.length;
    if (length >= 2) {
      this.originalRequest.comments = this.originalRequest.comments.slice(length - 1, length);
    }
  }

  filterGroupPurposes(groupPurposes: any) {
    const listPurposes = [];
    const isPharmacy = this.isPharmaceuticalCompany();
    if (groupPurposes && groupPurposes.length > 0) {
      for (let i = 0; i < groupPurposes.length; i++) {
        if (groupPurposes[i].pharmacy === isPharmacy) {
          listPurposes.push(groupPurposes[i]);
        }
      }
    }
    this.groupPurposes = listPurposes;
  }

  getTimeSettingMeeting() {
    // remove temporary list TimeSelect
    this.temporaryListTimeSelect = [];
    this.meetingService.getMeetingSetting(this.receiverRequest.userId, this.receiverRequest.officeId, 1).subscribe(
      (res) => {
        this.getSettingHolidayMeeting(res);
        this.hospitalSetting = this.meetingCommon.sortSettingDayListMeeting(res.hospitalSetting);
        this.selfSetting = this.meetingCommon.sortSettingDayListMeeting(res.selfSetting);
        this.settingOfWeek();
      }
    );
  }

  getSettingHolidayMeeting(meetingSetting: any) {
    if (!meetingSetting.allowHolidayVisitOffice) {
      this.settingHolidayMeeting = true;
    } else {
      this.settingHolidayMeeting = !meetingSetting.allowHolidayVisitUser;
    }
  }

  settingOfWeek() {
    const  settingDayList = this.selfSetting.settingDayList;
    for (let i = 0; i < settingDayList.length; i++) {
      if (settingDayList[i].settingType === this.SettingType.NONE) {
        const settingType = this.hospitalSetting.settingDayList[i].settingType;
        settingDayList[i].settingType = settingType;
        if (settingType === this.SettingType.SET_TIME) {
          settingDayList[i].settingTimeList = this.hospitalSetting.settingDayList[i].settingTimeList;
        }
      }

      if (settingDayList[i].settingType === this.SettingType.SET_TIME &&
        this.hospitalSetting.settingDayList[i].settingType === this.SettingType.DISALLOW_ALL_DAY) {
        settingDayList[i].settingType = this.SettingType.DISALLOW_ALL_DAY;
      }
    }
  }

  getListTimeNoMeeting(calendar: string, listEvent?: any[]) {
    this.nowIsHoliday = false;
    this.listEventNoMeeting = [];
    this.listEventViewNoMeeting = [];
    const startDate = this.dateCalendar;
    const endDate = moment(this.dateCalendar).add(1, 'days').format();

    const settingDayList = this.selfSetting ? this.selfSetting.settingDayList : [];

    if (this.settingHolidayMeeting) {
      const listEventHoliday = this.getListEventHolidayCalendar();
      this.listEventViewNoMeeting = this.listEventViewNoMeeting.concat(listEventHoliday);
      this.listEventNoMeeting = this.listEventNoMeeting.concat(listEventHoliday);
    }

    if (settingDayList.length > 0 && !this.nowIsHoliday) {
      this.listEventViewNoMeeting = this.me0029PageValidator.getListTimeNoMeeting(startDate, endDate, settingDayList,
        this.modelInput, false);

      // Still can choose the time in the past whether setting can not meeting
      if (this.modelInput === ModelInput.PASS || (this.modelInput === ModelInput.DOCUMENT && !this.isFutureDate()) ) {
        this.listEventNoMeeting = this.me0029PageValidator.getListTimeNoMeeting(startDate, endDate, settingDayList, this.modelInput, true);
      } else {
        this.listEventNoMeeting = this.listEventViewNoMeeting;
      }
    }

    // check event view in timeNoMeeting
    const listEventFilter = [];
    if (listEvent && listEvent.length > 0) {
      for (let i = 0; i < listEvent.length; i++) {
        // event AllDay display calendar, event no allDay => check timeNoMeeting
        if (listEvent[i].allDay) {
          listEventFilter.push(listEvent[i]);
        } else {
          if (this.me0029PageValidator.isTimeMeeting(listEvent[i].start, listEvent[i].end, this.listEventViewNoMeeting)) {
            listEventFilter.push(listEvent[i]);
          }
        }
      }
    }

    this.selectTime = true;
    // check temporaryListTimeSelect with time no meeting
    for (let i = 0; i < this.temporaryListTimeSelect.length; i++) {
      const time = this.temporaryListTimeSelect[i];
      this.addTimeInFormMeeting(time.dateStart, time.dateEnd, true);
    }
    this.temporaryListTimeSelect = [];

    // list time select in timeNoMeeting
    const listDate = this.formCreateMeeting.date;
    const listTimeSelectFilter = [];
    for (let i = 0; i < listDate.length; i++) {

      const dateStart = moment(listDate[i].dateStart + 'T' + listDate[i].startTime).format();
      const dateEnd = moment(listDate[i].dateStart + 'T' + listDate[i].endTime).format();

      if (this.me0029PageValidator.isTimeMeeting(dateStart, dateEnd, this.listEventViewNoMeeting)) {
        listTimeSelectFilter.push(listDate[i]);
      }
    }

    if (calendar) {
      $('.fc-time-grid-event').hide();
      if (calendar === 'calendar1') {
        this.listEventCalendar1 = [];
        this.loadEventTimeSelectCalendar1 = true;
        this.listEventOfSender = this.listEventViewNoMeeting.concat(listEventFilter);
        this.addEventMeeting(listTimeSelectFilter, calendar, this.listEventOfSender);
      } else {
        this.listEventCalendar2 = [];
        this.loadEventTimeSelectCalendar2 = true;
        this.listEventOfReceiver = this.listEventViewNoMeeting.concat(listEventFilter);
        this.addEventMeeting(listTimeSelectFilter, calendar, this.listEventOfReceiver);
      }
    }
  }

  getListEventHolidayCalendar() {
    const listEvent = [];
    const timeZone = parseInt(moment(new Date()).format('Z'), 10);
    const year = moment(this.dateCalendar).format('YYYY');
    for (let i = 0; i < this.listEventHoliday.length; i++) {
      if (this.listEventHoliday[i].date === year) {
        const listHoliday = this.listEventHoliday[i].listEvent;
        for (let j = 0; j < listHoliday.length; j++) {
          const date = moment(listHoliday[j].start).add(9 - timeZone, 'hours').format('YYYY-MM-DD');
          if (moment(this.dateCalendar).format('YYYY-MM-DD') === date) {
            this.nowIsHoliday = true;
          }
          const event = new EventNoMeeting(listHoliday[j].start, listHoliday[j].end);
          listEvent.push(event);
        }
      }
    }
    return listEvent;
  }

  createCalendar(calendar) {
    const self = this;
    $('#' + calendar).fullCalendar({
      defaultView: 'agendaDay',
      locale: self.lang,
      slotLabelFormat: 'HH:mm',
      defaultDate: self.dateCalendar,
      editable: false,
      droppable: false,
      eventLimit: 2,
      scrollTime: moment.duration('08:00:00'),
      slotDuration: moment.duration('00:15:00'),
      selectable: true,
      slotEventOverlap: false,
      eventRender: function(event, element, view) {
        if ((event.calendarType === 'noMeeting')) {
          $(element).find('.fc-time').remove();
          $(element).css({
            cursor: 'default',
            border: '0px solid transparent',
          });
        } else {
          if (!(event.calendarType === self.calendarCommon.calendarType.MY && event.allDay)) {
            $(element).css({
              'margin-right': '5px'
            });
          }
        }

        if (event.calendarType === self.calendarCommon.calendarType.MY) {
          if (moment(event.endEvent).format('YYYYMMDD') !== moment(event.startEvent).format('YYYYMMDD') && !event.allDay) {

            $(element).find('.fc-time').remove();
            const htmlTitle = $(element).find('.fc-content');

            const time = moment(event.startEvent).format('D') + '日' + moment(event.startEvent).format('HH:mm') +
              ' - ' + moment(event.endEvent).format('D') + '日' + moment(event.endEvent).format('HH:mm');

            const html = '<span class="fc-time-meeting">' + time + '</span>' + htmlTitle.html();
            htmlTitle.html(html);
          }
          if (moment(event.endEvent).format('YYYYMMDD') === moment(event.startEvent).format('YYYYMMDD') && !event.allDay) {
            const time = moment(event.startEvent).format('HH:mm') + ' - ' + moment(event.endEvent).format('HH:mm');
            $(element).find('.fc-time span').html(time);
          }
        }

        if (event.calendarType === 'createMeeting') {
          $(element).css({
            border: '2px solid #F18D00',
          });
        }
        if (event.nameOffice) {
          $(element).append('<span class="fc-office-name-meeting">' + event.nameOffice + '</span>');
        }
      },
      dayClick: function(date, jsEvent, view) {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (iOS && jsEvent && !$(jsEvent.target).parents('.fc-day-grid').hasClass('fc-day-grid')) {
          const timeStart = moment(date).format('YYYY-MM-DDTHH:mm');
          let timeEnd = moment(date).add(15, 'minutes').format('YYYY-MM-DDTHH:mm');
          setTimeout(() => {
            if (moment(timeStart).format('YYYY-MM-DD') === moment(timeEnd).format('YYYY-MM-DD')) {
              self.addTimeInFormMeeting(timeStart, timeEnd);
            } else {
              // check select all day
              // if (moment(timeStart).format('HHmm') !== '0000') {
              timeEnd = moment(timeEnd).add(-5, 'minutes').format();
              self.addTimeInFormMeeting(timeStart, timeEnd);
              // }
            }
          }, 400);
        }
      },
      select: function(start, end, resources) {
        // check click allDay
        if (resources && !$(resources.target).parents('.fc-day-grid').hasClass('fc-day-grid')) {
          const timeStart = moment(start).format('YYYY-MM-DDTHH:mm');
          let timeEnd = moment(end).format('YYYY-MM-DDTHH:mm');

          if (moment(timeStart).format('YYYY-MM-DD') === moment(timeEnd).format('YYYY-MM-DD')) {
            self.addTimeInFormMeeting(timeStart, timeEnd);
          } else {
            // check select all day
            // if (moment(timeStart).format('HHmm') !== '0000') {
            timeEnd = moment(timeEnd).add(-5, 'minutes').format();
            self.addTimeInFormMeeting(timeStart, timeEnd);
            // }
          }
        }
      },
      eventSources: [
        {
          events(start, end, timezone, callback) {
            if (calendar === 'calendar1') {
              callback(self.listEventCalendar1);
            } else {
              callback(self.listEventCalendar2);
            }
          }
        }
      ],
      viewRender: function (view, element) {
        // if (self.lang === Helper.lang.JAPAN) {
        let start = moment(view.start).format('YYYY-MM-DD');
        let end = moment(view.end).format('YYYY-MM-DD');
        start = moment(start).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
        end = moment(end).add(-1, 'milliseconds').format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');

        self.setTitleView();

        element.find('td.fc-widget-content>span').parent().parent().each(function () {
          $(this).addClass('fc-agenda-hover');
          $(this).next().addClass('fc-agenda-hover');
        });
        // }
      },
      eventAfterAllRender: function() {
        self.countFullCalendar = self.countFullCalendar + 1;
        if (self.countFullCalendar >= 3) {
          $('.fc-scroller').css( 'visibility', 'visible' );
          $('#calendar1').css( 'visibility', 'visible' );
          $('#calendar2').css( 'visibility', 'visible' );
          setTimeout(() => {
            self.dialogService.setLoaderVisible(false);
          });
        }
      },
      eventClick: function (calEvent, jsEvent, view) {
        setTimeout(() => {
          self.showPopupEvent(calEvent, jsEvent);
        });
      },
    });

    $('#calendar2').fullCalendar('option', 'eventLimitClick', function (){});
    $('#' + calendar).fullCalendar('option', 'height', 900);
  }

  setTitleView() {
    if (this.modelInput !== this.ModelInput.CHANG_TIME && this.modelInput !== this.ModelInput.DOCUMENT) {
      if (this.isFutureDate()) {
        this.modelInput = this.ModelInput.FUTURE;
      } else {
        this.modelInput = this.ModelInput.PASS;
      }
    }
    this.datePicker = this.calendarCommon.convertDatetime(this.dateCalendar).date;
    const viewTitleWeek = moment(this.dateCalendar).format('YYYY年M月D日') + this.calendarCommon.getWeekdayJapanese(this.dateCalendar);
    $('#title-calendar').html(viewTitleWeek);

    // set position scroll calendar
    const self = this;
    $('.fc-time-grid-container').on('scroll', function () {
      if (!self.indexCalendar) {
        $('#calendar2').find('.fc-time-grid-container').scrollTop($(this).scrollTop());
        $('#calendar1').find('.fc-time-grid-container').scrollTop($(this).scrollTop());
      } else {
        if ($(this).parents('#calendar1').length > 0 && self.indexCalendar === 1) {
          $('#calendar2').find('.fc-time-grid-container').scrollTop($(this).scrollTop());
        }
        if ($(this).parents('#calendar2').length > 0 && self.indexCalendar === 2) {
          $('#calendar1').find('.fc-time-grid-container').scrollTop($(this).scrollTop());
        }
      }
    });
    $('.fc-today').css('background', 'transparent');
  }

  mouseOverCalendar(index: number) {
    this.indexCalendar = index;
  }

  prevCalendar() {
    const oldDate = this.dateCalendar;
    const dateCalendar = moment(this.dateCalendar).add(-1, 'days').format('YYYY-MM-DD');

    if (this.isGoPassDate(oldDate, dateCalendar)) {
      if (this.modelInput === this.ModelInput.CHANG_TIME) {
        this.dialogService.showError('MSG.ME.MEETING_REQUEST.NO_GO_PASS');
      } else {
        this.confirmGoPassDate(dateCalendar);
      }
    } else {
      this.getTimeSettingMeeting();
      this.dateCalendar = dateCalendar;
      this.getInfoCalendar();
      $('#calendar1').fullCalendar('prev');
      $('#calendar2').fullCalendar('prev');
      this.selectTime = false;
    }
  }

  nextCalendar() {
    const oldDate = this.dateCalendar;
    const dateCalendar = moment(this.dateCalendar).add(1, 'days').format('YYYY-MM-DD');

    if (this.isGoFutureDate(oldDate, dateCalendar)) {
      this.confirmGoFutureDate(dateCalendar);
    } else {
      this.getTimeSettingMeeting();
      this.dateCalendar = dateCalendar;
      this.getInfoCalendar();
      $('#calendar1').fullCalendar('next');
      $('#calendar2').fullCalendar('next');
      this.selectTime = false;
    }
  }

  toDayCalendar() {
    this.confirmGoPassDate(this.currentDate);
  }

  tomorrowCalendar() {
    this.confirmGoFutureDate(this.tomorrow);
  }

  goToDateCalendar() {
    const oldDate = this.dateCalendar;
    this.datePicker.month -= 1;
    const dateCalendar = moment(this.datePicker).format('YYYY-MM-DD');

    if (this.isGoPassDate(oldDate, dateCalendar)) {
      if (this.modelInput === this.ModelInput.CHANG_TIME || this.modelInput === this.ModelInput.DOCUMENT) {
        this.dialogService.showError('MSG.ME.MEETING_REQUEST.NO_GO_PASS');
      } else {
        this.confirmGoPassDate(dateCalendar);
      }
    } else {
      if (this.isGoFutureDate(oldDate, dateCalendar)) {
        this.confirmGoFutureDate(dateCalendar);
      } else {
        this.getTimeSettingMeeting();
        this.dateCalendar = dateCalendar;
        this.getInfoCalendar();
        $('#calendar1').fullCalendar('gotoDate', dateCalendar);
        $('#calendar2').fullCalendar('gotoDate', dateCalendar);
        this.selectTime = false;
      }
    }
  }

  getInfoCalendar() {
    this.loadEventTimeSelectCalendar1 = false;
    this.loadEventTimeSelectCalendar2 = false;
    $('.fc-time-grid-event').hide();
    let start = moment(this.dateCalendar).format('YYYY-MM-DD');
    let end = moment(start).add(1, 'days').format('YYYY-MM-DD');
    start = moment(start).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
    end = moment(end).add(-1, 'milliseconds').format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');

    this.getListEventCalendar('calendar1', start, end);
    this.getListEventCalendar('calendar2', start, end);
  }

  getListEventCalendar(calendar, startDate, endDate) {
    let user, userRequest, receiver, mediator;
    if (calendar === 'calendar2') {
      user = 'receiver';
      userRequest = 'DR';
      mediator = 'MD';
      receiver = 'mr';
      this.listEventOfReceiver = [];
    } else {
      user = 'sender';
      userRequest = 'MR';
      mediator = '';
      receiver = 'dr';
      this.listEventOfSender = [];
    }
    this.meetingService.getListEventMR(startDate, endDate, this.senderRequest, this.receiverRequest, userRequest).subscribe(
      (res) => {
        this.updateListEventHoliday(res.listHolidayResponse.holidayList);
        const listEventCalendar = res.getPrEventCalendar.listEventCalendars;
        const listEventMeeting = res.getPrEventMeeting.eventMeetings;
        const events = this.meetingCommon.convertEventMeeting(listEventCalendar, listEventMeeting, user, userRequest, mediator, receiver, '');
        const date = moment(this.dateCalendar).format('YYYY-MM-DD');
        if (calendar === 'calendar2') {
          this.updateListEvent(events.listEventMeetingFixed, this.listEventMeetingFixedDoctor, date);
        } else {
          this.updateListEvent(events.listEventMeetingFixed, this.listEventMeetingFixedMR, date);
        }
        setTimeout(() => {
          this.getListTimeNoMeeting(calendar, events.arrEventUser);
        }, 1000);
      },
      (error) => {
        this.getListTimeNoMeeting(calendar);
      }
    );
  }

  updateListEventHoliday(listHoliday: any[]) {
    const year = moment(this.dateCalendar).format('YYYY');
    const timeZone = parseInt(moment(new Date()).format('Z'), 10);

    // convert time holiday
    for (let i = 0; i < listHoliday.length; i++) {
      const start = listHoliday[i].start.replace(' UTC', '');
      const end = listHoliday[i].end.replace(' UTC', '');
      const startDateJapan = moment(start).format('YYYY-MM-DDT' + '00:00');
      const endDateJapan = moment(startDateJapan).add(1, 'days').format('YYYY-MM-DDTHH:mm');

      listHoliday[i].start = moment(startDateJapan).add(timeZone - 9, 'hours').format('YYYY-MM-DDTHH:mm');
      listHoliday[i].end = moment(endDateJapan).add(timeZone - 9, 'hours').format('YYYY-MM-DDTHH:mm');
    }
    this.updateListEvent(listHoliday, this.listEventHoliday, year);
  }

  updateListEvent(listEvent: any[], listMeetingFix: any[], date: string) {
    if (listMeetingFix.length > 0) {
      let index = -1;
      for (let i = 0; i < listMeetingFix.length; i++) {
        if (listMeetingFix[i].date === date) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        listMeetingFix[index].listEvent = listEvent;
      } else {
        listMeetingFix.push({date: date, listEvent: listEvent});
      }
    } else {
      listMeetingFix.push({date: date, listEvent: listEvent});
    }
  }

  addEventMeeting(listTimeMeeting: any[], calendar: string, listEventOfUser?: any[]) {
    let listEvent = [];
    for (let i = 0 ; i < listTimeMeeting.length; i++) {
      const date = listTimeMeeting[i].dateStart;
      const startTime = listTimeMeeting[i].startTime;
      const endTime =  listTimeMeeting[i].endTime;

      const dateStart = date + 'T' + startTime;
      const dateEnd = date + 'T' + endTime;

      const event = {
        allDay: false,
        backgroundColor: '#ffffff',
        borderColor: '#F18D00',
        textColor: '#F18D00',
        start: dateStart,
        end: dateEnd,
        calendarType: 'createMeeting',
        'z-index': 100
      };
      listEvent.push(event);
    }

    if (listEventOfUser) {
      listEvent = listEvent.concat(listEventOfUser);
    }

    if (calendar) {
      if (calendar === 'calendar1') {
        this.listEventCalendar1 = this.listEventCalendar1.concat(listEvent);
      } else {
        this.listEventCalendar2 = this.listEventCalendar2.concat(listEvent);
      }
      $('#' + calendar).fullCalendar('refetchEvents');
    } else {
      if (this.loadEventTimeSelectCalendar1) {
        this.listEventCalendar1 = this.listEventCalendar1.concat(listEvent);
      }
      if (this.loadEventTimeSelectCalendar2) {
        this.listEventCalendar2 = this.listEventCalendar2.concat(listEvent);
      }
      $('#calendar1').fullCalendar('refetchEvents');
      $('#calendar2').fullCalendar('refetchEvents');
    }
    $('.fc-time-grid-event').show();
  }

  addTimeInFormMeeting(dateStart: string, dateEnd: string, temporaryTimeSelect?: boolean) {
    if (this.selectTime) {
      // if (this.me0029PageValidator.isTimeMeeting(dateStart, dateEnd, this.listEventNoMeeting)) {
        if (this.modelInput === this.ModelInput.DOCUMENT) {
          if (this.formCreateMeeting.date.length < this.maxMeetingAddPass) {
            if (temporaryTimeSelect) {
              this.addTemporaryTimeSelect(dateStart, dateEnd);
            } else {
              this.addTimeSelect(dateStart, dateEnd);
            }
          } else {
            this.dialogService.showError('MSG.ME.MEETING_REQUEST.MSG_SENT_DOCUMENT');
          }
        }

        if (this.modelInput === this.ModelInput.FUTURE || this.modelInput === this.ModelInput.CHANG_TIME) {
          if (!this.timeSelectIsExit(dateStart, dateEnd)) {
            if (this.formCreateMeeting.date.length < this.maxMeetingAddFuture) {
              if (temporaryTimeSelect) {
                this.addTemporaryTimeSelect(dateStart, dateEnd);
              } else {
                this.addTimeSelect(dateStart, dateEnd);
              }
            } else {
              this.dialogService.showError('MSG.ME.MEETING_REQUEST.MAX_SELECT_TIME');
            }
          }
        }

        if (this.modelInput === this.ModelInput.PASS) {
          if (this.formCreateMeeting.date.length < this.maxMeetingAddPass) {
            if (temporaryTimeSelect) {
              this.addTemporaryTimeSelect(dateStart, dateEnd);
            } else {
              this.addTimeSelect(dateStart, dateEnd);
            }
          } else {
            // remove select time old
            const listTime = this.formCreateMeeting.date;
            listTime.splice(0, 1);
            this.errorValidateForm.listDate.splice(0, 1);
            this.addAllTimeMeetingIntoCalendar();

            // add time new into form
            if (temporaryTimeSelect) {
              this.addTemporaryTimeSelect(dateStart, dateEnd);
            } else {
              this.addTimeSelect(dateStart, dateEnd);
            }
          }
        }
      // }
    } else {
      this.temporaryListTimeSelect.push({dateStart: dateStart, dateEnd: dateEnd});
    }
  }

  timeSelectIsExit(dateStart, dateEnd) {
    const listTime = this.formCreateMeeting.date;
    if (listTime.length > 0) {
      for (let i = 0; i < listTime.length; i++) {
        const start = moment(listTime[i].dateStart + 'T' + listTime[i].startTime).format();
        const end = moment(listTime[i].dateStart + 'T' + listTime[i].endTime).format();

        if (moment(dateStart).format('YYYYMMDDHHmm') === moment(start).format('YYYYMMDDHHmm') &&
          moment(dateEnd).format('YYYYMMDDHHmm') === moment(end).format('YYYYMMDDHHmm')) {
          return true;
        }
      }
    }
    return false;
  }

  addTimeSelect(dateStart: string, dateEnd: string) {
    const listTime = this.formCreateMeeting.date;
    const newTimeMeeting = this.me0029PageValidator.addTimeMeeting(dateStart, dateEnd, this.modelInput);

    const indexAdd = this.sortListTimeRequestMeeting(listTime, newTimeMeeting);
    listTime.splice(indexAdd, 0, newTimeMeeting);
    this.setAddTimeSelect(true);
    this.errorValidateForm.listDate.splice(indexAdd, 0, '');

    // if the time interval selected in the meeting can not, then do not show up calendar
    if (this.me0029PageValidator.isTimeMeeting(dateStart, dateEnd, this.listEventNoMeeting)) {
      this.addEventMeeting([newTimeMeeting], null);
    }
  }

  addTemporaryTimeSelect(dateStart: string, dateEnd: string) {
    if (this.me0029PageValidator.isTimeMeeting(dateStart, dateEnd, this.listEventNoMeeting)) {
      const listTime = this.formCreateMeeting.date;
      const newTimeMeeting = this.me0029PageValidator.addTimeMeeting(dateStart, dateEnd, this.modelInput);

      const indexAdd = this.sortListTimeRequestMeeting(listTime, newTimeMeeting);
      listTime.splice(indexAdd, 0, newTimeMeeting);
      this.setAddTimeSelect(true);
      this.errorValidateForm.listDate.splice(indexAdd, 0, '');
      // this.addEventMeeting([newTimeMeeting], null);
    }
  }

  setAddTimeSelect(value: boolean) {
    this.inputAddTimeSelect = value;
  }

  sortListTimeRequestMeeting(listTime: any[], newTimeMeeting: any) {
    let index = 0;
    for (let i = 0; i < listTime.length; i++) {
      const date = moment(listTime[i].dateStart + 'T' + listTime[i].startTime).format();
      const dateNew = moment(newTimeMeeting.dateStart + 'T' + newTimeMeeting.startTime).format();
      if (moment(dateNew).isBefore(date)) {
        index = i;
        break;
      } else {
        index = i + 1;
      }
    }
    return index;
  }

  removeAllTimeMeeting() {
    this.formCreateMeeting.date = [];
    this.errorValidateForm = {
      date: '',
      listDate: [],
      purposeId: '',
      productName: '',
      numberVisitors: '',
      place: '',
      note: ''
    };
  }

  isFutureDate() {
    if (moment(this.dateCalendar).format('YYYYMMDD') > moment(this.currentDate).format('YYYYMMDD')) {
      return true;
    }
    return false;
  }

  isGoPassDate(currentDate: string , goDate: string) {
    if (moment(currentDate).format('YYYYMMDD') >= moment(this.tomorrow).format('YYYYMMDD') &&
      moment(goDate).format('YYYYMMDD') < moment(this.tomorrow).format('YYYYMMDD')) {
      return true;
    }
    return false;
  }

  isGoFutureDate(currentDate: string, goDate: string) {
    if (moment(currentDate).format('YYYYMMDD') < moment(this.tomorrow).format('YYYYMMDD') &&
      moment(goDate).format('YYYYMMDD') >= moment(this.tomorrow).format('YYYYMMDD')) {
      return true;
    }
    return false;
  }

  confirmGoPassDate(dateCalendar: string) {
    this.dialogService.showMessage('warning', false, null, 'MSG.ME.M011', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          this.selectTime = false;
          this.restartFormCreateMeeting(dateCalendar, 'DOCTOR');
        } else {
          this.datePicker = this.calendarCommon.convertDatetime(this.dateCalendar).date;
        }
      }
    );
  }

  confirmGoFutureDate(dateCalendar: string) {
    this.dialogService.showMessage('warning', false, null, 'MSG.ME.M011_FUTURE', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          this.selectTime = false;
          this.restartFormCreateMeeting(dateCalendar, 'MR');
        } else {
          this.datePicker = this.calendarCommon.convertDatetime(this.dateCalendar).date;
        }
      }
    );
  }

  restartFormCreateMeeting(dateCalendar: any, request) {
    this.getTimeSettingMeeting();
    this.dateCalendar = dateCalendar;
    this.getInfoCalendar();
    $('#calendar1').fullCalendar('gotoDate', this.dateCalendar);
    $('#calendar2').fullCalendar('gotoDate', this.dateCalendar);

    this.formCreateMeeting = new CreateEventMeeting(request);
    this.getListGroupPurposes();
    this.removeAllTimeMeeting();
    this.listEventMeetingFixedDoctor = [];
    this.listEventMeetingFixedMR = [];
  }

  addAllTimeMeetingIntoCalendar() {
    // list time select in timeNoMeeting
    const listDate = this.formCreateMeeting.date;
    const listTimeSelectFilter = [];
    for (let i = 0; i < listDate.length; i++) {

      const dateStart = moment(listDate[i].dateStart + 'T' + listDate[i].startTime).format();
      const dateEnd = moment(listDate[i].dateStart + 'T' + listDate[i].endTime).format();

      if (this.me0029PageValidator.isTimeMeeting(dateStart, dateEnd, this.listEventViewNoMeeting)) {
        listTimeSelectFilter.push(listDate[i]);
      }
    }

    $('.fc-time-grid-event').hide();
    this.listEventCalendar1 = [];
    this.listEventCalendar2 = [];
    this.addEventMeeting(listTimeSelectFilter, 'calendar1', this.listEventOfSender);
    this.addEventMeeting(listTimeSelectFilter, 'calendar2', this.listEventOfReceiver);
  }

  changeTimeMeeting(form: any) {
    this.formCreateMeeting = form;
    this.addAllTimeMeetingIntoCalendar();
  }

  checkProductType() {
    if (this.groupPurposes) {
      for (let i = 0; i < this.groupPurposes.length; i++) {
        const purpose = this.groupPurposes[i].purposes.filter((item) => (item.purposeCode === this.formCreateMeeting.purposeId));
        if (purpose.length > 0) {
          this.formCreateMeeting.purposeName = purpose[0].purposeName;
          return this.groupPurposes[i].productType;
        }
      }
    }
    return '';
  }

  isPharmaceuticalCompany() {
    if (this.senderRequest.industryType === 'I0001') {
      return true;
    }
    return false;
  }

  setAcceptRequestMeetingDecides(value: boolean) {
    this.flagMeeting = value;
  }

  validateFormMeeting(form: any) {
    this.formCreateMeeting = form;
    let listEventMeetingFixed = [];
    listEventMeetingFixed = listEventMeetingFixed.concat(this.listEventMeetingFixedMR);
    listEventMeetingFixed = listEventMeetingFixed.concat(this.listEventMeetingFixedDoctor);

    // check doctor request meeting
    const checkNameProduct = (this.checkProductType() === 'PRODUCT') ? true : false;
    if (this.flagMeeting) {
      const validate = this.me0029PageValidator.checkValidateForm(this.formCreateMeeting, this.errorValidateForm, this.modelInput,
        this.msgME0029.VALIDATE, checkNameProduct);
      this.helper.gotoError();
      if (validate) {
        const error = this.me0029PageValidator.checkMatchTimeUserSetting(this.selfSetting.settingDayList, this.formCreateMeeting.date,
          this.msgME0029.VALIDATE, listEventMeetingFixed, this.listEventHoliday, this.settingHolidayMeeting, this.modelInput);
        if (error) {
          this.dialogService.showMessage('warning', false, null, error, null, 'MSG.OK', null);
        } else {
          if (this.modelInput === ModelInput.PASS || (this.modelInput === ModelInput.DOCUMENT && !this.isFutureDate())) {
            this.getInfoUserRequest();
            this.putMeeting();
          } else {
            this.confirmCreateMeeting = true;
            this.helper.setScrollTop();
            this.convertStringNameProduct();
            this.getInfoUserRequest();
          }
        }
      }
    } else {
      this.dialogService.showError('MSG.ME.E007');
    }
  }

  putMeeting() {
    const dataOutput = this.me0029PageValidator.dataOutPut(this.formCreateMeeting, this.modelInput, this.originalRequest);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putMeetingMR(dataOutput).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });

        const msg = (this.modelInput === ModelInput.PASS || (this.modelInput === ModelInput.DOCUMENT && !this.isFutureDate())) ?
          'MSG.SAVED' : null;
        let html = '<p>' + this.msgME0029.CONFIRM_PUT_MEETING.MSG_1 + '</p>'
          + '<p>' + this.msgME0029.CONFIRM_PUT_MEETING.MSG_2 + '</p>';
        html = (this.modelInput === ModelInput.PASS  || (this.modelInput === ModelInput.DOCUMENT && !this.isFutureDate())) ? null : html;

        this.dialogService.showMessage('success', false, null, msg, html, 'MSG.OK', null).subscribe(
          (dialogResult: DialogResult) => {
            if (dialogResult.isOk()) {
              this.router.navigate(['/me/me0030']);
            }
          }
        );
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  changeConfirmCreateMeeting() {
    this.helper.setScrollTop();
    this.confirmCreateMeeting = false;
  }

  getInfoUserRequest() {
    this.formCreateMeeting.userIdSent = this.senderRequest.userId;
    this.formCreateMeeting.officeIdSent = this.senderRequest.officeId;

    this.formCreateMeeting.userIdReceive = this.receiverRequest.userId;
    this.formCreateMeeting.officeIdReceive = this.receiverRequest.officeId;

    if (this.formCreateMeeting.userIdSent !== this.userSession.userId) {
      this.formCreateMeeting.userIdMediator = this.userSession.userId;
      this.formCreateMeeting.officeIdMediator = this.userSession.officeId;
    } else {
      this.formCreateMeeting.userIdMediator = '';
      this.formCreateMeeting.officeIdMediator = '';
    }
  }

  convertStringNameProduct() {
    let name = '';
    let html = '';

    if (this.modelInput === this.ModelInput.CHANG_TIME) {
      // change time meeting
      if (this.originalRequest.productName) {
        name = this.originalRequest.productName;
        html = '<span>' + this.originalRequest.productName + '</span>';
      } else {
        for (let i = 0; i < this.originalRequest.drugList.length; i++) {
          if (i !== 0) {
            name += ', ' + this.originalRequest.drugList[i].name;
            html += '<br><span>' + this.originalRequest.drugList[i].name + '</span>';
          } else {
            name += this.originalRequest.drugList[i].name;
            html += '<span>' + this.originalRequest.drugList[i].name + '</span>';
          }
        }
      }
    } else {
      // create meeting
      if ( (this.checkProductType() === 'DRUG') && this.isPharmaceuticalCompany()) {
        if (this.formCreateMeeting.drugList) {
          const selectedDrug = this.formCreateMeeting.drugList;
          for (let i = 0; i < selectedDrug.length; i++) {
            if (i !== 0) {
              name += ', ' + selectedDrug[i].name;
              html += '<br><span>' + selectedDrug[i].name + '</span>';
            } else {
              name += selectedDrug[i].name;
              html += '<span>' + selectedDrug[i].name + '</span>';
            }
          }
        }
      }

      if ((this.checkProductType() === 'PRODUCT') && !this.isPharmaceuticalCompany()) {
        html = (this.formCreateMeeting.productName) ? '<span>' + this.formCreateMeeting.productName + '</span>' : '';
        name = this.formCreateMeeting.productName;
      }
    }

    this.stringNameProduct = name;
    this.htmlNameProduct = html;
  }

  showPopupEvent(event: any, jsEvent) {
    let time = '';
    switch (event.calendarType) {
      case 'createMeeting':
        time = moment(event.start).format('MM月DD日') + ' ' + moment(event.start).format('HH時mm分') + '〜' + moment(event.end).format('HH時mm分');
        this.showDetailEvent(event, '面会申し込み', time, null, jsEvent);
        break;
      case 'noMeeting':
        break;
      case this.calendarCommon.calendarType.MY :
        if (event.show) {
          if (event.allDay) {
            time = moment(event.start).format('MM月DD日');
            if (moment(event.start).add(1, 'days').format('YYYYMMDD') !== moment(event.end).format('YYYYMMDD')) {
              time += '〜' + moment(event.end).add(-1, 'days').format('MM月DD日');
            }
          } else {
            if (moment(event.startEvent).format('YYYYMMDD') !== moment(event.endEvent).format('YYYYMMDD')) {
              time = moment(event.startEvent).format('MM月DD日') + moment(event.startEvent).format('HH:mm') + '〜'
                + moment(event.endEvent).format('MM月DD日') + moment(event.endEvent).format('HH:mm');
            } else {
              time = moment(event.startEvent).format('MM月DD日') + ' ' + moment(event.startEvent).format('HH:mm') + '〜' + moment(event.endEvent).format('HH:mm');
            }
          }
          this.showDetailEvent(event, event.titlePopup, time, event.place, jsEvent);
        }
        break;
      default:
        if (event.show) {
          if (moment(event.start).format('YYYYMMDD') !== moment(event.end).format('YYYYMMDD')) {
            time = moment(event.start).format('MM月DD日') + moment(event.start).format('HH:mm') + '〜'
              + moment(event.end).format('MM月DD日') + moment(event.end).format('HH:mm');
          } else {
            time = moment(event.start).format('MM月DD日') + ' ' + moment(event.start).format('HH:mm') + '〜' + moment(event.end).format('HH:mm');
          }
          this.showDetailEvent(event, event.titlePopup, time, event.place, jsEvent);
        }
        break;
    }
  }

  showDetailEvent(event: any, title: string, time: string, place: string, jsEvent) {
    if (!this.showPopover) {
      this.show_popover_detail_event();
      const target = $(jsEvent.target);
      let topPopup = target.offset().top + target.height();
      let leftPopup = target.offset().left + target.width() / 2;

      this.popup['title'] = title;
      this.popup['time'] = time;
      this.popup['place'] = place;
      this.popup['showTime'] = (event.calendarType === 'createMeeting') ? false : true;

      setTimeout(() => {
        const heightPopup = $('.contentPopupHover').height();
        const widthPopup = $('.contentPopupHover').width();
        // set top of popupCreateEvent
        if ((heightPopup + topPopup + 10) < $(window).height()) {
          this.showTop = true;
          topPopup = topPopup;

        } else {
          this.showTop = false;
          topPopup = topPopup - heightPopup - 5 - target.height();
        }
        leftPopup -= widthPopup / 2;

        $('#popupHover').css({
          top: topPopup,
          left: leftPopup,
          position: 'absolute',
          'z-index': 1001
        });
      });
    }
  }

  hide_popover_detail_event() {
    this.showPopover = false;
    $('#popupHover').hide();
  }

  show_popover_detail_event() {
    this.showPopover = true;
    $('#popupHover').show();
  }

  backMainScreen(event) {
    this.changeConfirmCreateMeeting();
  }

  getUserComment(comment: any) {
    let user = '';
    switch (comment.userType) {
      case 'DR':
        user = 'DR';
        break;
      case 'MR':
        user = 'MY';
        break;
      case 'MD':
        user = 'MEDIATOR';
        break;
    }
    return user;
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if (this.confirmCreateMeeting) {
  //       this.putMeeting();
  //     }
  //   }
  // }
}
