import {Component, HostListener, OnInit} from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { ListMeeetings } from '../../../models/me/list-meeting-settings';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { AcceptMeetingsSendApi } from '../../../models/me/accept-meetings-send-api';
import { DialogResult } from '../../../models/dialog-param';
import { DelayMeetingSettings } from '../../../models/me/delay-meeting-settings';
import { CancelMeetingsSendApi } from '../../../models/me/cancel-meeting-settings';
import {MeetingStatus, SenderRequest, FrameMeetingStatus} from '../../../common/meeting-common';
import {InfoMeetingRequest} from '../../../models/me/info-meeting-request';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';
import {RejectMeetingsRequest} from '../../../models/me/reject-meeting-request';
import {InfoFrameMeetingRequest} from '../../../models/me/info-frame-meeting-request';
import {DialogService} from '../../../services/dialog.service';
import {Location} from '@angular/common';
import {HttpError} from '../../../common/error/http.error';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
declare var moment: any;
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';
import {CalendarCommon} from '../../../common/calendar-common';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-me0007-page',
  templateUrl: './me0007-page.component.html',
  styleUrls: ['./me0007-page.component.scss']
})
export class Me0007PageComponent implements OnInit {
  public MeetingStatus: typeof MeetingStatus = MeetingStatus;
  public SenderRequest: typeof SenderRequest = SenderRequest;
  public FrameMeetingStatus: typeof FrameMeetingStatus = FrameMeetingStatus;
  public settings = new ListMeeetings();
  flagStatusAccept: boolean;
  flagMain: boolean;
  flagStatusReject: boolean;
  flagDelay: boolean;
  flagCancel: boolean;
  flagConfirmCancelFrame: boolean;
  flagRejectFrameDetail: boolean;
  flagAcceptFrameDetail: boolean;
  typeId: string;
  requestId: string;
  subscription: Subscription;
  frameMeeting: InfoFrameMeetingRequest;
  requestMeeting: InfoMeetingRequest;
  startDateOptions = [];
  endDateOptions = [];
  listTimeInThePass = [];
  indexSelectedTime: number;
  start: any;
  end: any;
  place: string;
  delayDate = [];
  dateDelay: string;
  contentMessage: string;
  reQuestId: string;
  date: string;
  index = 0;
  see: boolean;
  public userSession: UserSession;
  public indexFrameMeeting: number;
  public listTimeStart = [];
  public listTimeEnd = [];
  public me0007Translate: any;
  public optionCancelFrameMeeting = {
    ONLY_EVENT: '0',
    REPEAT: '1'
  };
  public cancelFrameMeeting = '0';
  private defaultReject: string;
  private defaultCancel: string;
  private defaultAcceptFrame: string;
  public infoMediator: any;
  public labelMediatorAction: any;
  public authorityChangeTimeMeeting = true;

  constructor(private meetingService: MeetingService, public activatedRoute: ActivatedRoute, private dialogService: DialogService,
              private router: Router, private sharedValueService: SharedValueService, private location: Location,
              private translate: TranslateService, private helper: Helper, private wsService: WsService, private calendarCommon: CalendarCommon,
              private titleService: Title) {
    this.userSession = this.sharedValueService.getUserSession();
    this.translate.get('ME0007').subscribe(
      (res) => {
        this.me0007Translate = res;
      }
    );
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
    this.titleService.setTitle(this.translate.instant('DOC_TITLE.ME0007'));
  }

  ngOnInit() {
    this.indexSelectedTime = -1;
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.typeId = params['typeId'];
      this.requestId = params['requestId'];
    });
    this.see = true;
    this.getMeetingSettings();
    this.backMainScreen();
    this.delayDate = ['10', '20', '30', '40', '50', '60'];
    this.dateDelay = '10';
    this.defaultReject = this.me0007Translate['DEFAULT_MESSAGE']['REJECT'];
    this.defaultCancel = this.me0007Translate['DEFAULT_MESSAGE']['CANCEL'];
    this.defaultAcceptFrame = this.me0007Translate['DEFAULT_MESSAGE']['ACCEPT'];
  }
  getMeetingSettings() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingsSettings(this.typeId, this.requestId, this.see).subscribe(
      (settings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (this.typeId === '1') {
          this.frameMeeting = settings['frameMeetingInfo'];

          this.frameMeeting.doctor = this.getInfoUser(this.frameMeeting.doctor);
          for (let i = 0; i < this.frameMeeting.candidates.length; i++) {
            const frame = this.frameMeeting.candidates[i];
            frame.mrInfo = this.getInfoUser(frame.mrInfo, frame.mrInfo.companyName);
          }

        } else if (this.typeId === '0') {
          this.requestMeeting = settings['requestInfo'];
          this.checkAuthorityChangeTimeMeeting(settings['requestInfo']);

          // get info user
          this.getInfoMediator(this.requestMeeting);
          this.requestMeeting.mrInfo = this.getInfoUser(this.requestMeeting.mrInfo, this.requestMeeting.mrInfo.companyName);
          this.requestMeeting.drInfo = this.getInfoUser(this.requestMeeting.drInfo);

          const candidateTimes = this.requestMeeting.candidateTimes;
          const now = moment(new Date()).format('YYYY-MM-DDTHH:mmZZ');

          for (let i = 0; i < candidateTimes.length; i++) {
            const startDate = candidateTimes[i].startTime;
            const endDate = candidateTimes[i].endTime;

            candidateTimes[i].startTime = moment(startDate).format('YYYY-MM-DDTHH:mm');
            candidateTimes[i].endTime = moment(endDate).format('YYYY-MM-DDTHH:mm');

            this.listTimeInThePass.push(moment(candidateTimes[i].endTime).isSameOrBefore(now));
            if (!this.listTimeInThePass[i] && this.indexSelectedTime < 0) {
              this.indexSelectedTime = i;
            }
            this.listTimeStart[i] = candidateTimes[i].startTime;
            this.listTimeEnd[i] = candidateTimes[i].endTime;

            const data = this.convertListTime(candidateTimes[i].startTime, candidateTimes[i].endTime);
            this.startDateOptions.push(data.listTimeStart);
            this.endDateOptions.push(data.listTimeEnd);
          }
        }
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
    this.place = '';
  }

  checkAuthorityChangeTimeMeeting(requestMeeting) {
    const drInfo = requestMeeting.drInfo;
    const mrInfo = requestMeeting.mrInfo;

    if (drInfo.statusCancelHandlingHospital || drInfo.statusInvalid || drInfo.statusLockMr || drInfo.statusLocked ||
      drInfo.statusNoMeetingRole || drInfo.statusRestrictHospital || mrInfo.statusBlocked || mrInfo.statusInvalid) {
      this.authorityChangeTimeMeeting = false;
    }
  }

  getInfoMediator(requestMeeting: InfoMeetingRequest) {
    this.infoMediator = '';
    this.labelMediatorAction = '';
    if (requestMeeting.mediator && requestMeeting.direction === SenderRequest.SENDER && (requestMeeting.requestStatus ===
      MeetingStatus.NEW || requestMeeting.requestStatus === MeetingStatus.FIXED || requestMeeting.requestStatus === MeetingStatus.DONE ||
      (requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType !== 'MEDIATOR'))) {
      this.infoMediator = requestMeeting.mediator;
      this.labelMediatorAction = 'MSG.ME.LBL_SENDER_REQUEST';
    }
    if (requestMeeting.accepter && requestMeeting.direction === SenderRequest.RECEIVER && (requestMeeting.requestStatus ===
      MeetingStatus.FIXED || requestMeeting.requestStatus === MeetingStatus.DONE) && this.userRequest(requestMeeting.accepter) === 'DM') {
      this.infoMediator = requestMeeting.accepter;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (requestMeeting.canceler && requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType === 'MEDIATOR') {
      this.infoMediator = requestMeeting.canceler;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (requestMeeting.accepter && this.userRequest(requestMeeting.accepter) === 'DM' &&
      requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType !== 'MEDIATOR') {
      this.infoMediator = requestMeeting.accepter;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (this.infoMediator) {
      this.infoMediator = this.getInfoUser(this.infoMediator);
    }
  }

  checkAcceptMeeting(requestId: string, frameId: string, mrOfficeUserId: string, drOfficeUserId: string) {
    let msg = '';
    if (frameId && this.frameMeeting && this.frameMeeting.candidates.length > 1) {
      msg = this.contentMessage ? this.contentMessage : this.defaultAcceptFrame;
      // msg = '【';
      // msg += moment(this.frameMeeting.startTime).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(this.frameMeeting.startTime);
      // msg += moment(this.frameMeeting.startTime).format('HH:mm') + '〜' + moment(this.frameMeeting.endTime).format('HH:mm');
      // msg += ' の面会予定の中止】' + ((this.contentMessage) ? this.contentMessage : this.defaultAcceptFrame);
    }
    const start = moment(this.listTimeStart[this.indexSelectedTime]).format('YYYY-MM-DDTHH:mm:ssZZ');
    const end = moment(this.listTimeEnd[this.indexSelectedTime]).format('YYYY-MM-DDTHH:mm:ssZZ');
    const model = new AcceptMeetingsSendApi(requestId, frameId, start, end, this.place, msg);
    this.meetingService.checkAcceptMeeting(model).subscribe(
      (response) => {
        console.log(response);
        let html = '';
        let title = '';

        // Time of meetingRequest in past
        if (response.code === 'REQUEST_IN_PAST') {
          this.dialogService.showError('MSG.ME.E001');
        } else {
          // exit event calendar
          if (response.code === 'EXIST_EVENT') {
            html = '<p class="text-danger">' + this.me0007Translate.ERROR.ERROR_HAS_EVENT + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          // exit meeting requesting
          if (response.code === 'EXIST_REQUEST') {
            html = '<p class="text-danger">' + this.me0007Translate.ERROR.ERROR_HAS_REQUEST + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          // exit meeting request fix
          if (response.code === 'EXIST_FIXED_REQUEST') {
            html = '<p class="text-danger">' + this.me0007Translate.ERROR.ERROR_HAS_REQUEST_FIX + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          if (response.code !== 'SUCCESS') {
            this.dialogService.showMessage('warning', false, title, null, html, 'MSG.OK', null).subscribe(
              (resp: DialogResult) => {
                if (resp.isOk()) {
                  setTimeout(() => {
                    this.putAcceptMeeting(model, mrOfficeUserId, drOfficeUserId);
                  }, 400);
                }
              }
            );
          } else {
            this.putAcceptMeeting(model, mrOfficeUserId, drOfficeUserId);
          }
        }
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  putAcceptMeeting(model: AcceptMeetingsSendApi, mrOfficeUserId: string, drOfficeUserId: string) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });

      this.meetingService.putAcceptMeetingSettings(model).subscribe(
        (response) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          setTimeout(() => {
            this.dialogService.showMessage('success', false, null, 'ME0007.ACCEPT_SUCCESS.TITLE', null, 'MSG.YES', 'MSG.NO').subscribe(
              (resp: DialogResult) => {
                if (resp.isOk()) {
                  this.sendMessageChat(mrOfficeUserId, drOfficeUserId);
                } else {
                  this.router.navigate(['me/me0001']);
                }
              }
            );
          }, 400);
        },
        (error: HttpError) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (error.contains('ME.E001')) {
            this.dialogService.showError('MSG.ME.E001');
          } else {
            this.dialogService.showError('MSG.ERROR');
          }
        }
      );
  }

  sendMessageChat(mrOfficeUserId: string, drOfficeUserId: string) {
    const requestId = this.userSession.userId + Date.now();
    const data = {
      'type': 'get_room',
      'user': this.userSession.officeUserId,
      'request_id': requestId,
      'dr': drOfficeUserId,
      'pr': mrOfficeUserId
    };

    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.wsService.onPublish('get_room', data);

    this.wsService.messages.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (requestId === JSON.parse(msg_body).request_id) {
        this.router.navigate(['ch/ch0007', JSON.parse(msg_body).room.id]);
      }
    });

    this.wsService.errors.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (requestId === JSON.parse(msg_body).request_id) {
        this.dialogService.showError(JSON.parse(msg_body).error.msg);
      }
    });
  }

  delayMeeting() {
    this.helper.setScrollTop();
    this.flagMain = false;
    this.flagDelay = true;
  }

  acceptMeeting() {
    if (this.indexSelectedTime >= 0) {
      const end = this.listTimeEnd[this.indexSelectedTime];
      const now = moment(new Date()).format('YYYY-MM-DDTHH:mm');

      if (moment(end).isSameOrBefore(now)) {
        this.dialogService.showError('MSG.ME.E001');
      } else {
        this.flagMain = false;
        this.flagStatusAccept = true;
        this.helper.setScrollTop();
      }
    } else {
      this.dialogService.showError('MSG.ME.E001');
    }
  }

  rejectMeeting() {
    this.helper.setScrollTop();
    this.flagMain = false;
    this.contentMessage = this.defaultReject;
    this.flagStatusReject = true;
  }

  cancelMeeting(frameMeeting: boolean) {
    if (frameMeeting && !this.frameMeeting.rrule && this.frameMeeting.candidates.length === 0) {
      this.putCancelFrameMeetingSettings(this.frameMeeting.frameId);
    } else {
      this.helper.setScrollTop();
      this.flagMain = false;
      this.contentMessage = this.defaultCancel;
      this.flagCancel = true;
      if (this.frameMeeting && this.frameMeeting.rrule) {
        this.flagConfirmCancelFrame = true;
      } else {
        this.flagConfirmCancelFrame = false;
      }
    }
  }

  confirmCancelFrameMeeting() {
    if (this.frameMeeting.candidates.length === 0) {
      this.putCancelFrameMeetingSettings(this.frameMeeting.frameId);
    } else {
      this.flagConfirmCancelFrame = false;
    }
  }

  backSelectCancelFrameScreen() {
    if (this.frameMeeting.rrule) {
      this.flagConfirmCancelFrame = true;
    } else {
      this.backMainScreen();
    }
  }

  acceptFrameMeeting(requestId, index: number) {
    this.helper.setScrollTop();
    this.reQuestId = requestId;
    this.indexFrameMeeting = index;
    this.flagMain = false;
    this.contentMessage = this.defaultAcceptFrame;
    this.flagAcceptFrameDetail = true;
  }

  rejectFrameMeeting(requestId, index: number) {
    this.helper.setScrollTop();
    this.reQuestId = requestId;
    this.indexFrameMeeting = index;
    this.flagMain = false;
    this.contentMessage = this.defaultReject;
    this.flagRejectFrameDetail = true;
  }

  backMainScreen() {
    this.helper.setScrollTop();
    this.flagMain = true;
    this.flagStatusReject = false;
    this.flagCancel = false;
    this.flagStatusAccept = false;
    this.flagDelay = false;
    this.flagRejectFrameDetail = false;
    this.flagAcceptFrameDetail = false;
    this.flagConfirmCancelFrame = false;

    // revert data
    this.dateDelay = '10';
  }

  changeDateMeeting() {
    if (this.requestMeeting.inputType !== 'DELIVERY_DOC') {
      this.router.navigate(['me/me0006', this.requestMeeting.mrInfo.userId, this.requestMeeting.mrInfo.officeId, this.requestMeeting.requestId]);
    } else {
      this.dialogService.showMessage('warning', false, null, 'MSG.ME.NO_CHANGE_TIME_SEND_DOCUMENT', null, 'MSG.OK', null);
    }
  }

  putDelayMeetingSettings(requestId) {
    const model = new DelayMeetingSettings(requestId, this.dateDelay);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putDelayMeetingSettings(model).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.ME.M007').subscribe(
          (resp: DialogResult) => {
            if (resp.isOk()) {
              this.router.navigate(['me/me0001']);
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

  putRejectMeetingSettings(requestId: string) {
    const msg = this.contentMessage ? this.contentMessage : this.defaultReject;
    // let msg = '【';
    // for (let i = 0; i < this.requestMeeting.candidateTimes.length; i++) {
    //   const request = this.requestMeeting.candidateTimes[i];
    //   if (i > 0) {
    //     msg += ', ';
    //   }
    //   msg += moment(request.startTime).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(request.startTime);
    //   msg += ' ' + moment(request.startTime).format('HH:mm') + '〜' + moment(request.endTime).format('HH:mm');
    //
    // }
    // msg += ' の面会予定の中止】' + ((this.contentMessage) ? this.contentMessage : this.defaultReject);
    const model = new RejectMeetingsRequest(requestId, msg, '');
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putRejectMeetingSettings(model).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
          this.dialogService.showSuccess('MSG.ME.M006').subscribe(
            (resp: DialogResult) => {
              if (resp.isOk()) {
                this.router.navigate(['me/me0001']);
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

  putCancelMeetingSettings(requestId: string, frameId: string, allFollowing: boolean) {
    let msg = '';
    if (requestId) {
      msg = this.contentMessage ? this.contentMessage : this.defaultCancel;
      // let msg = '【';
      // msg += moment(this.requestMeeting.acceptedStartTime).format('MM月DD日')
      //   + this.calendarCommon.getWeekdayJapanese(this.requestMeeting.acceptedStartTime);
      // msg += ' ' + moment(this.requestMeeting.acceptedStartTime).format('HH:mm') + '〜' + moment(this.requestMeeting.acceptedEndTime).format('HH:mm');
      // msg += ' の面会予定の中止】' + ((this.contentMessage) ? this.contentMessage : this.defaultCancel);
    }

    if (frameId && (this.frameMeeting.candidates.length > 0 || allFollowing)) {
      msg = this.contentMessage ? this.contentMessage : this.defaultCancel;
      // let msg = '【';
      // msg += moment(this.frameMeeting.startTime).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(this.frameMeeting.startTime);
      // msg += ' ' + moment(this.frameMeeting.startTime).format('HH:mm') + '〜' + moment(this.frameMeeting.endTime).format('HH:mm');
      // msg += ' の面会予定の中止】' + ((this.contentMessage) ? this.contentMessage : this.defaultCancel);
    }
    const model = new CancelMeetingsSendApi(requestId, frameId, msg, allFollowing);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putCancelMeetingSettings(model).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
          this.dialogService.showSuccess('MSG.ME.M004').subscribe(
            (resp: DialogResult) => {
              if (resp.isOk()) {
                this.router.navigate(['me/me0001']);
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

  putCancelFrameMeetingSettings(frameId: string) {
    // check repeat rru of frame meeting
    let allFollowing = false;
    if (this.frameMeeting.rrule) {
      allFollowing = (this.cancelFrameMeeting === this.optionCancelFrameMeeting.REPEAT) ? true : false;
    }
    this.putCancelMeetingSettings('', frameId, allFollowing);
  }

  putRejectFrameMeetingSettings() {
    const msg = this.contentMessage ? this.contentMessage : this.defaultReject;
    // let msg = '【';
    // msg += moment(this.frameMeeting.startTime).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(this.frameMeeting.startTime);
    // msg += ' ' + moment(this.frameMeeting.startTime).format('HH:mm') + '〜' + moment(this.frameMeeting.endTime).format('HH:mm');
    // msg += ' の面会予定の中止】' + ((this.contentMessage) ? this.contentMessage : this.defaultReject);

    const model = new RejectMeetingsRequest(this.reQuestId, msg, '');
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putRejectMeetingSettings(model).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.ME.M004').subscribe(
          (resp: DialogResult) => {
            if (resp.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.router.navigate(['me/me0001']);
            }
          });
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  putAcceptFrameMeetingSettings(frameId) {
    const mrOfficeUserId = this.frameMeeting.candidates[this.indexFrameMeeting].mrInfo.officeUserId;
    const drOfficeUserId = this.frameMeeting.doctor.officeUserId;
    this.checkAcceptMeeting(this.reQuestId, frameId, mrOfficeUserId, drOfficeUserId);
  }

  changeTimeRequest(index: number) {
    let data = this.convertListTime(this.requestMeeting.candidateTimes[index].startTime, this.listTimeEnd[index]);
    this.startDateOptions[index] = data.listTimeStart;

    data = this.convertListTime(this.listTimeStart[index], this.requestMeeting.candidateTimes[index].endTime);
    this.endDateOptions[index] = data.listTimeEnd;
  }

  convertListTime(start: string, end: string) {
    const listTimeStart = new Array();
    const listTimeEnd = new Array();

    listTimeStart.push(start);
    let time = moment(start).add(5, 'minutes').format('YYYY-MM-DDTHH:mm');
    while (moment(time).isBefore(end)) {
      listTimeStart.push(time);
      listTimeEnd.push(time);
      time = moment(time).add(5, 'minutes').format('YYYY-MM-DDTHH:mm');
    }
    listTimeEnd.push(end);

    return {
      listTimeStart: listTimeStart,
      listTimeEnd: listTimeEnd
    };
  }

  printPage() {
    const css = '@page { layout: portrait; size: A4; margin: 10mm 4mm 10mm 4mm}, @media print {html, body {width: 210mm;height: 297mm;}}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';

    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    $('.fa-chevron-left').hide();
    window.print();
    $('.fa-chevron-left').show();
    return false;
  }

  enableOption(index) {
    if (!this.listTimeInThePass[index]) {
      this.index = index;
      this.indexSelectedTime = index;
    }
  }

  getInfoDrugAndProduct(drugList: any[]) {
    let html = '';
    for (let i = 0; i < drugList.length; i++) {
      html += (i === 0) ? '<span>' + drugList[i].name + '</span>' :
        '<br><span>' + drugList[i].name + '</span>';
    }
    return html;
  }

  getMeetingStatus() {
    let status = '';
    if (this.requestMeeting.requestStatus === MeetingStatus.NEW) {
      status = (this.requestMeeting.direction === 0) ? 'REQUESTING' : 'NEW';
    } else {
      return MeetingStatus[this.requestMeeting.requestStatus];
    }
    return status;
  }

  loginIsMediator(typeMeeting: string) {
    if (typeMeeting === 'REQUEST') {
      if (this.userSession.userId !== this.requestMeeting.drInfo.userId ||
        this.userSession.officeId !== this.requestMeeting.drInfo.officeId) {
        return true;
      }
      return false;
    } else if (typeMeeting === 'FRAME_MEETING') {
      if (this.userSession.userId !== this.frameMeeting.doctor.userId ||
        this.userSession.officeId !== this.frameMeeting.doctor.officeId) {
        return true;
      }
      return false;
    }
    return false;
  }

  userRequest(user: any) {
    if (user) {
      if (user.userId === this.requestMeeting.drInfo.userId &&
        user.officeId === this.requestMeeting.drInfo.officeId) {
        return 'DR';
      } else if (user.userId === this.requestMeeting.mrInfo.userId &&
        user.officeId === this.requestMeeting.mrInfo.officeId) {
        return 'MR';
      } else {
        return 'DM';
      }
    }
    return null;
  }

  getUserComment(comment: any) {
    let user = '';
    switch (comment.userType) {
      case 'DR':
        user = this.loginIsMediator('REQUEST') ? 'DOCTOR' : 'MY';
        break;
      case 'MR':
        user = 'CUSTOM';
        break;
      case 'MD':
        user = this.loginIsMediator('REQUEST') ? 'MY' : 'MEDIATOR';
        break;
    }
    return user;
  }

  checkLength(event, value: string, maxLength: number) {
    const length = event.target.value.length;
    if (length > maxLength) {
      this[value] = event.target.value.slice(0, maxLength);
    }
  }

  clickBackMainScreen() {
    if (this.flagMain) {
      this.location.back();
    } else {

      if (this.flagCancel && this.frameMeeting && !this.flagConfirmCancelFrame) {
          this.backSelectCancelFrameScreen();
      } else {
        this.backMainScreen();
      }
    }
  }

  changeOptionCancelFrame(option: string) {
    this.cancelFrameMeeting = option;
  }

  getSummaryFrameMeeting() {
    const summary = (this.frameMeeting.rrule) ? '【' + this.frameMeeting.rrule + '】' : '';
    return summary;
  }

  getInfoUser(user: any, officeName?: string) {
    const office = officeName ? officeName : user.companyName;
    const infoUser = {
      invalid: user.accountStatus === 'INVALID',
      userId: user.userId,
      officeId: user.officeId,
      officeUserId: user.officeUserId,
      lastName: user.lastName,
      firstName: user.firstName,
      imageUrl: user.image,
      firstNameKana: '',
      lastNameKana: '',
      officeName: office,
      department: {
        name: this.convertPathDepartment(user)
      }
    };

    return infoUser;
  }

  // convert path of department Drjoy
  convertPathDepartment(user: any) {
    let result = user.department;
    if (user.departmentPath && user.departmentPath !== '/') {
      result = user.departmentPath.slice(1, -1).replace(/\//g, ' | ');
      if (result === '') {
        result = user.department;
      }
    }
    return result;
  }
}

