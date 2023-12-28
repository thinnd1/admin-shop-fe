import {OnInit, Input, Component, AfterContentChecked, OnDestroy} from '@angular/core';
import { DialogService } from '../../services/dialog.service';
import { DateConverter } from '../../common/converter/date.converter';
import { saveAs } from 'file-saver/FileSaver';
import {GroupService} from '../../services/group.service';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import EventType = FirebaseDatabase.EventType;
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ChatService} from '../../services/chat.service';
import {Helper} from '../../common/helper';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Subscription} from 'rxjs/Subscription';
import { ChangeEvent } from 'angular2-virtual-scroll';

@Component({
  selector: 'app-attached-files',
  templateUrl: './attached-files.component.html',
  styleUrls: ['./attached-files.component.scss'],
  preserveWhitespaces: false
})
export class AttachedFilesComponent implements OnInit, AfterContentChecked, OnDestroy {

  @Input() officeUserId: string;
  @Input() groupId: string;
  @Input() roomId: string;
  @Input() listAttachments = [];
  @Input() memberList: any[] = [];

  // typeの種類
  // word image archive pdf excel audio video
  // （mimeTypeではなく、アイコンを表示するためのもの）
  public itemData: any[] = [];
  public preViewItem: any;
  public reOpenParam: any[] = [];
  contributorInfo$ = new BehaviorSubject(null);
  ownerCached: any;
  isFirstLoading = true;
  count: number;
  scrollOptions = {
    page: 0,
    limit: 10
  };
  isLoadMore = false;
  lastLoad = false;
  viewPortItems: any[];
  groupFilesSubscription: Subscription;

  constructor(
    private dialogService: DialogService,
    private dateConverter: DateConverter,
    private groupService: GroupService,
    private firebaseDatabase: FirebaseDatabase,
    private firebaseStorage: FirebaseStorage,
    private chatService: ChatService,
    private helper: Helper
  ) { }

  ngOnInit() {
    this.reOpenParam = [{ officeUserId: this.officeUserId, groupId: this.groupId, roomId: this.roomId,
      memberList: this.memberList, listAttachments: this.listAttachments}];
    if (this.groupId) {
      this.getGroupData(this.groupId);
      this.firebaseDatabase.ref(`attachments/${this.groupId}`).once(EventType.Value).then((snap) => {
        this.count = snap.numChildren();
        this.isFirstLoading = snap.numChildren() > 0;
      });
    } else if (this.roomId && this.listAttachments.length > 0) {
      this.getAttachmentsOfRoom();
    } else {
      this.count = 0;
      this.itemData = [];
      this.isFirstLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.groupFilesSubscription) {
      this.groupFilesSubscription.unsubscribe();
    }
    this.groupFilesSubscription = null;
  }

  ngAfterContentChecked() {
    if (this.preViewItem && this.preViewItem.owner !== this.ownerCached) {
      this.ownerCached = this.preViewItem.owner;
      this.getUserName(this.preViewItem.owner);
    }
  }

  getGroupData(groupId: string) {
    this.getAttachmentsListGroup(groupId, null, this.scrollOptions.limit);
    this.groupService.eventListener(`attachments/${this.groupId}`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        this.itemData = this.itemData.filter(item => item.fileId !== v.value);
        if (v.value === this.preViewItem.fileId) {
          this.preViewItem = this.itemData[0];
          this.getThumbnailPreviewImage();
        }
      } else if (v.type === EventType.ChildAdd) {
        this.groupService.getAttachment(this.groupId, v.value, v.key).subscribe(file => {
          if (this.itemData.findIndex(f => f.fileId === file.fileId) < 0) {
            file.type = this.helper.getFileClass(file);
            this.itemData.unshift(file);
            // this.preViewItem = this.itemData[0];
          }
        });
      }
    });
  }

  /**
   * @param {string} groupId
   * @param {string} fromKey
   * @param limit
   */
  getAttachmentsListGroup(groupId: string, fromKey: string, limit) {
    this.groupFilesSubscription = this.groupService.getAttachmentsGroup(groupId, `attachments/${this.groupId}`, true, fromKey, limit).subscribe(list => {
      if (list.length < this.scrollOptions.limit) {
        this.lastLoad = true;
      }
      this.isFirstLoading = false;
      this.isLoadMore = false;
      list.forEach(item => {
        item.type = this.helper.getFileClass(item);
      });
      this.itemData = this.itemData.concat(list);
      if (!fromKey) {
        this.preViewItem = this.itemData[0];
        this.getThumbnailPreviewImage();
      }
    }, error => {
      this.isFirstLoading = false;
      this.isLoadMore = false;
    });
  }

  getThumbnailPreviewImage() {
    if (this.preViewItem.type === 'image' && !this.preViewItem['thumb_url']) {
      const id = 'thumb_' + this.preViewItem.fileId;
      const path = this.groupId ? `group/${this.groupId}/${id}` : `chat/${this.roomId}/${id}`;
      this.firebaseStorage.downloadURL(path).subscribe(thumbUrl => {
        this.preViewItem['thumb_url'] = thumbUrl;
      }, error => {
        this.preViewItem['thumb_url'] = this.preViewItem.url;
      });
    }
  }

  getAttachmentsOfRoom() {
    this.chatService.getAttachmentsRoom(this.roomId, this.listAttachments).subscribe(list => {
      this.isFirstLoading = false;
      this.itemData = list;
      this.preViewItem = this.itemData[0];
      this.itemData.forEach(item => { item.type = this.helper.getFileClass(item); });
      this.getThumbnailPreviewImage();
    }, error => {
      this.isFirstLoading = false;
    });
  }

  previewShow(item) {
    this.preViewItem = item;
    this.getThumbnailPreviewImage();
  }

  selectItem(item) {
    return item === this.preViewItem;
  }

  dateConvert(date) {
    return this.dateConverter.moment(date, 'llll');
  }

  forward($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    const path = `group/${this.groupId}/${item.fileId}`;
    this.dialogService.showForwardFileDialog(item.name, item.size, path, 'showAttachedFilesDialog', this.reOpenParam);
  }

  download($event, item) {
    $event.stopPropagation();
    $event.preventDefault();
    this.dialogService.showDownloadDialog(item.name, item.url);
  }

  delete($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dialogService.showDeleteDialog(item, 'showAttachedFilesDialog', this.reOpenParam);
  }

  getUserName(officeUserId) {
      if (officeUserId) {
        if (this.memberList.findIndex(mem => mem.id === officeUserId) > -1) {
          const user = this.memberList.find(mem => mem.id === officeUserId);
          this.contributorInfo$.next(user);
        } else {
          this.groupService.getUser(officeUserId).subscribe(user => {
            this.contributorInfo$.next(user);
          });
        }
      }
  }

  onListChange(event: ChangeEvent) {
    if (event.end !== this.itemData.length) {
      return;
    }
    if (this.groupId && this.itemData.length > 0) {
      const start = this.itemData[this.itemData.length - 1].key;
      this.isLoadMore = true;
      this.getAttachmentsListGroup(this.groupId, start, this.scrollOptions.limit);
    }
  }
}
