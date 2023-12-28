import {Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../services/group.service';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Helper} from '../../common/helper';
import {EditArticleSettings} from '../../models/gr/edit-article-settings';
import {DialogResult} from '../../models/dialog-param';
import EventType = FirebaseDatabase.EventType;
import {FirAttachments} from '../../models/gr/firebase/fir.attachments';
import {DialogService} from '../../services/dialog.service';
import {GroupType} from '../../models/gr/firebase/fir.group';
import {Subject} from 'rxjs/Subject';
import {AccountStatus} from '../../models/ba/user-session';
import * as loadImage from 'blueimp-load-image';

const MAX_SIZE = 128 * 1024 * 1024;
const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;

@Component({
  selector: 'app-groupboard-contribution',
  templateUrl: './groupboard-contribution.component.html',
  styleUrls: ['./groupboard-contribution.component.scss'],
  preserveWhitespaces: false
})
export class GroupboardContributionComponent implements OnInit, OnChanges {
  @Input('groupInfo') groupInfo: any;
  @Input() isEdit: boolean;
  @Input('model') model: any;
  @Input() articleId: string;
  @Input() commentId: string;
  @Input() userIds: string[];
  @Input() listAttachments: FirAttachments[] = [];
  @Input() userSession: any;
  @Input() listMember: any[] = [];

  public isReply = false;
  public isCreateArticle = false;
  public listMemberValid: any[] = [];
  public modelStorage = new EditArticleSettings();
  isResetToUserList = false;
  isGroupOutside;
  _listAttachments = [];

  groupboardContributionTextareaPlaceholder = '';
  submitText;
  debounce = 400;
  submitDebounce: any;
  contentChanged: Subject<string> = new Subject<string>();
  uploadedList = [];
  comparisons = [];
  options = {
    canvas: true,
    pixelRatio: window.devicePixelRatio,
    downsamplingRatio: 0.6,
    orientation: true,
    maxWidth: 500,
    maxHeight: 500
  };
  isSending: boolean;

  constructor(private router: Router,
              private translate: TranslateService,
              private groupService: GroupService,
              private helper: Helper,
              private dialogService: DialogService,
              private firebaseStorage: FirebaseStorage,
              private firebaseDatabase: FirebaseDatabase,
              private activatedRoute: ActivatedRoute,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    let language = [];
    this.translate.get('GROUPBOARD_CONTRIBUTION').subscribe((msg) => {
      language = msg;
      this.submitText = language['REGIST'];
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      if (this.groupInfo) {
        // テンプレート切り分け
        if (!this.model) {
          if (!this.articleId && !this.commentId) {
            // 記事投稿
            this.groupboardContributionTextareaPlaceholder = language['PLACEHOLDER'];
            this.submitText = language['REGIST'];
            this.isCreateArticle = true;
          } else if (this.articleId) {
            // コメント投稿
            this.groupboardContributionTextareaPlaceholder = language['REPLY_PLACEHOLDER'];
            this.submitText = language['REPLY_REGIST'];
            this.isReply = true;
          }
        } else {
          if (this.articleId || this.articleId && this.commentId) {
            // 記事編集 && コメント編集
            this.submitText = language['EDIT'];
          } else {
          }
        }
      }
    });
    this.submitDebounce = this.helper.debounce(this.clickSubmit, this.debounce, true);
    this.saveTemporaryArticleContent();
  }

  private _detectchanges() {
    if (!this._changeDetectorRef['destroyed']) {
      this._changeDetectorRef.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupInfo'] && this.groupInfo) {
      this.isGroupOutside = this.groupInfo.type === GroupType.Outside;
      this.uploadedList = [];
      this.comparisons = [];
      this.modelStorage = new EditArticleSettings();
      this.getCachedArticleContent();
    }
    if (changes['listMember'] && this.listMember.length > 0) {
      // The TO list only includes valid members (confirmed: 2018/06/02)
      this.listMemberValid = JSON.parse(JSON.stringify(this.listMember));
      this.listMemberValid = this.listMemberValid.filter(mem => mem.id !== this.userSession.officeUserId &&
        !new AccountStatus(mem.accountStatus).isLocking && new AccountStatus(mem.accountStatus).isValid ||
        mem.id !== this.userSession.officeUserId && !new AccountStatus(mem.accountStatus).isLocking && new AccountStatus(mem.accountStatus).isProvisional);
      for (let i = 0; i < this.listMemberValid.length; i++) {
        this.listMemberValid[i].isShow = true;
        this.listMemberValid[i].isSelected = false;
      }
    }
    if (changes['articleId'] || changes['commentId']) {
      this.uploadedList = [];
      this.comparisons = [];
    }
    if (changes['listAttachments'] || this.isEdit) {
      this._listAttachments = this.listAttachments.slice();
    }
    if (changes['userIds']) {
      if (this.isReply) {
        this.modelStorage.toUser = [];
        for (let i = 0; i < this.userIds.length; i++) {
          if (this.listMemberValid.findIndex(item => item.id === this.userIds[i]) > -1) {
            this.modelStorage.toUser.push(this.userIds[i]);
          }
        }
        // sort:  the author of the article, commentator, listToUser
        for (let index = 0; index < this.listMemberValid.length; index++) {
          this.listMemberValid[index].isSelected = this.userIds.indexOf(this.listMemberValid[index].id) > -1;
        }
      }
    }
    if (this.model) {
      this.modelStorage = JSON.parse(JSON.stringify(this.model));
      const len = this.listMemberValid.length;
      for (let i = 0; i < len; i++) {
        this.listMemberValid[i].isSelected = this.modelStorage.toUser.indexOf(this.listMemberValid[i].id) !== -1;
      }
    }
  }

  getCachedArticleContent() {
    if (this.isCreateArticle) {
      this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}/temporaryArticleContent`)
        .once(EventType.Value).then(snap => {
        if (snap.val()) {
          this.modelStorage.contents = snap.val();
        }
      }, error => {
      });
    }
  }

  changeArticleContent(text: string) {
    if (this.isCreateArticle) {
      this.contentChanged.next(text);
    }
  }

  saveTemporaryArticleContent() {
    this.contentChanged
      .debounceTime(500) // wait 500ms after the last event before emitting last event
      .distinctUntilChanged()
      .subscribe(model => {
        if (navigator.onLine) {
          const value = model.length > 0 ? model : null;
          this.firebaseDatabase.set(`/user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}/temporaryArticleContent`,
            value).subscribe();
        }
      });
  }

  removeMember(member: any) {
    if (member) {
      for (let i = 0; i < this.listMemberValid.length; i++) {
        if (this.listMemberValid[i].id === member.id) {
          this.listMemberValid[i].isSelected = false;
        }
      }
      if (this.modelStorage.toUser.indexOf(member.id) > -1) {
        this.modelStorage.toUser.splice(this.modelStorage.toUser.indexOf(member.id), 1);
      }
    }
  }

  destinationPopoverSelected(member: any) {
    if (this.modelStorage.toUser.indexOf(member.id) === -1 && member.isSelected) {
      this.modelStorage.toUser.push(member.id);
    } else if (!member.isSelected && this.modelStorage.toUser.indexOf(member.id) > -1) {
      this.modelStorage.toUser.splice(this.modelStorage.toUser.indexOf(member.id), 1);
    }
  }

  changeFields(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.submitDebounce();
    }
  }

  removeTooptip(event) {
    $('.tooltip').remove();
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      const newFilesArr = this.removeDuplicates(event.target.files);
      this.checkValidateFiles(newFilesArr);
    }
    event.target.value = null;
  }

  getOrientedImg(fileObj: any) {
    if (this.checkOrientedImage(fileObj)) {
      const img = loadImage(fileObj, (canvas) => {
        if (canvas.type === 'error') {
          this.uploadedList.push(fileObj);
          this._detectchanges();
        } else {
          canvas.toBlob(blob => {
            const newFile: any = blob;
            newFile['name'] = fileObj.name;
            newFile['width'] = canvas.width;
            newFile['height'] = canvas.height;
            if (img.naturalWidth >= MAX_WIDTH || img.naturalHeight > MAX_HEIGHT) {
              fileObj['_thumb'] = newFile;
            }
            const originalAspectRatio = img.naturalWidth / img.naturalHeight;
            const thumbnailRatio = canvas.width / canvas.height;
            const orientationChanged = !((originalAspectRatio > 1 && thumbnailRatio > 1) || (originalAspectRatio <= 1 && thumbnailRatio <= 1));
            fileObj['width'] = orientationChanged ? img.naturalHeight : img.naturalWidth;
            fileObj['height'] = orientationChanged ? img.naturalWidth : img.naturalHeight;
            fileObj['isImage'] = true;
            this.uploadedList.push(fileObj);
            this._detectchanges();
          });
        }
      }, this.options);
    } else {
      this.uploadedList.push(fileObj);
      this._detectchanges();
    }
  }

  getComparison(file: any): string {
    return file.name + file.size + file.lastModified + file.type;
  }

  removeDuplicates(newObjects: any[]): any[] {
    const result = [];
    for (let j = 0; j < newObjects.length; j++) {
      newObjects[j]['comparison'] = this.getComparison(newObjects[j]);
      if (this.comparisons.indexOf(newObjects[j]['comparison']) === -1) {
        result.push(newObjects[j]);
        this.comparisons.push(newObjects[j]['comparison']);
      }
    }
    return result;
  }

  checkImageFile(file: File) {
    return (file.size < MAX_SIZE && file.type.startsWith('image'));
  }

  checkOrientedImage(file: File) {
    return (file.size < MAX_SIZE && file.type.startsWith('image') && file.type !== 'image/gif');
  }

  removeOldFile(file) {
    if (file) {
      const id = file.original_file_id ? file.original_file_id : file.fileId;
      if (this.modelStorage.attachments.indexOf(id) > -1) {
        this.modelStorage.attachments.splice(this.modelStorage.attachments.indexOf(id), 1);
      }
      if (this._listAttachments.findIndex(f => f.fileId === file.fileId) > -1) {
        this._listAttachments.splice(this._listAttachments.findIndex(f => f.fileId === file.fileId), 1);
      }
    }
  }

  removeFile(file: any, idx: number) {
    this.uploadedList.splice(idx, 1);
    const index = this.comparisons.indexOf(file['comparison']);
    if (index > -1) {
      this.comparisons.splice(index, 1);
    }
  }

  checkValidateFiles(newFilesArr: any[]) {
    if (this.modelStorage.attachments.length + this.uploadedList.length + newFilesArr.length > 10) {
      this.dialogService.showMessage('error', false, null, 'MSG.GR.M016', null, 'MSG.OK', null).subscribe(
        (res: DialogResult) => {
          this.checkExceedMaxSize(newFilesArr);
        });
    } else {
      this.checkExceedMaxSize(newFilesArr);
    }
  }

  checkExceedMaxSize(newFilesArr: any[]) {
    let isValid = true;
    for (let i = newFilesArr.length - 1; i >= 0; i--) {
      if (newFilesArr[i].size > MAX_SIZE) {
        const comparison = newFilesArr[i].name + newFilesArr[i].size + newFilesArr[i].lastModified + newFilesArr[i].type;
        const index = this.comparisons.indexOf(comparison);
        if (index > -1) {
          this.comparisons.splice(index, 1);
        }
        newFilesArr.splice(i, 1);
        isValid = false;
      } else {
        this.getOrientedImg(newFilesArr[i]);
      }
    }
    if (!isValid) {
      setTimeout(() => {
        this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null);
      });
    }
  }

  clickQuestionnaire(event: any) {
    this.router.navigate(['gr/gr0009', this.groupInfo.id]);
  }

  clickCancel(event: any) {
    if (this.model.isEdit) {
      this.model.isEdit = false;
      this.modelStorage = JSON.parse(JSON.stringify(this.model));
    }
    this.isSending = false;
    this.uploadedList = [];
    this.comparisons = [];
    this.isResetToUserList = true;
    this.listMemberValid.forEach(item => {
      item.isShow = true;
    });
  }

  checkSubmit(event) {
    if (event) {
      this.submitDebounce();
    }
  }

  clickSubmit() {
    this.isSending = false;
    if (!this.modelStorage.contents) {
      return false;
    }
    if (this.modelStorage.attachments.length + this.uploadedList.length <= 10) {
      this.sendData();
    } else {
      this.dialogService.showMessage('error', false, null, 'MSG.GR.M016', null, 'MSG.OK', null);
    }
  }

  sendData() {
    if (this.modelStorage.contents.trim() === '') {
      this.dialogService.showError('VAL.ARTICLE_REQUIRED');
    } else if (this.modelStorage.contents.length > 3000) {
      this.dialogService.showError('VAL.ARTICLE_RANGE');
    } else {
      $('#create-cmt-' + this.articleId).blur();
      this.isSending = true;
      this.getModelSendApi();
    }
  }

  getModelSendApi() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const modelSendApi = {};
    modelSendApi['contents'] = this.modelStorage.contents;
    modelSendApi['attachments'] = [];
    modelSendApi['toUser'] = [];
    const infoList = this.listMemberValid.filter(mem => this.modelStorage.toUser.indexOf(mem.id) > -1);
    for (let i = 0; i < infoList.length; i++) {
      modelSendApi['toUser'].push({'officeUserId': infoList[i].id});
    }

    if (this.modelStorage.attachments.length > 0) {
      for (let j = 0; j < this.modelStorage.attachments.length; j++) {
        modelSendApi['attachments'].push({fileId: this.modelStorage.attachments[j]});
      }
    }

    if (this.model && this.model.attachments) {
      this.model.attachments.filter(fileId => this.modelStorage.attachments.indexOf(fileId) === -1).forEach(item => {
        this.firebaseStorage.ref(`group/${this.groupInfo.id}/${item}`).delete();
      });
    }

    if (this.uploadedList.length > 0) {
      let check = this.uploadedList.length;
      this.firebaseStorage.uploader.group(this.groupInfo.id, this.userSession.officeUserId, this.uploadedList).flatMap(progresses => progresses)
        .subscribe((data) => {
            if (data.done) {
              modelSendApi['attachments'].push({fileId: data.file.id});
              check = check - 1;
              if (check < 1) {
                this.callApi(modelSendApi);
              }
            }
          },
          (error) => {
            this.uploadedList = [];
            this.comparisons = [];
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showError('MSG.ERROR');
            return;
          }
        );
    } else {
      this.callApi(modelSendApi);
    }
  }

  private _resetData() {
    this.isResetToUserList = true;
    this.isSending = false;
    this.uploadedList = [];
    this.comparisons = [];
    if (this.model) {
      this.model.isEdit = false;
      this.modelStorage = JSON.parse(JSON.stringify(this.model));
      this.listMemberValid.forEach(item => {
        item.isShow = true;
      });
    } else {
      this.modelStorage = new EditArticleSettings();
      this.listMemberValid.forEach(item => {
        item.isSelected = false;
        item.isShow = true;
      });
    }
    this.listMemberValid = this.listMemberValid.slice();
  }

  callApi(modelSendApi) {
    if (!this.model) {
      if (this.articleId) {
        // create comment
        modelSendApi['articleId'] = this.articleId;
        this.groupService.postComment(modelSendApi).subscribe(response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this._resetData();
          this._detectchanges();
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
      }
      if (!this.articleId && !this.commentId) {
        // create article
        modelSendApi['groupId'] = this.groupInfo.id;
        this.groupService.postCreateArticle(modelSendApi).subscribe(response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          // If the article is successfully created, delete temporaryArticleContent on the firebase
          setTimeout(() => {
            this.firebaseDatabase.ref(`/user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}/temporaryArticleContent`).remove();
          }, 500);
          this._resetData();
          this._detectchanges();
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
      }
    } else {
      modelSendApi['id'] = this.modelStorage.id;
      if (this.articleId && this.commentId) {
        // edit comment
        modelSendApi['articleId'] = this.articleId;
        this.groupService.putEditComment(modelSendApi).subscribe(response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this._resetData();
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
      } else {
        // edit article
        this.groupService.putEditArticle(modelSendApi).subscribe(response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this._resetData();
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
      }
    }
  }
}
