import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {FileType} from 'ng2-file-upload/file-upload/file-type.class';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import {DialogService} from '../../services/dialog.service';
import {Helper} from '../../common/helper';
import {Observable} from 'rxjs/Observable';
import {FirAttachments} from '../../models/gr/firebase/fir.attachments';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Subject} from 'rxjs/Subject';

const HEIGHT = 205;
const MAX_WIDTH = 500;
const MAX_HEIGHT = 205;

@Component({
  selector: 'app-report-file-display',
  templateUrl: './report-file-display.component.html',
  styleUrls: ['./report-file-display.component.scss'],
  preserveWhitespaces: false
})
export class ReportFileDisplayComponent implements OnInit, OnChanges {
  @Input('path') path: string;
  @Input('comment') comment: any;
  listAttachments = [];
  attachmentIds = [];

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private firebaseStorage: FirebaseStorage,
              private helper: Helper) {
  }

  ngOnInit() {
    this.getAttachmentList().subscribe((next) => {
      for (let i = 0; i < next.length; i++) {
        this.getMediaData(next[i]).subscribe(() => {
          next[i]['_thumb'] = next[i]['thumb_url'];
        });
      }
      this.listAttachments = next;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comment']) {
      this.getAttachmentList().subscribe((next) => {
        for (let i = 0; i < next.length; i++) {
          this.getMediaData(next[i]).subscribe(() => {
            next[i]['_thumb'] = next[i]['thumb_url'];
          });
        }
        this.listAttachments = next;
      });
    }
  }

  getAttachmentList() {
    return Observable.create(subscribe => {
      if (!this.path) {
        subscribe.next([]);
      }
      const listReq = this.comment.fileIds.map(item => {
        const path = this.path + '/' + item;
        return this.firebaseStorage.metadata(path);
      });
      Observable.forkJoin(listReq).subscribe((fileList: any[]) => {
        const arrAttachments: FirAttachments[] = [];
        fileList.forEach(file => {
          const attachmentObj = new FirAttachments;
          attachmentObj.url = file.downloadURL;
          attachmentObj.fileId = file.name;
          attachmentObj.name = file.customMetadata.name;
          attachmentObj.size = file.size;
          attachmentObj.type = file.contentType;
          attachmentObj.createdAt = file.timeCreated;
          attachmentObj.owner = file.customMetadata.owner;
          attachmentObj.height = file.customMetadata.height;
          attachmentObj.width = file.customMetadata.width;
          arrAttachments.push(attachmentObj);
        });
        subscribe.next(arrAttachments);
        subscribe.complete();
      }, err => {
        subscribe.error(err);
      });
    });
  }

  getMediaData(file) {
    const subject = new Subject();
    file.type = this.helper.getFileClass(file);
    if (file.type === 'image') {

      file['resizedWidth'] = this.getResizedWidth(file);
      const id = 'thumb_' + file.fileId;
      this.firebaseStorage.downloadURL(`${this.path}/${id}`).subscribe(thumbUrl => {
        file['thumb_url'] = thumbUrl;
        subject.next();
      }, error => {
        file['thumb_url'] = file.url;
        subject.next();
      });
    }
    if (file.type === 'video') {
      file['resizedWidth'] = this.getResizedWidth(file);
      file['thumb_url'] = file.url;
      subject.next();
    }
    return subject;
  }

  getResizedWidth(data: any) {
    let ratio = 0;
    if (data && data.width > 0 && data.height > 0) {
      if (MAX_WIDTH > data.width  && MAX_HEIGHT > data.height) {
        return;
      }
      const scale_width = MAX_WIDTH / data.width;
      const scale_height = MAX_HEIGHT / data.height;

      ratio = Math.min(scale_width, scale_height);
      return data.width * ratio + 'px';
    }
  }

  getFileType(file) {
    return this.helper.getFileClass(file);
  }

  downloadFile(event, file: any) {
    event.stopPropagation();
    event.preventDefault();
    this.dialogService.showDownloadDialog(file.name, file.url);
  }

  filePreviewOpen(event, fileId: string) {
    this.dialogService
      .showFilePreviewDialog(true, 'MSG.DOWNLOAD', null, {
        groupId: 'groupId',
        roomId: '',
        officeUserId: 'officeUserId',
        contentsId: 'contentsId',
        articleContentsId: 'articleContentsId',
        fileId: fileId,
        fileList: this.listAttachments
      })
      .subscribe((res) => {
        if (res.buttonName === 'ok') {
          this.dialogService.showDownloadDialog(res.payload.value.name, res.payload.value.url);
        }
      });
  }
}
