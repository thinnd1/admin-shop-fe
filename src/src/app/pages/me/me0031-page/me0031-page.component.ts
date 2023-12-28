import {Component, OnInit} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {ListMettingDetailSettingsPr} from '../../../models/me/list-metting-detail-settings-pr';
import {ModelInput, SenderRequest} from '../../../common/meeting-common';
import {MeetingStatus} from '../../../common/meeting-common';
import {DelayMeetingSettings} from '../../../models/me/delay-meeting-settings';
import {AcceptMeetingCallApiPr} from '../../../models/me/accept-meeting-call-api-pr';
import {RejectMeetingsRequest} from '../../../models/me/reject-meeting-request';
import {CancelMeetingsSendApi} from '../../../models/me/cancel-meeting-settings';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {InfoMeetingRequest} from '../../../models/me/info-meeting-request';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {AcceptMeetingsSendApi} from '../../../models/me/accept-meetings-send-api';
import {HttpError} from '../../../common/error/http.error';
import {Helper} from '../../../common/helper';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';

declare var moment: any;

@Component({
  selector: 'app-me0031-page',
  templateUrl: './me0031-page.component.html',
  styleUrls: ['./me0031-page.component.scss']
})
export class Me0031PageComponent implements OnInit {
  public ModelInput: typeof ModelInput = ModelInput;
  public MeetingStatus: typeof MeetingStatus = MeetingStatus;
  public SenderRequest: typeof SenderRequest = SenderRequest;
  public maxNumberVisit = new Array(10);
  public indexSelectedTime: number;
  public flagDelay = false;
  public dateDelay = '10';
  public contentMessage: string;
  public delayDate = ['10', '20', '30', '40', '50', '60'];
  public numVisitors = 0;
  typeId: string;
  requestId: string;
  requestMeeting: InfoMeetingRequest;
  optionTimes: any;

  visibleMain: boolean;
  visibleAccess: boolean;
  visibleReject: boolean;
  flagCancel: boolean;
  public userSession: UserSession;
  public checkValidate = true;
  public me0031Translate: any;
  private defaultReject = '今回は都合により面会予定の調整ができませんでした。またご連絡いただければ幸いです。今後とも宜しくお願い致します。';
  private defaultCancel = '申し訳ございませんが、今回は都合により面会予定の調整ができなくなりました。今後とも宜しくお願い致します。';
  public listTimeInThePass = [];
  public infoMediator;
  public labelMediatorAction;
  public drSendMessage = false;
  public authorityChangeTimeMeeting = true;

  constructor(private meetingService: MeetingService, public activatedRoute: ActivatedRoute, private dialogService: DialogService,
              private router: Router, private sharedValueService: SharedValueService, private location: Location,
              private translate: TranslateService, private helper: Helper, private wsService: WsService) {
    this.userSession = this.sharedValueService.getUserSession();
    this.translate.get('ME0031').subscribe(
      (res) => {
        this.me0031Translate = res;
      }
    );
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
  }

  ngOnInit() {
    this.indexSelectedTime = -1;
    this.backMainScreen();
    this.activatedRoute.params.subscribe(params => {
      this.requestId = params['requestId'];
      this.getMeetingDetailPr();
    });
  }

  backMainScreen() {
    this.helper.setScrollTop();
    this.visibleMain = true;
    this.visibleAccess = false;
    this.visibleReject = false;
    this.flagCancel = false;
    this.flagDelay = false;

    // revert data
    this.dateDelay = '10';
  }

  getMeetingDetailPr() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingDetailPrMe0031('0', this.requestId).subscribe((settings: ListMettingDetailSettingsPr) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.requestMeeting = settings.requestInfo;
      this.checkAuthorityChangeTimeMeeting(settings.requestInfo);

      // get info user
      this.getInfoMediator(this.requestMeeting);
      this.requestMeeting.drInfo = this.getInfoUser(this.requestMeeting.drInfo, this.requestMeeting.drInfo.officeName,
        this.requestMeeting.drInfo.acceptRequest);

      if (this.requestMeeting.requestStatus === MeetingStatus.NEW && this.requestMeeting.direction === SenderRequest.SENDER) {
        const candidateTimes = this.requestMeeting.candidateTimes;
        const now = moment(new Date()).format('YYYY-MM-DDTHH:mmZZ');

        for (let i = 0; i < candidateTimes.length; i++) {
          const endDate = candidateTimes[i].endTime;
          candidateTimes[i].endTime = moment(endDate).format('YYYY-MM-DDTHH:mmZZ');

          this.listTimeInThePass.push(moment(candidateTimes[i].endTime).isSameOrBefore(now));
          if (!this.listTimeInThePass[i] && this.indexSelectedTime < 0) {
            this.indexSelectedTime = i;
          }
        }
      }
      this.checkRoom();
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  checkAuthorityChangeTimeMeeting(requestMeeting) {
    const drInfo = requestMeeting.drInfo;
    const mrInfo = requestMeeting.mrInfo;

    if (drInfo.statusCancelHandlingHospital || drInfo.statusInvalid || drInfo.statusLockMr || drInfo.statusLocked ||
      drInfo.statusNoMeetingRole || drInfo.statusRestrictHospital || drInfo.statusRestrictMeeting ||
      mrInfo.statusBlocked || mrInfo.statusInvalid) {
      this.authorityChangeTimeMeeting = false;
    }
  }

  getInfoMediator(requestMeeting: InfoMeetingRequest) {
    this.infoMediator = '';
    this.labelMediatorAction = '';

    if (requestMeeting.direction === SenderRequest.SENDER && requestMeeting.mediator &&
      (requestMeeting.requestStatus === MeetingStatus.NEW ||
      ((requestMeeting.requestStatus === MeetingStatus.FIXED || requestMeeting.requestStatus === MeetingStatus.DONE) &&
        this.userRequest(requestMeeting.accepter) !== 'DM') ||
      (requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType !== 'MEDIATOR'))) {
      this.infoMediator = requestMeeting.mediator;
      this.labelMediatorAction = 'MSG.ME.LBL_SENDER_REQUEST';
    }

    if ((requestMeeting.requestStatus === MeetingStatus.FIXED || requestMeeting.requestStatus === MeetingStatus.DONE) &&
    this.userRequest(requestMeeting.accepter) === 'DM') {
      this.infoMediator = requestMeeting.accepter;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType === 'MEDIATOR') {
      this.infoMediator = requestMeeting.canceler;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (requestMeeting.accepter && this.userRequest(requestMeeting.accepter) === 'DM' &&
      requestMeeting.requestStatus === MeetingStatus.CANCELED && requestMeeting.canceler && requestMeeting.canceler.accountType !== 'MEDIATOR') {
      this.infoMediator = requestMeeting.canceler;
      this.labelMediatorAction = 'MSG.ME.LBL_MEDIATOR_REQUEST';
    }

    if (this.infoMediator) {
      this.infoMediator = this.getInfoUser(this.infoMediator, requestMeeting.drInfo.officeName);
    }
  }

  enableOption(index: number) {
    if (!this.listTimeInThePass[index]) {
      this.indexSelectedTime = index;
    }
  }

  delayMeeting() {
    this.visibleMain = false;
    this.flagDelay = true;
  }

  acceptMeeting() {
    this.checkValidate = (this.numVisitors > 0) ? true : false;
    if (this.checkValidate) {
      if (this.indexSelectedTime >= 0) {
        const end = moment(this.requestMeeting.candidateTimes[this.indexSelectedTime].endTime).format('YYYY-MM-DDTHH:mmZZ');
        const now = moment(new Date()).format('YYYY-MM-DDTHH:mm');

        if (moment(end).isSameOrBefore(now)) {
          this.dialogService.showError('MSG.ME.E001');
        } else {
          this.helper.setScrollTop();
          this.visibleMain = false;
          this.visibleAccess = true;
        }
      } else {
        this.dialogService.showError('MSG.ME.E001');
      }
    }
  }

  setScrollTop() {
    window.scroll(window.scrollX, 0);
  }

  rejectMeeting() {
    this.helper.setScrollTop();
    this.visibleMain = false;
    this.contentMessage = this.defaultReject;
    this.visibleReject = true;
  }

  cancelMeeting() {
    this.helper.setScrollTop();
    this.visibleMain = false;
    this.contentMessage = this.defaultCancel;
    this.flagCancel = true;
  }

  checkAcceptMeeting(requestId: string, mrOfficeUserId: string, drOfficeUserId: string) {
    const start = moment(this.requestMeeting.candidateTimes[this.indexSelectedTime].startTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    const end = moment(this.requestMeeting.candidateTimes[this.indexSelectedTime].endTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    const model = new AcceptMeetingsSendApi(requestId, '', start, end, '', '');
    this.meetingService.checkAcceptMeetingPr(model).subscribe(
      (response) => {
        let html = '';
        let title = '';

        if (response.code === 'REQUEST_IN_PAST') {
          this.dialogService.showError('MSG.ME.E001');
        } else {
          // exit event calendar
          if (response.code === 'EXIST_EVENT') {
            html = '<p class="text-danger">' + this.me0031Translate.ERROR.ERROR_HAS_EVENT + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          // exit meeting requesting
          if (response.code === 'EXIST_REQUEST') {
            html = '<p class="text-danger">' + this.me0031Translate.ERROR.ERROR_HAS_REQUEST + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          // exit meeting request fix
          if (response.code === 'EXIST_FIXED_REQUEST') {
            html = '<p class="text-danger">' + this.me0031Translate.ERROR.ERROR_HAS_REQUEST_FIX + '</p>';
            title = 'MSG.ME.ACCEPT_REQUEST';
          }

          if (response.code !== 'SUCCESS') {
            this.dialogService.showMessage('warning', false, title, null, html, 'MSG.OK', null).subscribe(
              (resp: DialogResult) => {
                if (resp.isOk()) {
                  setTimeout(() => {
                    this.putAcceptMeeting(requestId, mrOfficeUserId, drOfficeUserId);
                  }, 400);
                }
              }
            );
          } else {
            this.putAcceptMeeting(requestId, mrOfficeUserId, drOfficeUserId);
          }
        }
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

  putAcceptMeeting(requestId: string, mrOfficeUserId: string, drOfficeUserId: string) {
    const start = moment(this.requestMeeting.candidateTimes[this.indexSelectedTime].startTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    const end = moment(this.requestMeeting.candidateTimes[this.indexSelectedTime].endTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    const model = new AcceptMeetingCallApiPr(requestId, '', start, end, '', this.numVisitors);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putAcceptMeetingSettingsPr(model).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
          setTimeout(() => {
            this.dialogService.showMessage('success', false, null, 'ME0031.ACCEPT_SUCCESS.TITLE', null, 'MSG.YES', 'MSG.NO').subscribe(
              (resp: DialogResult) => {
                if (resp.isOk()) {
                  this.sendMessageChat(mrOfficeUserId, drOfficeUserId);
                } else {
                  this.router.navigate(['me/me0030']);
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

  putRejectMeetingSettings(requestId: string) {
    const msg = this.contentMessage ? this.contentMessage : this.defaultReject;
    const model = new RejectMeetingsRequest(requestId, msg, '');
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putRejectMeetingSettingsPr(model).subscribe(response => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('MSG.ME.M006').subscribe(
        (resp: DialogResult) => {
          if (resp.isOk()) {
            this.router.navigate(['me/me0030']);
          }
        }
      );
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  putDelayMeetingSettings(requestId) {
    const model = new DelayMeetingSettings(requestId, this.dateDelay);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putDelayMeetingSettingsPr(model).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.ME.M007').subscribe(
          (resp: DialogResult) => {
            if (resp.isOk()) {
              this.router.navigate(['me/me0030']);
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

  putCancelMeetingSettings(requestId) {
    const msg = this.contentMessage ? this.contentMessage : this.defaultCancel;
    const model = new CancelMeetingsSendApi(requestId, '', msg, false);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putCancelMeetingPr(model).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
          this.dialogService.showSuccess('MSG.ME.M004').subscribe(
            (resp: DialogResult) => {
              if (resp.isOk()) {
                this.router.navigate(['me/me0030']);
              }
            }
          );
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
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

  getMeetingStatus() {
    let status = '';
    if (this.requestMeeting.requestStatus === MeetingStatus.NEW) {
      status = (this.requestMeeting.direction === 1) ? 'REQUESTING' : 'NEW';
    } else {
      return MeetingStatus[this.requestMeeting.requestStatus];
    }
    return status;
  }

  getInfoDrugAndProduct() {
    let html = '';
    if (!$.isEmptyObject(this.requestMeeting)) {
      for (let i = 0; i < this.requestMeeting.drugList.length; i++) {
        html += (i === 0) ? '<span>' + this.requestMeeting.drugList[i].name + '</span>' :
          '<br><span>' + this.requestMeeting.drugList[i].name + '</span>';
      }
    }
    return html;
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

  printPage() {
    const css = '@page { layout: portrait; size: A4; margin: 10mm 4mm 10mm 4mm}, @media print {html, body {width: 210mm;height: 297mm;}}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    console.log(head);

    style.type = 'text/css';
    style.media = 'print';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    document.title = '';

    $('.fa-chevron-left').hide();

    window.print();
    $('.fa-chevron-left').show();
    return false;
  }

  changeDateMeeting() {
    if (this.requestMeeting.inputType !== 'DELIVERY_DOC') {
      this.router.navigate(['me/me0029', this.requestMeeting.drInfo.userId, this.requestMeeting.drInfo.officeId,
        ModelInput.CHANG_TIME, this.requestMeeting.requestId]);
    } else {
      this.dialogService.showMessage('warning', false, null, 'MSG.ME.NO_CHANGE_TIME_SEND_DOCUMENT', null, 'MSG.OK', null);
    }
  }

  checkLength(event, maxLength: number) {
    const length = event.target.value.length;
    if (length > maxLength) {
      this.contentMessage = event.target.value.slice(0, maxLength);
    }
  }

  clickBackMainScreen() {
    if (this.visibleMain) {
      this.location.back();
    } else {
      this.backMainScreen();
    }
  }

  getInfoUser(user: any, officeName?: string, acceptRequest?: boolean) {
    const office = officeName ? officeName : '';
    let check = false;
    if (acceptRequest) {
      check = true;
    }
    const infoUser = {
      acceptRequest: check,
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
        name: user.department
      },
    };

    return infoUser;
  }

  checkRoom() {
    const requestId = this.userSession.userId + Date.now();
    const data = {
      'type': 'check_room',
      'request_id': requestId,
      'user': this.userSession.officeUserId,
      'dr': this.requestMeeting.drInfo.officeUserId,
      'pr': this.requestMeeting.mrInfo.officeUserId
    };

    this.wsService.onPublish('check_room', data);

    this.wsService.messages.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      console.log(JSON.parse(msg_body));
      if (requestId === JSON.parse(msg_body).request_id) {
        this.drSendMessage = JSON.parse(msg_body).exists;
      }
    });
  }
}
