import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import EventType = FirebaseDatabase.EventType;
import {DialogService} from '../../services/dialog.service';
import {FirAttachments} from '../../models/gr/firebase/fir.attachments';
import {Helper} from '../../common/helper';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Subscription} from 'rxjs/Subscription';

const HEIGHT = 205;
const MAX_WIDTH = 500;

@Component({
  selector: 'app-file-display',
  templateUrl: './file-display.component.html',
  styleUrls: ['./file-display.component.scss'],
  preserveWhitespaces: false
})
export class FileDisplayComponent implements OnInit, OnChanges, OnDestroy {
  @Input('groupId') groupId: string;
  @Input('article') article: any;
  @Input('comment') comment: any;
  @Input() userSession: any;
  @Output() attachedFilesEvent = new EventEmitter<FirAttachments[]>();
  public listAttachments = [];
  private subscription: Subscription;

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private helper: Helper,
              private firebaseStorage: FirebaseStorage) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['article'] || changes['comment']) {
      this.getAttachmentList();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  getAttachmentList() {
    this.listAttachments = [];
    let path = '';
    if (this.comment) {
      path = `comment/${this.article.id}/${this.comment.id}/attachments`;
    } else {
      path = `article/${this.groupId}/${this.article.id}/attachments`;
    }
    this.subscription = this.groupService.getAttachmentsList(this.groupId, path).subscribe(list => {
      this.listAttachments = list;
      for (let i = 0; i < this.listAttachments.length; i++) {
        // Failed to get thumbnail video
        if (this.listAttachments[i].type.startsWith('video')) {
          this.listAttachments[i]['original_url'] = this.listAttachments[i].url;
          this.listAttachments[i].url = 'assets/img/default_video_thumb.svg';
        }
        this.listAttachments[i].type = this.listAttachments[i].original_file_type ? this.listAttachments[i].original_file_type :
          this.helper.getFileClass(this.listAttachments[i]);
        this.drawFrame(this.listAttachments[i]);
      }
      this.attachedFilesEvent.emit(list.length > 0 ? list : null);
    });
    this.eventListener(path);
  }

  eventListener(path) {
    this.groupService.eventListener(path).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this.listAttachments = this.listAttachments.filter(attachment => {
          const id = attachment.original_file_id ? attachment.original_file_id : attachment.fileId;
          return id !== v.value;
        });
        this.attachedFilesEvent.emit(this.listAttachments);
      } else if (v.type === EventType.ChildAdd) {
        // added
        this.groupService.getAttachment(this.groupId, v.value, v.key).subscribe(file => {
          if (file && this.listAttachments.findIndex(f => f.fileId === file.fileId) < 0) {
            // Failed to get thumbnail video
            if (file.type.startsWith('video')) {
              file['original_url'] = file.url;
              file.url = 'assets/img/default_video_thumb.svg';
            }
            file.type = file.original_file_type ? file.original_file_type : this.helper.getFileClass(file);
            this.drawFrame(file);
            this.listAttachments.push(file);
            this.listAttachments = this.groupService.comparatorAttachment(this.listAttachments);
            this.attachedFilesEvent.emit(this.listAttachments);
          }
        });
      }
    });
  }

  drawFrame(file: any) {
    if ((file.type === 'image' || file.type === 'video')) {
      const ratio = file.width / file.height;
      if (file.height <= HEIGHT && file.width < MAX_WIDTH) {
        const value = (file.width > HEIGHT) ? Math.round(HEIGHT * ratio) : HEIGHT;
        file['resizedWidth'] = value + 'px';
      } else {
        if (ratio * HEIGHT < HEIGHT / 3) {
          file['resizedWidth'] = HEIGHT + 'px';
        } else if (ratio * HEIGHT > MAX_WIDTH ) {
          file['resizedWidth'] = MAX_WIDTH + 'px';
        } else {
          file['resizedWidth'] = (ratio * HEIGHT) + 'px';
        }
      }
    }
  }

  downloadFile(event, file: any) {
    event.stopPropagation();
    event.preventDefault();
    this.dialogService.showDownloadDialog(file.name, file.url);
  }

  filePreviewOpen(event, fileId: string) {
    event.preventDefault();
    this.dialogService
      .showFilePreviewDialog(true, 'MSG.DOWNLOAD', 'MSG.FORWARD', {
        groupId: this.groupId,
        roomId: null,
        officeUserId: this.userSession.officeUserId,
        contentsId: 'contentsId',
        articleContentsId: 'articleContentsId',
        fileId: fileId,
        fileList: this.listAttachments
      })
      .subscribe((res) => {
        if (res.buttonName === 'ok') {
          const url = res.payload.value.original_url ? res.payload.value.original_url : res.payload.value.url;
          this.dialogService.showDownloadDialog(res.payload.value.name, url);
        } else if (res.buttonName === 'cancel') {
          const path = `group/${this.groupId}/${fileId}`;
          this.dialogService.showForwardFileDialog(res.payload.value.name, res.payload.value.size, path, null, null);
        }
      });
  }
}
