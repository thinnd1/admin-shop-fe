import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HttpStatus} from '../../../common/http.status';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {MeetingProfileAssignee} from '../../../models/me/meeting-profile-assignee';
import {MeetingService} from '../../../services/meeting.service';
import {Helper} from '../../../common/helper';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {Title} from '@angular/platform-browser';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';

declare const $: any;

@Component({
  selector: 'app-me0004-page',
  templateUrl: './me0004-page.component.html',
  styleUrls: ['./me0004-page.component.scss']
})
export class Me0004PageComponent implements OnInit {
  modelProfileAssignee = new MeetingProfileAssignee();
  handleDrugs = [];
  handleFields = [];
  handleOffices = [];
  userSession: any;
  userId: string;
  officeId: string;
  authorityRequestMeeting: boolean;

  constructor(private dialogService: DialogService, private translate: TranslateService, private router: Router,
              private meetingService: MeetingService, private shareValue: SharedValueService,
              private activatedRoute: ActivatedRoute, private  helper: Helper, private titleService: Title,
              private wsService: WsService) {
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }

  }
  ngOnInit() {
    this.helper.setScrollTop();
    this.activatedRoute.params.subscribe((param: any) => {
      this.userId = param['userId'];
      this.officeId = param['officeId'];
    });
    this.titleService.setTitle(this.translate.instant('ME0004.TITLE'));
    this.userSession = this.shareValue.getUserSession();
    this.checkAuthorityRequestMeeting();
    this.getProfileAssignee();
  }

  getProfileAssignee() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getAssignee(this.userId, this.officeId).subscribe((response: MeetingProfileAssignee) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelProfileAssignee = response;
      this.helper.checkDataEmpty(this.modelProfileAssignee);
      this.handleDrugs = this.modelProfileAssignee.handleDrugs;
      this.handleFields = this.modelProfileAssignee.handleFields;
      this.handleOffices = this.modelProfileAssignee.handleOffices;
      console.log(this.handleDrugs);
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }
  routeMessageAssignee() {
    if (this.modelProfileAssignee.blockStatus === true) {
      event.preventDefault();
      return false;
    }

    const requestId = this.userSession.userId + Date.now();
    const data = {
      'type': 'get_room',
      'user': this.userSession.officeUserId,
      'request_id': requestId,
      'dr': this.userSession.officeUserId,
      'pr': this.modelProfileAssignee.officeUserId
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

  routeRequestDirect() {
    if (this.modelProfileAssignee.blockStatus === true) {
      event.preventDefault();
      return false;
    }

    this.router.navigate(['me/me0006', this.userId, this.officeId, '']);
  }

  changeStatusblockUser(blockStatus: boolean) {
    let message;
    (this.modelProfileAssignee.blockStatus === false) ? message = 'MSG.ME0004.P001_1' : message = 'MSG.ME0004.P002_1';
    this.dialogService.showMessage('warning', false, null, message, null, 'MSG.YES', 'MSG.NO').subscribe(
      (resp: DialogResult) => {
        if (resp.isOk()) {
          if (blockStatus) {
            this.blockUser();
          } else {
            this.unBlockUser();
          }
        }
      });
  }

  blockUser() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.blockUser(this.userSession.userId, this.userSession.officeId, this.userId, this.officeId).subscribe((res: Response) => {
      if (res.status === HttpStatus.NotContent) {
        this.modelProfileAssignee.blockStatus = true;
      }
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('ME0004.BLOCK_USER');
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  unBlockUser() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.unBlockUser(this.userSession.userId, this.userSession.officeId, this.userId, this.officeId).subscribe((res: Response) => {
      if (res.status === HttpStatus.NotContent) {
        this.modelProfileAssignee.blockStatus = false;
      }
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('ME0004.UNBLOCK_USER');
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  checkAuthorityRequestMeeting() {
    if (this.userSession) {
      this.authorityRequestMeeting = this.userSession.funcAuthority.FP_1;
    }
  }

}
