///<reference path="../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../common/helper';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {DialogService} from '../../services/dialog.service';
import {AccountStatus, UserSession} from '../../models/ba/user-session';
import {SharedValueService} from '../../services/shared-value.service';
import {RegistrationService} from '../../services/registration.service';
import {Observable} from 'rxjs/Observable';
import {GroupService} from '../../services/group.service';
import {DialogResult} from '../../models/dialog-param';
import {AttachmentTextBoxFileUploadComponent} from '../attachment-text-box-file-upload/attachment-text-box-file-upload.component';
import {PharmacyService} from '../../services/pharmacy.service';

declare const $: any;

@Component({
  selector: 'app-report-comment-list',
  templateUrl: './report-comment-list.component.html',
  styleUrls: ['./report-comment-list.component.scss'],
  preserveWhitespaces: false
})
export class ReportCommentListComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('fileUpload')
  fileUpload: AttachmentTextBoxFileUploadComponent;
  @Input() newComment = [];
  @Input() progress = 0;
  @Input() attachmentPath;
  @Output() onCreateComment = new EventEmitter<any>();
  listUserInfo: any[] = [];
  userSession: UserSession;
  listAttachments: any[] = [];
  textContents = '';
  listUsers = [];
  listComments = [];
  textboxOptions: {};
  listTemplate: any[] = [];
  constructor(private translate: TranslateService,
              private groupService: GroupService,
              private dialogService: DialogService,
              private shareValue: SharedValueService,
              private registrationService: RegistrationService,
              private helper: Helper,
              private pharmacyService: PharmacyService) {
    this.getTemplate();
  }

  ngOnInit() {
    this.userSession = this.shareValue.getUserSession();
    this.listUsers.push(this.userSession.officeUserId);
    this.getUserInfo(this.listUsers).subscribe();
    this.textboxOptions = {
      row: 1,
      maxHeight: 300,
      placeholder: this.translate.instant('GROUPBOARD_CONTRIBUTION.REPLY_PLACEHOLDER')
    };
  }

  ngAfterViewInit() {
    this.displayTooltip(1);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['progress']) {
      if (this.progress === 100) {
        this.textContents = '';
        this.listAttachments = [];
      }
    }
    if (changes['newComment'] && changes['newComment'].currentValue) {
      this.getListUserInfo(this.newComment);
    }
    if (changes['progress']) {
      if (changes['progress'].currentValue === 100) {
        this.clearInput();
      }
    }
  }

  updateView() {
    for (let i = this.listComments.length; i < this.newComment.length; i++) {
      this.listComments.push(this.newComment[i]);
    }
  }

  getListUserInfo(listComments) {
    const listNewUser = [];
    for (let i = 0; i < listComments.length; i++) {
      const userId = listComments[i].officeUserId;
      if (this.listUsers.indexOf(userId) < 0) {
        this.listUsers.push(userId);
        listNewUser.push(userId);
      }
    }
    this.getUserInfo(listNewUser).subscribe(
      () => {}, () => {}, () => {
      // after finishing load all user info then update View
      this.updateView();
    });
  }

  getUserInfo(listUser): Observable<any> {
    return Observable.create(subscribe => {
      if (listUser.length === 0) {
        subscribe.complete();
      }
      const listReq = listUser.map(item => {
        return this.groupService.getUser(item);
      });
      Observable.forkJoin(listReq).subscribe((userList: any[]) => {
        userList.forEach(user => {
          this.listUserInfo.push(user);
        });
        subscribe.next();
        subscribe.complete();
      }, err => {
        subscribe.error(err);
        subscribe.complete();
      });
    });
  }

  displayTooltip(event) {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // getDetailUser(event, user: any) {
  //   event.preventDefault();
  //   $('.tooltip').remove();
  //   if (new AccountStatus(user.accountStatus).isValid && !new AccountStatus(user.accountStatus).isLocking) {
  //     this.dialogService.setLoaderVisible(true);
  //   }
  // }

  getCreatedAt(value: string, format: string) {
    return this.helper.convertDateTime(value, format);
  }

  inputChange(value) {
    this.textContents = value;
  }

  removeFile(index: number) {
    this.listAttachments.splice(index, 1);
  }

  changeFields(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.clickConfirm(1);
    }
  }

  clickConfirm(event: any) {
    if (!this.fileUpload.checkValidateFiles([])) {
      return;
    }
    if (this.textContents.trim() !== '') {
      if (this.textContents.length > 3000) {
        this.dialogService.showMessage('warning', false, null, 'PHARMACY.COMMON.MSG_COMMENT_LENGTH',
          null, 'MSG.OK', null).subscribe((res: DialogResult) => {
          if (res.isOk()) {
            return;
          }
        });
      } else {
        /* validate text for each keyword */
        if (this.helper.checkNGKeyword(this.textContents)) {
          let html = '';
          let obj = {};
          this.translate.get('GR0013').subscribe(msg => {
            html = '<div> ' + msg.CONTENT_NG_KEYWORD_CHECKBOX + '</div>';
            obj = {
              checked: false,
              confirmText: msg.NG_KEYWORD_CHECKBOX_LBL,
              isConfirm: true,
              disablePositive: true
            };
          });
          this.dialogService.showCheckboxDialog('warning', false, 'GR0013.TITLE_NG_KEYWORD_CHECKBOX',
            null, html, 'MSG.OK', 'MSG.CANCEL', obj, null, null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.onCreateComment.emit({attachments: this.listAttachments, content: this.textContents});
              }
            });
        } else {
          this.onCreateComment.emit({attachments: this.listAttachments, content: this.textContents});
        }
      }
    }
  }

  clearInput() {
    this.listAttachments = [];
    this.textContents = '';
  }
  showUserInfo($event) {
    $event.preventDefault();
  }
  detailUserDialog(user: any) {
    if (new AccountStatus(user.accountStatus).isValid && !new AccountStatus(user.accountStatus).isLocking) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.groupService.getDetailUser(user.id).subscribe(res => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showStaffDetailsDialog(null, {data: res, officeUserId: 'dr'});
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    } else if (new AccountStatus(user.accountStatus).isLocking && new AccountStatus(user.accountStatus).isValid) {
      let html = '';
      this.translate.get('MSG.GR.LOCKED_ACCOUNT_PROFILE_POPUP').subscribe(msg => {
        html = '<div><h1 class="font-weight-bold">' + msg.MSG_1 + '<br>' + msg.MSG_2 + '</h1></div><br><div>' + msg.MSG_3 + '</div><div>' + msg.MSG_4 + '</div>';
      });
      this.dialogService.showMessage('error', false, null, null, html, 'MSG.OK', null).subscribe();
    }
  }

  getDetailUser($event, user: any) {
    $event.preventDefault();
    this.detailUserDialog(user);
  }
  getTemplate() {
    this.pharmacyService.getTemplate().subscribe((res) => {
      this.listTemplate = res;
    });
  }
  onSelectTemplate(obj) {
    this.textContents += obj.templateContent;
  }
  updateTemplate($event) {
    this.getTemplate();
  }
}
