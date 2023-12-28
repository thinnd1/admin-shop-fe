import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit} from '@angular/core';
import {MeetingStatus} from '../../models/me/meeting-status';
import {UserSession} from '../../models/ba/user-session';
import {SharedValueService} from '../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
declare var moment: any;

@Component({
  selector: 'app-request-meeting-pr',
  templateUrl: './request-meeting-pr.component.html',
  styleUrls: ['./request-meeting-pr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestMeetingPrComponent implements OnInit, OnChanges {
  @Input() meeting: MeetingStatus;
  public userSession: UserSession;
  public meTranslate: any;
  public drInfo: any;

  constructor(private shareValueService: SharedValueService, private translate: TranslateService, private router: Router,
              private cd: ChangeDetectorRef) {
    this.userSession = this.shareValueService.getUserSession();

    this.translate.get('MSG.ME').subscribe(
      (res) => {
        this.meTranslate = res;
      }
    );
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.meeting) {
      this.drInfo = this.getInfoMiniProfileUser(this.meeting.doctor, this.meeting);
    }
  }

  getInfoMiniProfileUser(user: any, meeting: any) {
    const firstName = (user.accountStatus === 'INVALID') ? 'アカウント削除' + ' (' + user.officeName + ')' :
      user.firstName + ' (' + user.officeName + ')';
    const info = {
      invalid: user.accountStatus === 'INVALID',
      firstName: firstName,
      lastName: user.lastName,
      imageUrl: user.image,
      firstNameKana: user.firstNameKana,
      lastNameKana: user.lastNameKana,
      officeName: user.officeName,
      department: {
        name: ''
      },
      purposeMeeting: (meeting.inputType === 'DELIVERY_DOC') ?
        (this.meTranslate.MEETING_REQUEST.PURPOSE + ': ' + this.meTranslate.PURPOSE_SEND_DOCUMENT + meeting.purposeName) :
        (this.meTranslate.MEETING_REQUEST.PURPOSE + ': ' + meeting.purposeName)
    };
    return info;
  }

  checkMediatorActionRequest(request: MeetingStatus) {
    if (request.mediator) {
      // check creater is mediator
      return true;
    } else {
      // check accepter is mediator
      if (request.status === 'FIXED' || request.status === 'FIXED') {
        if (request.accepter && request.doctor.userId !== request.accepter.userId && request.mr.userId !== request.accepter.userId) {
          return true;
        }
      }

      // check canceler is mediator
      if (request.status === 'CANCELED') {
        if ((request.canceler && request.doctor.userId !== request.canceler.userId && request.mr.userId !== request.canceler.userId) ||
          (request.accepter && request.doctor.userId !== request.accepter.userId && request.mr.userId !== request.accepter.userId)) {
          return true;
        }
      }
    }
    return false;
  }

  checkEventMeetingStatus(event) {
    let status = event.status;

    if (event.status === 'NEW') {
      status = (event.senderType === 'DR' || event.senderType === 'MD') ? 'NEW' : 'REQUESTING';
    } else if (event.status === 'FIXED') {
      let date = new Date();
      date = moment(date).format();
      if (moment(event.fixedEnd).isSameOrBefore(date)) {
        status = 'DONE';
      }
    }
    return status;
  }

  updateInfoImageUrl() {
    this.cd.markForCheck();
  }
}
