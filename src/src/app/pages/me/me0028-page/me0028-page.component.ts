import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MeetingService} from '../../../services/meeting.service';
import {AspirationMeeting} from '../../../models/me/aspiration-meeting';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {AttachedFilesComponent} from '../../../components/attached-files/attached-files.component';
import {DialogService} from '../../../services/dialog.service';
import {ModelInput} from '../../../common/meeting-common';
import {Helper} from '../../../common/helper';
import { saveAs } from 'file-saver/FileSaver';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';

declare var moment: any;

@Component({
  selector: 'app-me0028-page',
  templateUrl: './me0028-page.component.html',
  styleUrls: ['./me0028-page.component.scss'],
  providers: [AttachedFilesComponent]
})
export class Me0028PageComponent implements OnInit, OnDestroy {
  public ModelInput: typeof ModelInput = ModelInput;
  modelAspirationMeeting = new AspirationMeeting();
  userId: string;
  officeId: string;
  aspirationOne = [];
  aspirationTwo = [];
  meetingFrames = [];
  meetingFramesCollage = [];
  attachmentFile: any;
  aspirationNull: boolean;
  PROVISIONAL: any;
  showbutton= false;
  const: any = {};
  msgStore: any = {};
  userSession: UserSession;
  constructor(private dialogService: DialogService, private router: Router, private translate: TranslateService,
              private meetingService: MeetingService, private activatedRoute: ActivatedRoute,
              private firebaseStorage: FirebaseStorage, private attachedFilesComponent: AttachedFilesComponent, private helper: Helper,
              private titleService: Title, private sharedValueService: SharedValueService, private wsService: WsService) {
    this.PROVISIONAL = 1;
    this.const = {
      status: {
        new: 'NEW',
        fixed: 'FIXED',
        cancel: 'CANCELED'
      },
      applyStatus: {
        notApplied: 'NONE',
        waiting: 'NEW',
        refuse: 'CANCELED',
        accept: 'FIXED',
        cancel: 'SELF_CANCEL'
      }
    };
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((param: any) => {
      this.userId = param['userId'];
      this.officeId = param['officeId'];
    });
    this.titleService.setTitle(this.translate.instant('ME0028.TITLE'));
    this.translate.get('ME0028').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.getAspirationMeeting();
  }

  getAttachment() {
    if (this.modelAspirationMeeting.attachment && this.modelAspirationMeeting.attachment.length > 0) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.meetingService.getAttachmentsMeeting(this.officeId, this.modelAspirationMeeting.attachment).subscribe(attachmentFile => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.attachmentFile = attachmentFile;
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    }
  }

  // get API /dr/me/aspiration_meeting
  getAspirationMeeting() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getAspirationMeeting(this.userId, this.officeId).subscribe((response: AspirationMeeting) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelAspirationMeeting = response;
      this.helper.checkDataEmpty(this.modelAspirationMeeting, ['imageUrl']);
      this.splitAspirations(this.modelAspirationMeeting.aspirations);
      this.meetingFrames = this.modelAspirationMeeting.meetingFrames.reverse();
      if (this.meetingFrames.length > 0) {
        this.showbutton = true;
      }
      this.filterMeetingFrame(this.meetingFrames);
      this.getAttachment();
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  // getFileType(file) {
  //   const fileImage = file.mimeType.substring(0, 5);
  //   if (fileImage === 'image') {
  //     return fileImage;
  //   }
  // }

  splitAspirations(aspirations) {
    this.aspirationOne = [];
    this.aspirationTwo = [];
    if (aspirations.length === 0) {
      this.aspirationNull = true;
    } else {
      aspirations.forEach((value, key) => {
        if (key % 2 === 0) {
          this.aspirationOne.push(value);
        } else {
          this.aspirationTwo.push(value);
        }
      });
    }

  }

  redirectChatroom() {
    const requestId = this.userSession.userId + Date.now();
    const data = {
      'type': 'get_room',
      'user': this.userSession.officeUserId,
      'request_id': requestId,
      'dr': this.modelAspirationMeeting.officeUserId,
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

  registerMeeting() {
    this.router.navigate(['me/me0029', this.userId, this.officeId, ModelInput.FUTURE, '']);
  }

  sendDocument() {
    this.router.navigate(['me/me0029', this.userId, this.officeId, ModelInput.DOCUMENT, '']);
  }

  downloadDocRule(file) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.responseType = 'blob';
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4) {
        const blob = new Blob([xhttp.response], {type: file.type});
        saveAs(blob, file.name);
        setTimeout(() => {
          self.dialogService.setLoaderVisible(false);
        });
      }
    };
    xhttp.open('GET', file.url, true);
    xhttp.send();
  }

  redirectApplyFrameMeeting(frameId: string) {
    this.router.navigate(['me/me0033', frameId]);
  }

  filterMeetingFrame(meetingFrames) {
    const monthFilter = [];
    const twoMonthAfter = moment().add(2, 'month');
    const now = moment();
    if (meetingFrames.length > 0) {
      meetingFrames.forEach((value) => {
        value.displayStatus = this.getDisplayStatus(value);
        const start = moment(value.start);
        if (start.isSameOrAfter(now, 'day') && start.isBefore(twoMonthAfter, 'day')) {
          monthFilter.push(value);
        }
      });
      this.meetingFramesCollage = monthFilter;
      if (monthFilter.length === meetingFrames.length) {
        this.showbutton = false;
      }
    }
  }

  getDisplayStatus(record) {
    const applyStatus = record.applyStatus;
    let displayStatus = '';
    if (record.status === this.const.status.new) {
      displayStatus = 'NEW';
      if (applyStatus === this.const.applyStatus.waiting) {
        displayStatus = 'APPLY';
      }
      if (applyStatus === this.const.applyStatus.refuse) {
        displayStatus = 'CANCEL';
      }
      if (applyStatus === this.const.applyStatus.cancel) {
        displayStatus = 'NEW';
      }
    }
    if (record.status === this.const.status.cancel) {
      displayStatus = 'CANCEL';
    }
    if (record.status === this.const.status.fixed) {
      displayStatus = 'END';
    }
    return displayStatus;
  }

  getAllMeetingFrames() {
    this.meetingFramesCollage = [];
    this.meetingFramesCollage = this.meetingFrames;
    this.showbutton = false;
  }

  ngOnDestroy() {
    window.scrollTo(0, 0);
  }
}
