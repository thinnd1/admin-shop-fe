import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {CalendarCommon} from '../../../common/calendar-common';
import {DialogService} from '../../../services/dialog.service';
import {InfoMeetingRequest} from '../../../models/me/info-meeting-request';
import {MeetingInfoWhenUnAuth} from '../../../models/me/meeting-when-un-auth';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {AcceptMeetingsSendApi} from '../../../models/me/accept-meetings-send-api';
import {RejectMeetingsRequest} from '../../../models/me/reject-meeting-request';
import {NgxOAuthResponse} from 'ngx-oauth-client';
import {Authentication, AuthenticationService} from '../../../services/authentication.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {environment} from '../../../../environments/environment';
import {NGXLogger} from 'ngx-logger';
import {MeetingNologinService} from '../../../services/meeting.nologin.service';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-me0009-page',
  templateUrl: './me0009-page.component.html',
  styleUrls: ['./me0009-page.component.scss']
})
export class Me0009PageComponent implements OnInit, OnDestroy {
  meetingRequest: InfoMeetingRequest;
  requestId: string;
  errorCode: string;
  acticeMessageScreen: boolean;
  startDateOptions = [];
  endDateOptions = [];
  optionStartDate: any;
  optionEndDate: any;
  start: any;
  end: any;
  startDates = [];
  endDates = [];
  optionTimes: any;
  indexSelectedTime: number;
  stepForMinute: number;
  drugList = [];
  visitorNumber: number;
  mrComment: string;
  place: string;
  dateMeetings = [];
  userInfo: any = {};
  message = '';
  loading = false;
  isLogin = false;
  nonceId: string;
  accessToken: string;
  authentication: Authentication;
  isMediator = false;
  showPassword = false;

  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    private meetingService: MeetingNologinService,
    private route: ActivatedRoute,
    private calendarCommon: CalendarCommon,
    private authService: AuthenticationService,
    private shared: SharedValueService,
    private _firebaseStorage: FirebaseStorage,
    private logger: NGXLogger,
    private titleService: Title
  ) {
  }

  setTitle(id: string) {
    this.translateService.get(id).subscribe(
      (res) => {
        this.titleService.setTitle(res);
      }
    );
  }

  async ngOnInit() {
    this.setTitle('DOC_TITLE.ME0009');

    // get one time session token
    this.route.params.subscribe((param: any) => {

      // 面会リクエストID
      this.requestId = param['requestId'];
      // ノンスID
      this.nonceId = param['nonceId'];

      // ローディング
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });

      // アクセストークンの取得
      this.fetchAccessToken(param['nonceToken'], (data, error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });

        // エラー時
        if (!data || error) {
          this.authService.clearToken();
          this.shared.clearUserSession();
          this.dispose();

          this.errorCode = 'ME.ERR_EXPIRE';
          this.acticeMessageScreen = true;
          return;
        }

        // ログイン済みチェック
        if (this.authService.isLogin()) {
          this.dispose();
          // ログイン済みの時
          if (data.office_user_id === this.authService.authentication().office_user_id) {
            const redirectUrl = decodeURIComponent(param['redirectUrl']);
            return this.router.navigate([redirectUrl], {replaceUrl: true}).then(() => {});

          } else {
            // ユーザーが異なる時
            return this.router.navigate(['/logout'], {replaceUrl: true}).then(() => {});
          }
        }

        // 権限チェック
        if (!this.authentication.enabled) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });

          this.errorCode = 'ME.ERR_AUTHORITY';
          this.acticeMessageScreen = true;

        } else {
          // 面会リクエスト情報の取得
          this.getMeetingWhenUnauth();
        }
      });
    });
  }

  /**
   * アクセストークンを取得する.
   */
  private fetchAccessToken(nonceToken: string, callback: (data: Authentication, error: any) => void) {
    // Request parameters
    const parameters = {
      grant_type: 'password',
      username: this.nonceId,
      password: nonceToken,
      client_id: environment.nologinMeetingClientId,
      client_secret: environment.nologinMeetingClientSecret,
    };

    this.authService.getToken(parameters.grant_type, parameters, false).take(1).subscribe(res => {
      // verity access token
      this.accessToken = res.access_token;

      if (!this.accessToken) {
        return callback(null, null);
      }

      this.authentication = this.authService.toAuthenticationModel(this.accessToken);
      this.logger.debug('*** data: ', this.authentication);

      return callback(this.authentication, null);

    }, error => {
      callback(null, error);
    });
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private dispose() {
    this.nonceId = null;
    this.accessToken = null;
    this.errorCode = null;
    this.authentication = null;
  }

  convertDateTimeMeeting() {
    if (this.meetingRequest.candidateTimes) {
      this.optionTimes = this.meetingRequest.candidateTimes;
      this.optionTimes.forEach((value) => {
        const start = this.calendarCommon.convertDatetime(value.startTime);
        const end = this.calendarCommon.convertDatetime(value.endTime);
        this.startDates.push(start);
        this.endDates.push(end);
        this.dateMeetings.push({'dateFormat': value.startTime});
        const stepMinute = this.getStepMinute(start.time, end.time);
        this.startDateOptions.push(this.convertTime(start.time, 0, stepMinute));
        this.endDateOptions.push(this.convertTime(end.time, 1, stepMinute));
      });
    }
  }

  getMeetingWhenUnauth() {
    this.meetingService.getMeetingWhenUnauth(this.requestId, this.nonceId, this.accessToken)
      .subscribe((response: MeetingInfoWhenUnAuth) => {
        if (response.errorCode) {
          this.errorCode = response.errorCode;
          this.acticeMessageScreen = true;
        } else {
          this.acticeMessageScreen = false;
          this.indexSelectedTime = 0;
          this.meetingRequest = response.requestInfo;
          this.drugList = this.meetingRequest.drugList;
          this.visitorNumber = this.meetingRequest.numVisitors;
          for (const comment of this.meetingRequest.comment) {
            if (comment.userType === 'MR') {
              this.mrComment = comment.comment;
              break;
            }
          }
          console.log('*** meeting: ', response);

          this.place = this.meetingRequest.place;
          this.convertDateTimeMeeting();
          this.setMediator();
        }
      });
  }

  setMediator() {
    if (!this.meetingRequest.drInfo) {
      return;
    }
    this.isMediator = this.authentication.office_user_id !== this.meetingRequest.drInfo.officeUserId;
  }

  routeLogin() {
    this.router.navigate(['/re/re0022'], {replaceUrl: true});
  }

  convertTimeToString(hour: number, minute: number) {
    const m = minute < 10 ? '0' + minute : minute;
    const h = hour < 10 ? '0' + hour : hour;
    return (h + ':' + m);
  }

  convertTime(value: string, operator: number, step: number) {
    let arrValue;
    let returnArr;
    returnArr = [];
    arrValue = value.split(':');
    for (let i = 0; i < arrValue.length; i++) {
      arrValue[i] = parseInt(arrValue[i], 0);
    }
    returnArr.push(this.convertTimeToString(arrValue[0], arrValue[1]));
    if (operator === 0) {
      for (let i = 0; i < step; i++) {
        arrValue[1] += 5;
        if (arrValue[1] === 60) {
          arrValue[0] += 1;
          arrValue[1] = 0;
        }
        returnArr.push(this.convertTimeToString(arrValue[0], arrValue[1]));
      }
    } else {
      for (let i = 0; i < step; i++) {
        if (arrValue[1] === 0) {
          arrValue[0] -= 1;
          arrValue[1] = 55;
        } else if (arrValue[1] > 0) {
          arrValue[1] -= 5;
        }
        returnArr.unshift(this.convertTimeToString(arrValue[0], arrValue[1]));
      }
    }
    return returnArr;
  }

  getStepMinute(startTime: string, endTime: string) {
    let arrStartTime;
    arrStartTime = startTime.split(':');
    for (let i = 0; i < arrStartTime.length; i++) {
      arrStartTime[i] = parseInt(arrStartTime[i], 0);
    }
    let arrEndTime;
    arrEndTime = endTime.split(':');
    for (let j = 0; j < arrEndTime.length; j++) {
      arrEndTime[j] = parseInt(arrEndTime[j], 0);
    }
    let hourByMinute;
    let minute;
    hourByMinute = (arrEndTime[0] - arrStartTime[0]) * 60;
    if (arrEndTime[1] - arrStartTime[1] < 0) {
      minute = Math.abs(arrEndTime[1] - arrStartTime[1]);
      this.stepForMinute = (hourByMinute - minute) / 5;
    } else {
      minute = arrEndTime[1] - arrStartTime[1];
      this.stepForMinute = (hourByMinute + minute) / 5;
    }
    return (this.stepForMinute - 1);
  }

  enableOption(index) {
    this.indexSelectedTime = index;
    this.optionStartDate = $('#startDate_' + index).val();
    this.optionEndDate = $('#endDate_' + index).val();
    console.log(this.optionStartDate);
    console.log(this.optionEndDate);
  }

  changeStart(index: number) {
    this.optionStartDate = $('#startDate_' + index).val();
    this.generateArrayTime(this.optionStartDate, this.endDateOptions[index][this.endDateOptions[index].length - 1], index, 1);
  }

  generateArrayTime(startTime: string, endTime: string, index: number, operator: number) {
    let step;
    step = this.getStepMinute(startTime, endTime);
    let endDate;
    endDate = $('#endDate_' + index).val();
    if (operator === 1) {
      this.endDateOptions[index] = [];
      this.endDateOptions[index] = this.convertTime(endTime, operator, step);
      this.endDateOptions[index].forEach((value) => {
        if (endDate === value) {
          this.endDates[index].time = endDate;
        }
      });
    } else {
      this.startDateOptions[index] = [];
      this.startDateOptions[index] = this.convertTime(startTime, operator, step);
    }
  }

  changeEnd(index) {
    this.optionEndDate = $('#endDate_' + index).val();
    this.generateArrayTime(this.startDateOptions[index][0], this.optionEndDate, index, 0);
  }

  alertAcceptMeeting() {
    const message = this.translateService.instant('MSG.ME0009.ALERT_ACCEPT');
    this.dialogService.showMessage('warning', false, null, message, null, 'MSG.YES', 'MSG.NO').subscribe(
      (resp: DialogResult) => {
        if (resp.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.putAcceptMeeting();
        }
      });
  }


  putAcceptMeeting() {
    const startTime = $('#startDate_' + this.indexSelectedTime).val();
    const endTime = $('#endDate_' + this.indexSelectedTime).val();
    const start = this.calendarCommon.convertDateTimeIso(this.startDates[this.indexSelectedTime].date, startTime);
    const end = this.calendarCommon.convertDateTimeIso(this.endDates[this.indexSelectedTime].date, endTime);
    const frameId = this.meetingRequest.frameMeetingInfo ? this.meetingRequest.frameMeetingInfo.frameId : '';
    const message = '';

    const inputAcceptMeeting = new AcceptMeetingsSendApi(
      this.requestId,
      frameId,
      start,
      end,
      this.place,
      message
    );
    this.meetingService.putAcceptMeeting(inputAcceptMeeting, this.accessToken).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.redirectLogin('MSG.ME0009.E001_2');
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        console.log(error);
      });
  }

  alertRejectMeeting() {
    const alert = this.translateService.instant('MSG.ME0009.E002_2');
    const message = this.translateService.instant('MSG.ME.CONFIRM_REJECT.TITLE');
    this.dialogService.showMessage('warning', false, null, message, null, 'MSG.YES', 'MSG.NO').subscribe(
      (response: DialogResult) => {
        if (response.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          const messageDefault = this.translateService.instant('MSG.ME0009.MESSAGE_DEFAULT');
          this.putRejectMeeting(messageDefault);
        }
      });
  }

  putRejectMeeting(message: string) {
    const inputRejectMeeting = new RejectMeetingsRequest(this.requestId, message, '');
    console.log(inputRejectMeeting);
    this.meetingService.putRejectMeeting(inputRejectMeeting, this.accessToken).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.redirectLogin('MSG.ME0009.E002_1');
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        console.log(error);
      });
  }

  login() {
    this.message = '';
    this.loading = true;
    const params = {
      grant_type: 'password',
      username: this.userInfo.username,
      password: this.userInfo.password,
      save_login: this.userInfo.saveLoginVal ? this.userInfo.saveLoginVal : false,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
    };
    const meetingUrl = `/me/me0007/0/${this.requestId}`;
    if (this.authService.isLogin()) {
      this.router.navigate([meetingUrl]);
      return;
    }

    this.authService.getToken(params.grant_type, params).subscribe((res: NgxOAuthResponse) => {
      // User session
      this.shared.fetchUserSession().subscribe(() => {
        this.loading = false;
        const userSession = this.shared.getUserSession();
        if (userSession.accountStatus.isProvisional) {
          this.router.navigate(['/re/first-entry']);
        } else if (userSession.accountStatus.isValid) {
          this.router.navigate([meetingUrl]);
        }
      }, () => {
        this.loading = false;
        this.authService.clearToken();
        this.dialogService.showError('MSG.ERROR');
      });
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

  redirectLogin(message: string) {
    const content = this.translateService.instant(message);
    this.dialogService.showMessage('success', false, null, null, content, 'MSG.OK', null).subscribe((resp: DialogResult) => {
      if (resp.isOk()) {
        this.router.navigate(['/']);
      }
    });
  }

  printPage() {
    const css = '@page { layout: portrait; size: A4}, @media print {html, body {width: 210mm;height: 297mm;}}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    const titleTop = $('.titleTop');
    const loginBlock = $('#login-block');
    style.type = 'text/css';
    style.media = 'print';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    loginBlock.hide();
    // titleTop.hide();
    window.print();
    loginBlock.show();
    // titleTop.show();
    return false;
  }

}
