import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MeetingService} from '../../../services/meeting.service';
import {MeetingProfileDoctor} from '../../../models/me/meeting-profile-doctor';
import {DialogService} from '../../../services/dialog.service';
import {Helper} from '../../../common/helper';
import {ModelInput} from '../../../common/meeting-common';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';

@Component({
  selector: 'app-me0036-page',
  templateUrl: './me0036-page.component.html',
  styleUrls: ['./me0036-page.component.scss']
})
export class Me0036PageComponent implements OnInit {
  userId: string;
  officeId: string;
  modelMeetingProfileDr = new MeetingProfileDoctor();
  fieldIds = [];
  departmentName: string;
  userSession: UserSession;

  constructor(private dialogService: DialogService, private router: Router,
              private meetingService: MeetingService,
              private activatedRoute: ActivatedRoute,
              private  helper: Helper,
              private titleService: Title,
              private translate: TranslateService,
              private sharedValueService: SharedValueService,
              private wsService: WsService) {
    this.userSession = this.sharedValueService.getUserSession();
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.userId = param['userId'];
      this.officeId = param['officeId'];
    });
    this.titleService.setTitle(this.translate.instant('ME0036.TITLE'));
    this.getMeetingProfileDr();
  }

  getMeetingProfileDr() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getDataMeetingDr(this.userId, this.officeId).subscribe((response: MeetingProfileDoctor) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelMeetingProfileDr = response;
      this.helper.checkDataEmpty(this.modelMeetingProfileDr, ['imageUrl']);
      this.formatDepartmentName(this.modelMeetingProfileDr);
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  redirectChatroom() {
    const requestId = this.userSession.userId + Date.now();
    const data = {
      'type': 'get_room',
      'user': this.userSession.officeUserId,
      'request_id': requestId,
      'dr': this.modelMeetingProfileDr.officeUserId,
      'pr': this.userSession.officeUserId
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

  redirectMe0028() {
    // check jobType, number frame
    this.meetingService.getAspirationMeeting(this.userId, this.officeId).subscribe(
      (res) => {
        if (res.jobType === 'J0022' || res.jobType === 'J0029' || res.meetingFrames.length > 0) {
          this.router.navigate(['me/me0028', this.userId, this.officeId]);
        } else {
          this.router.navigate(['me/me0029', this.userId, this.officeId, ModelInput.FUTURE, '']);
        }
      },
      (error) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  formatDepartmentName(modelMeetingProfileDr) {
    if (modelMeetingProfileDr.department.path !== '') {
      let result;
      result = modelMeetingProfileDr.department.path.slice(1, -1).replace(/\//g, ' | ');
      if (!result) {
        this.departmentName = (modelMeetingProfileDr.department.displayName) ? modelMeetingProfileDr.department.displayName :
          modelMeetingProfileDr.department.name;
      } else {
        this.departmentName = result;
      }
    } else {
      this.departmentName = '―';
    }

  }
}
