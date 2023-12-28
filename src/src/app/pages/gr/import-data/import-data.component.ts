import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FileUploader} from 'ng2-file-upload';
import {TranslateService} from '@ngx-translate/core';
import {FormatSizeConverter} from '../../../common/converter/format.size.converter';
import {GroupService} from '../../../services/group.service';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Helper} from '../../../common/helper';
import {EditArticleSettings} from '../../../models/gr/edit-article-settings';
import {DialogResult} from '../../../models/dialog-param';
import {DialogService} from '../../../services/dialog.service';
import {SharedValueService} from "../../../services/shared-value.service";

const URL = 'apiUrl';
const MAX_SIZE = 128 * 1024 * 1024;

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss'],
  preserveWhitespaces: false
})
export class ImportDataComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({url: URL});
  public isImage: boolean[];
  public fileSize: string[];
  public isUpload = false;
  public listMemberValid: any[] = [];
  public modelStorage = new EditArticleSettings();
  isResetNarrowBtnToUser = false;
  isGroupOutside;
  _listAttachments = [];
  userSession: any;
  groupId: string;
  numberIterations: number;

  groupboardContributionTextareaPlaceholder = '';
  submitText;
  isValidatedFiles = true;
  debounce = 400;
  submitDebounce: any;
  errorMsg = '';

  constructor(private router: Router,
              private translate: TranslateService,
              private formatSize: FormatSizeConverter,
              private groupService: GroupService,
              private helper: Helper,
              private dialogService: DialogService,
              private firebaseStorage: FirebaseStorage,
              private activatedRoute: ActivatedRoute,
              private sharedValueService: SharedValueService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    let language = [];
    this.translate.get('GROUPBOARD_CONTRIBUTION').subscribe((msg) => {
      language = msg;
      this.submitText = language['REGIST'];
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      this.groupId = params['groupId'];
      this.groupboardContributionTextareaPlaceholder = language['PLACEHOLDER'];
      this.submitText = language['REGIST'];
    });
    this.submitDebounce = this.helper.debounce(this.clickSubmit, this.debounce, true);
    this.helper.numbericOnlyPaste('number-iterations');
  }
  acceptNumber(event) {
    this.helper.numericOnly(event);
  }

  formatSizeUnits(file) {
    return this.formatSize.formatSizeUnits(file.size);
  }

  checkImageFile(file: File) {
    return (file.size < MAX_SIZE && file.type.startsWith('image'));
  }

  removeOldFile(fileId) {
    if (fileId) {
      if (this.modelStorage.attachments.indexOf(fileId) > -1) {
        this.modelStorage.attachments.splice(this.modelStorage.attachments.indexOf(fileId), 1);
      }
      if (this._listAttachments.findIndex(f => f.fileId === fileId) > -1) {
        this._listAttachments.splice(this._listAttachments.findIndex(f => f.fileId === fileId), 1);
      }
    }
  }

  removeFile(index: number) {
    this.fileSize.splice(index, 1);
    this.isImage.splice(index, 1);
    this.uploader.queue[index].remove();
  }

  removeDuplicates(objects: any[]): Promise<any> {
    let comparison;
    const comparisons = [];
    const result = [];
    return new Promise<any>(resolve => {
      for (let i = 0; i < objects.length; i++) {
        comparison = JSON.stringify(objects[i]);
        if (comparisons.indexOf(comparison) === -1) {
          this.fileSize.push(this.formatSize.formatSizeUnits(this.uploader.queue[i]._file.size));
          this.isImage.push(this.checkImageFile(this.uploader.queue[i]._file));
          result.push(objects[i]);
          comparisons.push(comparison);
        } else {
          this.removeFile(i);
          objects.splice(i, 1);
          i--;
        }
      }
      resolve();
      return result;
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

  changeFields(event: KeyboardEvent) {
    if (this.modelStorage.contents) {
      if (event.keyCode === 13 && event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        this.submitDebounce();
      }
    }
  }

  removeTooptip(event) {
    $('.tooltip').remove();
  }

  async onFileSelected(event: any) {
    this.isImage = [];
    this.fileSize = [];
    let fileObjs = [];
    this.uploader.queue.forEach(function (files, i, array) {
      fileObjs[i] = files.file;
    }.bind(this));
    fileObjs = await this.removeDuplicates(fileObjs);
    this.checkValidateFiles();
  }

  checkValidateFiles() {
    this.isValidatedFiles = true;
    if (this.modelStorage.attachments.length + this.uploader.queue.length > 10) {
      this.isValidatedFiles = false;
      this.dialogService.showMessage('error', false, null, 'MSG.GR.M016', null, 'MSG.OK', null).subscribe(
        (res: DialogResult) => {
          if (this.checkExceedMaxSize()) {
            setTimeout(() => {
              this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null);
            });
          }
        });
    } else {
      if (this.checkExceedMaxSize()) {
        this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null);
      }
    }
  }

  checkExceedMaxSize(): boolean {
    let countExceedSize = 0;
    for (let i = 0; i < this.uploader.queue.length; i++) {
      if (this.uploader.queue[i]._file.size > MAX_SIZE) {
        this.removeFile(i);
        i--;
        countExceedSize++;
      }
    }
    return countExceedSize > 0;
  }



  checkSubmit(event) {
    if (event) {
      this.submitDebounce();
    }
  }

  clickSubmit() {
    if (!this.modelStorage.contents) {
      return false;
    }
    this.checkValidateFiles();
    if (this.isValidatedFiles) {
      this.sendData();
    }
  }

  sendData() {
    this.errorMsg = '';
    if (this.modelStorage.contents.trim() === '') {
      this.dialogService.showError('VAL.ARTICLE_REQUIRED');
    } else if (this.modelStorage.contents.length > 3000) {
      this.dialogService.showError('VAL.ARTICLE_RANGE');
    } else if (!this.numberIterations) {
      this.errorMsg = 'Required';
    } else if (this.numberIterations && (+this.numberIterations === 0 || +this.numberIterations > 100)) {
      this.errorMsg = 'Input value is a number between 1 and 100';
    } else {
      if (this.modelStorage.contents) {
        this.getModelSendApi();
      }
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
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('members', this.listMemberValid);
      form.append('comment', this.modelStorage.contents);
    };

    this.isUpload = true;
    //  this.uploader.uploadAll();
    if (this.modelStorage.attachments.length > 0) {
      for (let j = 0; j < this.modelStorage.attachments.length; j++) {
        modelSendApi['attachments'].push({fileId: this.modelStorage.attachments[j]});
      }
    }


    if (this.uploader.queue.length > 0) {
      let check = this.uploader.queue.length;
      this.firebaseStorage.uploader.group(this.groupId, this.userSession.officeUserId, this.uploader.queue).flatMap(progresses => progresses)
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
            this.uploader.clearQueue();
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

  callApi(modelSendApi) {
    // create article
    modelSendApi['groupId'] = this.groupId;
    modelSendApi['total'] = this.numberIterations;
    this.groupService.postCreateMultipleArticle(modelSendApi).subscribe(response => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelStorage = new EditArticleSettings();
      this.uploader.clearQueue();
      this.router.navigate(['gr/gr0011', this.groupId]);
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }
}
