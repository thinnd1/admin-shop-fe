import {Component, OnInit, HostListener} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {MeetingRuleSettings} from '../../../models/me/meeting-rule-settings';
import {DialogService} from '../../../services/dialog.service';
import {MeetingRuleSettingsSendApi} from '../../../models/me/meeting-rule-settings-send-api';
import {SharedValueService} from 'app/services/shared-value.service';
import {DialogResult} from '../../../models/dialog-param';
import {HttpError} from '../../../common/error/http.error';
import * as sha256 from 'sha256';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {AttachedFilesComponent} from '../../../components/attached-files/attached-files.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

const MAX_SIZE = 128 * 1024 * 1024;

@Component({
  selector: 'app-me0023-page',
  templateUrl: './me0023-page.component.html',
  styleUrls: ['./me0023-page.component.scss'],
  providers: [AttachedFilesComponent]
})
export class Me0023PageComponent implements OnInit {
  public model = new MeetingRuleSettings();
  fileName: any;
  attachments = [];
  listAttachments = [];
  removeAttachments = [];
  rule: string;
  officeId: string;
  officeUserId: string;
  statusChange = false;
  userSession;
  public editRuleMeeting = false;
  public msgMe0023;

  constructor(private meetingService: MeetingService,
              private dialogService: DialogService,
              private storage: FirebaseStorage,
              private sharedValueService: SharedValueService,
              private route: Router, private location: Location, private translate: TranslateService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.officeUserId = this.userSession.officeUserId;
    this.officeId = this.userSession.officeId;
    this.getMettingsRuleSettings();
    this.translate.get('ME0023').subscribe(
      (res) => {
        this.msgMe0023 = res;
      }
    );
  }

  getMettingsRuleSettings() {
    this.meetingService.getMeetingRuleSettings().subscribe((settings: MeetingRuleSettings) => {
      this.model = settings;
      this.attachments = this.model['attachments'];
      this.rule = this.model.rule;
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  onChange(event: any) {
    this.changeRuleMeeting();
    let file = event.target.files[0];
    if (file.size > MAX_SIZE) {
      this.dialogService.showError('ME0023.ERROR_MAX_SIZE_UPLOAD');
      return;
    }
    this.statusChange = true;
    this.fileName = [].slice.call(event.target.files);
    const fieldElement = {};
    for (let i = 0; i < this.fileName.length; i++) {
      fieldElement['id'] = '';
      let unixtime = new Date().getTime();
      fieldElement['fileId'] = sha256(`${this.officeId}${unixtime}`);
      fieldElement['fileName'] = this.fileName[i]['name'];
      fieldElement['file'] = this.fileName[i];
      this.attachments.push(fieldElement);
    }
  }

  showTextFileName(name: string) {
    if (name.length > 20) {
      name = name.slice(0, 20) + '...';
    }
    return name;
  }

  removeAttachmentSettings(id, fileId, file) {
    this.changeRuleMeeting();
    this.statusChange = true;
    this.listAttachments = [];
    if (fileId) {
      this.removeAttachments.push(fileId);
    }
    this.attachments.splice(id, 1);
  }

  @HostListener('window:beforeunload', ['$event'])
  checkLoadPage() {
    console.log('dsdsd event --------', event);

    this.dialogService.showMessage('warning', false, 'ME0023.MSG_TITLE', 'ME0023.MSG_RELOAD', null, 'MSG.STAY_ON', 'MSG.LEAVE').subscribe(
      (res: DialogResult) => {
        if (res.buttonName === 'ok') {
          setTimeout(() => {
            this.route.navigate(['']);
          }, 300);
        }
      }
    );
    return false;
  }

  putMeetingRuleSetting() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    if (this.rule.length > 3000) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('ME0023.MSG_MAX_LENGTH');
      return false;
    }

    this.attachments.filter(item => {
      if (item.id === '') {
        this.listAttachments.push(item);
      }
    });

    let totalFileUpload = this.listAttachments.length;

    if (totalFileUpload > 0) {
      for (let i = 0; i < this.listAttachments.length; i++) {
        this.storage.uploader.meRule(this.officeId, this.officeUserId, this.listAttachments[i].fileId, this.listAttachments[i].file).subscribe(
          (data) => {
            if (data.done) {
              totalFileUpload = totalFileUpload - 1;
              if (totalFileUpload < 1) {
                this.subPutMeetingRuleSetting();
              }
            }
          }, (error) => {
            this.dialogService.showError('MSG.ERROR');
          });
      }
    } else {
      this.subPutMeetingRuleSetting();
    }
  }

  subPutMeetingRuleSetting() {
    const setings = new MeetingRuleSettingsSendApi(this.officeId, this.rule, this.listAttachments, this.removeAttachments);
    this.meetingService.putMeetingRuleSettings(setings).subscribe(response => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.editRuleMeeting = false;
      this.dialogService.showSuccess('MSG.SAVED');
      this.statusChange = false;
      this.listAttachments = [];
      this.removeAttachments = [];
      this.getMettingsRuleSettings();
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
      this.ngOnInit();
    });
  }

  changeRuleMeeting() {
    this.editRuleMeeting = true;
  }

  backPage() {
    if (this.editRuleMeeting) {
      const html = '<p>' + 'muon thoat khong ' + '</p>' + '<p>' + this.msgMe0023.BACK_PAGE2 + '</p>';
      this.dialogService.showMessage('', false, null, null, html, 'MSG.STAY_ON', 'MSG.LEAVE').subscribe(
        (res: DialogResult) => {
         if (res.isCancel()) {
           this.location.back();
         }
        }
      );
    } else {
      this.location.back();
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putMeetingRuleSetting();
  //   }
  // }
}
