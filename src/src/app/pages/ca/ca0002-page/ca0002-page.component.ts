import {Component, OnDestroy, OnInit} from '@angular/core';
import { CalendarService } from '../../../services/calendar.service';
import { EventDetailsSettings } from '../../../models/ca/event-details-settings';
import { CalendarCommon } from '../../../common/calendar-common';
import { PopupHoverResult } from '../../../models/popup-hover';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {Helper} from '../../../common/helper';
import {FormGroup} from '@angular/forms';
import {EventCreateSettingValidator} from '../../../models/ca/event-create-setting-validator';
import {EventCreateSettings} from '../../../models/ca/event-create-settings';
import {EventCreateSettingsSaveResult} from '../../../models/ca/event-create-settings-save-result';
import {Ca0002PageValidator} from './ca0002-page.validator';
import {EventDeleteSettings} from '../../../models/ca/event-delete-setting';
import {LocalStorage} from '../../../services/local-storage.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {HttpError} from '../../../common/error/http.error';
import { FrameMeetingCreateSettingValidator } from 'app/models/ca/frame-meeting-create-setting-validator';
import {UserSession} from '../../../models/ba/user-session';
import {VisitEntrySettings} from '../../../models/me/visit-entry-settings';
import {MeetingService} from '../../../services/meeting.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {Title} from '@angular/platform-browser';
declare var moment: any;
import 'fullcalendar';

@Component({
  selector: 'app-ca0002-page',
  templateUrl: './ca0002-page.component.html',
  styleUrls: ['./ca0002-page.component.scss'],
  providers: [Ca0002PageValidator],
  preserveWhitespaces: false
})

export class Ca0002PageComponent  implements OnInit {
  public currentDate: string;
  public startDate: any;
  public endDate: any;
  public defaultView: any;
  public weekStart: any;
  public lang: string;
  public showBottom = true;
  public showLeft = false;
  public showRight = false;

  public msgCA0001: any;
  public listEvent = [];
  public dateStartPicker: string;
  public dateEndPicker: string;

  createEventForm: FormGroup;
  formModel = new EventCreateSettingValidator();
  validationError = {
    'title': false,
    'place': false,
    'startDay': false,
    'startTime': false,
    'groupInside': false,
    'groupOutside': false
  };
  formErrorMessage = {
    'title': '',
    'place': '',
    'startDay': '',
    'startTime': '',
    'groupInside': '',
    'groupOutside': '',
  };
  public model = new EventCreateSettings();
  listStaff = [];
  options = [
    {'value': 'VISIBLE', 'key': 'HOSPITAL_VALUE_1'},
    {'value': 'INVISIBLE', 'key': 'HOSPITAL_VALUE_2'}
  ];
  frameType = [
    {value: 'SPOT', key: 'ONE_FRAME'},
    {value: 'SLOTS', key: 'MULTI_FRAME'}
  ];
  slots = [5, 10, 15, 30];
  valueShare = {'user': 'MY', 'insideHospital': 'INSIDE_GROUP', 'outsideHospital': 'OUTSIDE_GROUP'};
  checkAllDay = false;
  timePicker = [];
  showPopupCreateEvent = false;
  listGroup = [];
  listGroupInside = [];
  listGroupOutside = [];
  createFrameMeetingForm: FormGroup;
  formModelFrame = new FrameMeetingCreateSettingValidator();
  userSession: UserSession;
  isMediator: boolean;
  listMediator = [];
  dateFrame: any = {};
  formErrorMessageFrame: any = {};
  showPublishType = true;

  public numberTapActive = 1;
  public checkErrorValidateForm = true;
  public authorityMeeting: boolean;
  public goToDateCalendar: string;
  public positionEventCalendar: any;

  constructor(private calendarService: CalendarService, private dialogService: DialogService, private calendarCommon: CalendarCommon,
              private translate: TranslateService, private router: Router, private localStorage: LocalStorage,
              private ca0002PageValidator: Ca0002PageValidator,
              private sharedValueService: SharedValueService,
              private helper: Helper,
              private titleService: Title,
              private meetingService: MeetingService) {
    this.lang = this.translate.getDefaultLang();
    this.userSession = this.sharedValueService.getUserSession();
  }

  ngOnInit() {
    const ca0007Model = this.localStorage.getObject('goToDateCalendarDr');
    this.localStorage.remove('goToDateCalendarDr');
    if (ca0007Model) {
      this.goToDateCalendar = moment(ca0007Model.date).format('YYYY-MM-DD');
      this.defaultView = ca0007Model.defaultView;
    }
    this.calendarCommon.genTimePicker(this.timePicker);
    this.getListStaff();
    this.listGroup = this.ca0002PageValidator.getListGroup();
    this.listGroupInside = this.listGroup[0];
    this.listGroupOutside = this.listGroup[1];
    this.createEventForm = this.ca0002PageValidator.createForm(this.formModel);
    this.createFrameMeetingForm = this.ca0002PageValidator.createFormFrameMeeting(this.formModelFrame);
    this.initFrameMeeting();
    this.translate.get('CA0001.LABEL').subscribe(
      (res) => {
        this.msgCA0001 = res;
        const date = new Date();
        this.currentDate = moment(date).format('YYYY-MM-DD');

        // setting date
        if (!this.goToDateCalendar) {
          this.goToDateCalendar = this.currentDate;
        }

        // setting view calendar
        const viewCalendar = this.localStorage.getObject('viewCalendar');
        if (viewCalendar) {
          if (!this.defaultView) {
            this.defaultView = (viewCalendar.defaultView === CalendarCommon.VIEW_MONTH) ? 'month' : 'agendaWeek';
          }
          this.weekStart = viewCalendar.weekStart;
        } else {
          if (!this.defaultView) {
            this.defaultView = 'month';
          }
          this.weekStart = CalendarCommon.VIEW_SUNDAY;
        }
        setTimeout( () => {
          this.createCalendar();
          this.getInitCreateFrameMeeting();
        });
      }
    );
  }

  createCalendar() {
    const self = this;
    $('#calendar').fullCalendar({
      defaultView: self.defaultView,
      firstDay: self.weekStart,
      locale: self.lang,
      customButtons: {
        myCustomButton: {
          text: self.msgCA0001.TODAY,
          click: function() {
            $('#calendar').fullCalendar('today');
          }
        },
        rightCustomButton: {
          text: self.msgCA0001.BTN_EXTERNAL,
          click: function() {
            self.router.navigate(['ca/ca0010']);
          },
        },
        settingCustomButton: {
          text: '',
          click: function() {
            self.router.navigate(['ca/ca0006']);
          },
          icon: 'fa setting-icon',
        },
        printCustomButton: {
          text: '',
          click: function() {
            const css = '@page { layout: portrait; size: A4; margin: 10mm 4mm 10mm 4mm}, @media print {html, body {width: 210mm;height: 297mm;}}';
            const head = document.head || document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            style.type = 'text/css';
            style.media = 'print';

            style.appendChild(document.createTextNode(css));
            head.appendChild(style);

            window.print();
            return false;
          },
          icon: 'fa print-icon',
        },
        prevCustomButton: {
          text: '',
          click: function() {
            $('#calendar').fullCalendar('prev');
          },
          icon: 'fc-icon-left-single-arrow'
        },
        nextCustomButton: {
          text: '',
          click: function() {
            $('#calendar').fullCalendar('next');
          },
          icon: 'fc-icon-right-single-arrow'
        },
        monthCustomButton: {
          text: self.msgCA0001.MONTH,
          click: function() {
            self.changeView('month');
            $('.fc-weekCustomButton-button').removeClass('fc-active-calendar');
            $('.fc-monthCustomButton-button').addClass('fc-active-calendar');
          },
        },
        weekCustomButton: {
          text: self.msgCA0001.WEEK,
          click: function() {
            self.changeView('agendaWeek');
            $('.fc-monthCustomButton-button').removeClass('fc-active-calendar');
            $('.fc-weekCustomButton-button').addClass('fc-active-calendar');
          },
        }
      },
      eventOrder: ['isMultipleDay', 'order', 'title'],
      header: {
        // left: 'myCustomButton prev,next month,agendaWeek',
        left: 'myCustomButton prevCustomButton,nextCustomButton monthCustomButton,weekCustomButton',
        center: 'title',
        right: 'rightCustomButton settingCustomButton printCustomButton'
      },
      slotLabelFormat: 'HH:mm',
      nextDayThreshold:  moment.duration('00:00:00'),
      defaultDate: self.goToDateCalendar,
      selectable: true,
      selectHelper: true,
      editable: false,
      droppable: false,
      eventLimit: true,
      views: {
        agendaWeek: {
          columnFormat: 'M/D（ddd）',
          timeFormat: 'H:mm'
        }
      },
      eventRender: function(event, element, view) {
        const calendarType = self.calendarCommon.calendarType;
        if (self.defaultView === 'agendaWeek') {
          element.find('.fc-bg').css('opacity', 0);
          if (event.calendarType === calendarType.MEETING_ACCEPTING || event.calendarType === calendarType.MEETING_DECIDED ||
            event.calendarType === calendarType.MEETING_REQUEST_MEDIATOR ||
            event.calendarType === calendarType.VISIT || event.calendarType === calendarType.SOCIETY ||
            event.calendarType === calendarType.MEETING_MEDIATOR || event.calendarType === calendarType.BRIEFING ||
            event.calendarType === calendarType.HOLIDAY || event.calendarType === calendarType.EXTERNAL) {
            $(element).find('.fc-time').remove();
          } else {
            if (!event.allDay && event.calendarType) {
              const time = moment(event.startEvent).format('H:mm') + ' - ' + moment(event.endEvent).format('H:mm');
              $(element).find('.fc-time span').html(time);
            }
          }
        } else {
          $(element).find('.fc-time').remove();
        }
      },
      unselectAuto: false,
      dayClick: function(date, jsEvent, view) {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (iOS && jsEvent && jsEvent.target) {
          const start = moment(date).format('YYYY-MM-DDTHH:mm');
          let end = moment(date).add(1, 'days').format('YYYY-MM-DDTHH:mm');

          const element = jsEvent.target;
          if (self.defaultView === 'agendaWeek') {
            if ($(element).parents('.fc-day-grid').length === 0) {
              end = moment(date).add(0.5, 'hours').format('YYYY-MM-DDTHH:mm');
            }
          }
          setTimeout(() => {
            self.popupCreateEvent(start, end, 1, false);
          }, 500);
        }
      },
      select: function(start, end, resources) {
        // if (self.defaultView === 'agendaWeek') {
          const timeStartCreateEvent = moment(start).format('YYYY-MM-DDTHH:mm:ss');
          const timeEndCreateEvent = moment(end).format('YYYY-MM-DDTHH:mm:ss');

          setTimeout(() => {
            if (resources) {
              self.popupCreateEvent(timeStartCreateEvent, timeEndCreateEvent, 1, false);
            }
          });
        // }
      },
      eventSources: [
        {
          events(start, end, timezone, callback) {
            callback(self.listEvent);
          }
        }
      ],
      viewRender: function (view, element) {
        const start = moment(view.start).format('YYYY-MM-DD');
        const end = moment(view.end).format('YYYY-MM-DD');

        self.startDate = moment(start).format('YYYY-MM-DDTHH:mm:ssZZ');
        self.endDate = moment(end).add(-1, 'milliseconds').format('YYYY-MM-DDTHH:mm:ssZZ');

        self.getListEventCalendar();
        if (view.name === 'agendaWeek' && self.lang === Helper.lang.JAPAN) {
          self.setTitleViewWeek(view);
        } else {
          if (view.name === 'month' && self.lang === Helper.lang.JAPAN) {
            let viewTitleWeek = $('#calendar').find('.fc-toolbar > div > h2').text();
            viewTitleWeek = viewTitleWeek.replace(' ', '');
            $('#calendar').find('.fc-toolbar > div > h2').html(viewTitleWeek);
          }
        }
      },
      eventClick: function (calEvent, jsEvent, view) {
        setTimeout(() => {
          self.getDetailEvent(calEvent, jsEvent);
        });
      },
    });

    $(window).resize(() => {
      $('#calendar').fullCalendar('option', 'height', self.get_calendar_height());
    });

    $('#calendar').fullCalendar('option', 'height', self.get_calendar_height());
    if (this.defaultView === 'month') {
      this.setTitle('DOC_TITLE.CA0002');
      $('.fc-monthCustomButton-button').addClass('fc-active-calendar');
    } else {
      this.setTitle('DOC_TITLE.CA0003');
      $('.fc-weekCustomButton-button').addClass('fc-active-calendar');
    }
  }

  setTitle(id: string) {
    this.translate.get(id).subscribe(
      (res) => {
        this.titleService.setTitle(res);
      }
    );
  }

  /**
   * get data from me0018 -> ca0002: create frame meeting
   */
  getInitCreateFrameMeeting() {
    const data = this.localStorage.getObject('createFrameMeting');
    this.localStorage.remove('createFrameMeting');
    if (data && this.authorityMeeting) {
      $('#calendar').fullCalendar('gotoDate', data.date);
      setTimeout(() => {
        this.popupCreateEvent(data.start, data.end, 2, true);
        if (this.defaultView === 'month') {
          // set background in date select => form me0018 to calendar, create frame meeting
          $( '.fc-future[data-date = ' + data.date + ']' ).addClass('fc-highlight-calendar');
        }
      });
    }
  }

  getPositionPopupCreateEvent(date, dateEnd, number: number, scroll: boolean, numberEnd?: number) {
    let top, left;
    if (this.defaultView === 'month') {
      const element = $( '.fc-widget-content[data-date = ' + date + ']' );
      if (element) {
        top = element.offset().top;
        top += element.height() / 2 + 10;
        left = element.offset().left;
        left += element.width() / 2;
      }
    } else {
      let element, elementEnd;

      if (number === 0) {
        // allDay
        element = $( '.fc-week');
      } else {
        element = $( '.fc-slats tr:nth-child(' + number + ')');
      }
      top = element.offset().top;
      // scroll calendar go timeSelect
      if (scroll) {
        $('.fc-time-grid-container').scrollTop(top);
      }

      // get position element
      top = element.offset().top;
      top += element.height() / 2;
      left = $( 'th[data-date = ' + date + ']' ).offset().left;
      left += element.find('.fc-axis').width() / 2;

      const minTop = $('.fc-time-grid-container').offset().top;
      const maxTop = minTop + $('.fc-time-grid-container').height();

      if (!scroll && numberEnd && (top >= maxTop || top < minTop)) {
        if (numberEnd === 0) {
          // allDay
          elementEnd = $( '.fc-week');
        } else {
          elementEnd = $( '.fc-slats tr:nth-child(' + numberEnd + ')');
        }
        top = elementEnd.offset().top - 5;
        left = $( 'th[data-date = ' + dateEnd + ']' ).offset().left;
        left += element.find('.fc-axis').width() / 2;
      }
    }
    return {
      top: top,
      left: left
    };
  }

  get_calendar_height() {
    return $(window).height() - 100;
  }

  changeView(defaultView: string) {
    if (defaultView) {
      $('#calendar').fullCalendar('changeView', defaultView);
      this.defaultView = defaultView;
      if (this.defaultView === 'month') {
        this.setTitle('DOC_TITLE.CA0002');
      } else {
        this.setTitle('DOC_TITLE.CA0003');
      }
    }
  }

  setTitleViewWeek(view) {
    const yearStart = moment(view.start).format('YYYY');
    const yearEnd = moment(view.end).clone().add(-1, 'days').format('YYYY');
    let viewTitleWeek = '';
    if (yearStart === yearEnd) {
      viewTitleWeek = moment(view.start).format('YYYY年M月D日') + '—' + moment(view.end).clone().add(-1, 'days').format('M月D日');
    } else {
      viewTitleWeek = moment(view.start).format('YYYY年M月D日') + '—' + moment(view.end).clone().add(-1, 'days').format('YYYY年M月D日');
    }

    $('#calendar').find('.fc-toolbar > div > h2').html(viewTitleWeek);
  }

  getListEventCalendar() {
    this.calendarService.getMonthlySettings(this.startDate, this.endDate).subscribe(
      (listEvent) => {
        this.listEvent = this.calendarCommon.convertEvent(listEvent.items, this.defaultView);
        $('#calendar').fullCalendar('refetchEvents');
        // $('#calendar').fullCalendar('removeEvents');
        // $('#calendar').fullCalendar('addEventSource', this.listEvent);
        // return this.listEvent;
      }
    );
  }

  getDetailEvent(event, jsEvent) {
    switch (event.calendarType) {
      case this.calendarCommon.calendarType.MEETING_DECIDED:
        this.detailEventMeeting(event);
        break;
      case this.calendarCommon.calendarType.MEETING_REQUEST_MEDIATOR:
        this.detailEventMeeting(event);
        break;
      case this.calendarCommon.calendarType.MEETING_ACCEPTING:
        this.detailEventMeeting(event);
        break;
      case this.calendarCommon.calendarType.MEETING_MEDIATOR:
        this.detailEventMeeting(event);
        break;
      default:
        this.hidePopupCreateEvent();
        this.calendarService.getEventDetailsSettings(event.id).subscribe(
          (res: EventDetailsSettings) => {
            this.showPopupEvent(res, jsEvent, event);
          },
          (error: HttpError) => {
            if (error.contains('CA0001.E000_1')) {
              this.dialogService.showError('MSG.CA0001.E000_1');
            } else {
              this.dialogService.showError('MSG.CA0001.E000_2');
            }
          }
        );
        break;
    }
  }

  showPopupEvent(event: any, jsEvent, eventRoot: any) {
    const title = eventRoot.titleRoot;
    let user = null;
    const time = this.calendarCommon.getTimeEvent(event);
    if (event.modifiedUserId.userId) {
      user = this.msgCA0001.USER_UPDATE + event.modifiedUserId.lastName + event.modifiedUserId.firstName;
    } else {
      if (event.createdUserId.userId) {
        user = this.msgCA0001.USER_CREATE + event.createdUserId.lastName + event.createdUserId.firstName;
      }
    }
    switch (event.calendarType) {
      case this.calendarCommon.calendarType.HOLIDAY:
        this.holidayPopupHoverDialog(event.title, time, jsEvent);
        break;
      case this.calendarCommon.calendarType.STAFF:
        if (event.status === this.calendarCommon.shareStatus.SCHEDULE_ONLY) {
          this.holidayPopupHoverDialog(title, time, jsEvent);
        }
        if (event.status === this.calendarCommon.shareStatus.READ_ONLY) {
          this.popupHoverDialog(event, title, time, user, event.note, event.place, jsEvent, false, eventRoot.visitId);
        }
        if (event.status === this.calendarCommon.shareStatus.EDITABLE) {
          this.popupHoverDialog(event, title, time, user, event.note, event.place, jsEvent, true, eventRoot.visitId);
        }
        break;
      default:
        this.popupHoverDialog(event, event.title, time, user, event.note, event.place, jsEvent, true, eventRoot.visitId);
        break;
    }
  }

  detailEventMeeting(event) {
    const typeCalendar = (event.calendarType === this.calendarCommon.calendarType.MEETING_DECIDED ||
      event.calendarType === this.calendarCommon.calendarType.MEETING_REQUEST_MEDIATOR) ? 0 : 1;
    if (event.meetingId) {
      this.router.navigate(['me/me0007', typeCalendar, event.meetingId]);
    }
  }

  holidayPopupHoverDialog(title: string, time: string, jsEvent) {
    this.dialogService.showHolidayPopupHoverDialog(title, time, jsEvent, this.defaultView).subscribe(
      (res: PopupHoverResult) => {
        // console.log(res);
      }
    );
  }

  popupHoverDialog(event: any, title: string, time: string, user: string, note: string, place: string, jsEvent, bntShow: boolean,
                   visitId: string) {
    this.dialogService.showEditPopupHoverDialog(title, time, user, note, place, jsEvent, bntShow, this.defaultView).subscribe(
      (res: PopupHoverResult) => {
        if (res.isEdit()) {
          setTimeout(() => {
            if (event.calendarType !== this.calendarCommon.calendarType.VISIT) {
              this.localStorage.setObject('ca0004', {'defaultView': this.defaultView, 'startDateCalendar': this.startDate,
                'endDateCalendar': this.endDate});
              this.router.navigate(['ca/ca0007/' + event.id]);
            } else {
              this.router.navigate(['me/me0003', visitId]);
            }
          });
        }

        if (res.isDelete()) {
          this.confirmRemoveEvent(event, visitId);
        }
      }
    );
  }

  confirmRemoveEvent(event: any, visitId: string) {
    const object = {
      'check': false,
      'confirmText' : this.msgCA0001.DELETE_CONFIRM_4,
      'isConfirm': false,
      'disablePositive': false
    };

    if (event.repeatRule) {
      const html = '<p>' + this.msgCA0001.DELETE_CONFIRM_1 + '</p>'
        + '<p>' + this.msgCA0001.DELETE_CONFIRM_2 + '</p>'
        + '<p>' + this.msgCA0001.DELETE_CONFIRM_3 + '</p>';

      this.dialogService.showCheckboxDialog(null, false, null, null, html, 'MSG.OK', 'MSG.CANCEL', object, null, 'modal-lg').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            const recursiveOption = res.payload.isChecked ? 1 : 0;
            const eventDeleteSettings = new EventDeleteSettings(event.id, recursiveOption);
            setTimeout(() => {
              this.deleteEventDetailsSettings(eventDeleteSettings);
            }, 1000);
          }
        }
      );
    } else {

      const message = '「' + event.title + '」' + this.msgCA0001.DELETE_CONFIRM;
      this.dialogService.showMessage('warning', false, null, message, null, 'MSG.YES', 'MSG.NO').subscribe(
        (res) => {
          if (res.isOk()) {
            const eventDeleteSettings = new EventDeleteSettings(event.id, 0);
            setTimeout(() => {
              if (event.calendarType === this.calendarCommon.calendarType.VISIT) {
                // call service meeting remove event visit
                if (visitId) {
                  this.deleteEventVisit(visitId);
                }
              } else {
                this.deleteEventDetailsSettings(eventDeleteSettings);
              }
            }, 1000);
          }
        }
      );
    }
  }

  deleteEventVisit(visitId: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.deleteVisit(visitId).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.getListEventCalendar();
        this.dialogService.showSuccess('MSG.DELETED');

      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  deleteEventDetailsSettings(eventDeleteSettings: EventDeleteSettings) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.calendarService.deleteEventDetailsSettings(eventDeleteSettings).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.getListEventCalendar();
        this.dialogService.showSuccess('MSG.DELETED');

      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (error.contains('CA0001.E001_1')) {
          this.dialogService.showError('MSG' + error.error_codes[0]);
        } else {
          this.dialogService.showError('MSG.CA0001.E001_2');
        }
      }
    );
  }

  getListStaff() {
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
    this.translate.get('CA004').subscribe((response) => {
      this.listStaff.splice(0, 0, {
        'userId': '',
        'firstName': response.SHARE_USER.VALUE_DEFAULT,
        'lastName': ''
      });
    });
  }

  startDateChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.createEventForm.controls.startDay.setValue(date);
    this.dateStartPicker = date;
  }

  endDateChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.createEventForm.controls.endDay.setValue(date);
    this.dateEndPicker = date;
  }

  popupCreateEvent(timeStartCreateEvent: string, timeEndCreateEvent: string, numberTap: number, scroll: boolean) {
    this.show_popup_create_event(numberTap);
    this.formModel = new EventCreateSettingValidator();
    const formCreateEvent = this.ca0002PageValidator.setValueForm(timeStartCreateEvent, timeEndCreateEvent, this.defaultView);
    const formCreateFrameMeeting = this.ca0002PageValidator.setValueFrameMeeting(formCreateEvent.start);
    this.createEventForm = formCreateEvent.form;
    this.createFrameMeetingForm = formCreateFrameMeeting.form;
    this.checkAllDay = formCreateEvent.checkAllDay;
    const data = this.createEventForm.value;
    this.dateStartPicker = data.startDay;
    this.dateEndPicker = data.endDay;
    this.dateFrame = {
      'startDay':  this.createFrameMeetingForm.value.startDay,
      'startTime':  this.createFrameMeetingForm.value.startTime,
      'endTime':  this.createFrameMeetingForm.value.endTime,
    };
    this.validationError = {
      'title': false,
      'place': false,
      'startDay': false,
      'startTime': false,
      'groupInside': false,
      'groupOutside': false
    };
    this.formErrorMessageFrame = {};
    if (formCreateEvent.selectLabel) {
      this.setTimeCalendarSelect();
    }
    setTimeout(() => {
        let numberStart, numberEnd;
        const date = data.startDay + 'T' + data.startTime;
        const dateStart = moment(date).format('YYYY-MM-DD');
        const dateEnd = moment(data.endDay + 'T' + data.endTime).format('YYYY-MM-DD');
        if (this.checkAllDay) {
          numberStart = 0;
        } else {
          const count = (moment(date).format('mm') >= '30') ? 1 : 0;
          numberStart = (parseInt(moment(date).format('H'), 10)) * 2  + 1 + count;
          numberEnd = (parseInt(moment(data.startDay + 'T' + data.endTime).format('H'), 10)) * 2  + 1;
        }

        this.positionEventCalendar = this.getPositionPopupCreateEvent(dateStart, dateEnd, numberStart, scroll, numberEnd);
        this.positionPopupCreateEvent(this.positionEventCalendar.left, this.positionEventCalendar.top);
    });
  }

  setTimeCalendarSelect() {
    if (this.numberTapActive === 1) {
      const start = this.createEventForm.value.startDay + 'T' + this.createEventForm.value.startTime;
      const end = this.createEventForm.value.endDay + 'T' + this.createEventForm.value.endTime;
      $('#calendar').fullCalendar('select', start, end, true);
    }
    if (this.numberTapActive === 2) {
      const start = this.createFrameMeetingForm.value.start;
      const end = this.createFrameMeetingForm.value.end;
      $('#calendar').fullCalendar('select', start, end, false);
    }
  }

  positionPopupCreateEvent(left: number, top: number) {
    this.displayOption(this.valueShare.user);
    const maxWidth = $(window).width();
    const heightPopup = $('#popupCreateEvent').height();
    const widthPopup = $('#popupCreateEvent').width();

    let leftPopup: number;
    let topPopup: number;

    // set top of popupCreateEvent
    if ((top - heightPopup - 60) > 0) {
      this.showBottom = false;
      topPopup = top - heightPopup - 5;
    } else {
      this.showBottom = true;
      topPopup = top;
    }

    const limitLeft = $('#calendar').offset().left;
    if ((left - widthPopup / 2) < limitLeft) {
      this.showLeft = true;
      this.showRight = false;
      leftPopup = left - widthPopup / 20;
    } else {
      if ((left + widthPopup / 2) < maxWidth) {
        leftPopup = left - widthPopup / 2;
        this.showLeft = false;
        this.showRight = false;
      } else {
        this.showLeft = false;
        this.showRight = true;
        leftPopup = left - widthPopup * 95 / 100;
      }
    }

    $('#popupCreateEvent').css({
      'position': 'absolute',
      'z-index': 1000,
      'left': leftPopup,
      'top': topPopup,
    });
  }

  clickOutsidePopupCreateEvent(event: any) {
    if (!$(event.target).hasClass('btn-light') && this.checkErrorValidateForm) {
      this.hidePopupCreateEvent();
    }
    // remove background: me0018 -> calendar create frame meeting
    $('td.fc-highlight-calendar').removeClass('fc-highlight-calendar');
  }

  hidePopupCreateEvent() {
    $('td.fc-highlight-calendar').removeClass('fc-highlight-calendar');
    $('#calendar').fullCalendar('unselect');
    this.showPopupCreateEvent = false;
    $('#popupCreateEvent').hide();
  }

  setNumberTapPopup(i: number) {
    this.numberTapActive = i;

    if (!this.showBottom) {
      setTimeout(() => {
        this.positionPopupCreateEvent(this.positionEventCalendar.left, this.positionEventCalendar.top);
      });
    }
  }

  show_popup_create_event(tap: number) {
    this.numberTapActive = tap;
    $('#createEventTap' + tap).click();
    this.showPopupCreateEvent = true;
    $('#popupCreateEvent').show();
  }

  postEventCreateSettings(settings: EventCreateSettingsSaveResult) {
    this.ca0002PageValidator.checkValidate(this.createEventForm, this.validationError, this.formErrorMessage);
    const checkValue = this.ca0002PageValidator.checkValidDataForm(this.validationError, this.formErrorMessage);
    if (this.createEventForm.valid && checkValue === '') {
      this.checkErrorValidateForm = true;
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.formModel = this.createEventForm.value;
      this.ca0002PageValidator.mapModel(this.formModel, this.model);
      this.calendarService.postEventCreateSettings(this.model).subscribe(
        response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.hidePopupCreateEvent();
          this.dialogService.showSuccess('MSG.SAVED').subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.getListEventCalendar();
              }
            }
          );
        }, (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          const ret = error.message;
          let msg = 'CA004.MSG.CA0004_E001_1';
          if (ret === 'Sharing level of the staff\'s calendar has been changed') {
            msg = 'CA004.MSG.CA0007.E001_2';
          }
          this.dialogService.showError(msg);
        }
      );
    }else {
      this.checkErrorValidateForm = false;
      this.dialogService.showMessage('error', false, null, null, checkValue, 'MSG.OK', null).subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            setTimeout(() => {
              this.checkErrorValidateForm = true;
            });
          }
        }
      );
    }
  }

  displayOption(value) {
    this.validationError.groupInside = false;
    this.validationError.groupOutside = false;
    let show = false;
    if (value === this.valueShare.user) {
      show = true;
    }
    this.formModel.optionShare = value;
    this.createEventForm.controls.optionShare.setValue(value);

    // publishType after optionShareGroup
    setTimeout(() => {
      this.showPublishType = show;
    }, 200);
  }

  isAllDay() {
    this.checkAllDay = !this.checkAllDay;
  }

  editEvent() {
    this.hidePopupCreateEvent();
    const data = this.ca0002PageValidator.getDataForm(this.createEventForm);
    data['defaultView'] = this.defaultView;
    data['startDateCalendar'] = this.startDate;
    data['endDateCalendar'] = this.endDate;

    this.localStorage.setObject('ca0004', data);
    this.router.navigate(['/ca/ca0007']);
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

  /* TODO: FRAME MEETING */
  initFrameMeeting() {
    this.isMediator = this.userSession.funcAuthority.FP_7;
    this.authorityMeeting = this.userSession.funcAuthority.FP_1;
    this.meetingService.getVisitableUsersSettings(this.userSession.userId, this.userSession.officeId, 1).subscribe(
      (settings: VisitEntrySettings) => {
        this.listMediator = this.formatCurrentUserName(settings.users);
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      });
  }
  startDateFrameChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.createFrameMeetingForm.patchValue(
        {'startDay': date});
  }
  triggerChangeSlot() {
    const start = moment(this.createFrameMeetingForm.value.startTime, 'HH:mm');
    const end = moment(this.createFrameMeetingForm.value.endTime, 'HH:mm');
    const timeLimit = end.diff(start, 'minutes');
    this.slots = this.calendarCommon.genSlots(timeLimit);
    if (this.slots.indexOf(parseInt(this.createFrameMeetingForm.value.slots, 10)) === -1) {
      this.createFrameMeetingForm.controls.slots.setValue(this.slots[this.slots.length -1]);
    }
  }

  goTo0004() {
    if (this.localStorage.getObject('ca0004_frame')) {
      this.localStorage.remove('ca0004_frame');
    }
    const startDay = this.createFrameMeetingForm.value.startDay;
    const start = moment(startDay + ' ' + this.createFrameMeetingForm.value.startTime, 'YYYY-MM-DD HH:mm');
    const end = moment(startDay + ' ' + this.createFrameMeetingForm.value.endTime, 'YYYY-MM-DD HH:mm');
    const user = this.listMediator.filter((val) => {
      return val.officeUserId === this.createFrameMeetingForm.get('officeUserId').value});
    this.createFrameMeetingForm.patchValue(
      {
        'start': start.format('YYYY-MM-DDTHH:mm:ssZZ'),
        'end': end.format('YYYY-MM-DDTHH:mm:ssZZ')
      });
    const formValue = this.createFrameMeetingForm.value;
    formValue.userId = user[0]['userId'];
    formValue['defaultView'] = this.defaultView;
    formValue['startDateCalendar'] = this.startDate;
    formValue['endDateCalendar'] = this.endDate;
    this.localStorage.setObject('ca0004_frame', formValue);
    this.hidePopupCreateEvent();
  }

  checkError() {
    this.checkErrorValidateForm = true;
    const errorList = this.ca0002PageValidator.checkValidateFrame(this.createFrameMeetingForm, this.formErrorMessageFrame);
    this.formErrorMessageFrame = errorList;
    for (const key in errorList) {
      if (errorList.hasOwnProperty(key) && errorList[key]) {
        this.checkErrorValidateForm = false;
        this.dialogService.showError(errorList[key]).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              // no close popup
              setTimeout(() => {
                this.checkErrorValidateForm = true;
              });
            }
          }
        );
        return false;
      }
    }
    return true;
  }


  confirmFrameMeeting() {
    const validate = this.checkError();
    if (validate) {
      this.goTo0004();
      this.router.navigate(['ca/frame-meeting'], {queryParams: {display: 'create'}});
    }
  }

  advanceFrameMeeting() {
    const validate = this.checkError();
    if (validate) {
      this.goTo0004();
      this.router.navigate(['ca/frame-meeting']);
    }
  }
}
